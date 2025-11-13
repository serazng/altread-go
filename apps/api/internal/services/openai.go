package services

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"altread-go/api/internal/config"
	"altread-go/api/internal/constants"
	"altread-go/api/internal/schemas"

	"github.com/sashabaranov/go-openai"
)

// OpenAIService handles OpenAI API interactions for alt text generation
type OpenAIService struct {
	client     *openai.Client
	cfg        *config.Config
	cache      *CacheService
	db         *DatabaseService
	logService *LogService
}

// NewOpenAIService creates a new OpenAI service instance
func NewOpenAIService(cfg *config.Config, cache *CacheService, db *DatabaseService) *OpenAIService {
	var client *openai.Client
	if cfg.OpenAIAPIKey != "" {
		client = openai.NewClient(cfg.OpenAIAPIKey)
	}

	return &OpenAIService{
		client:     client,
		cfg:        cfg,
		cache:      cache,
		db:         db,
		logService: GetLogService(),
	}
}

// ValidateImageInput validates base64-encoded image data format and size
func (s *OpenAIService) ValidateImageInput(imageData string) error {
	if imageData == "" {
		return fmt.Errorf("no image data provided")
	}

	if !strings.HasPrefix(imageData, "data:image/") {
		return fmt.Errorf("invalid image format. Expected base64 encoded image with data:image/ prefix")
	}

	parts := strings.SplitN(imageData, ",", 2)
	if len(parts) != 2 {
		return fmt.Errorf("invalid base64 encoding")
	}

	header := parts[0]
	base64Data := parts[1]

	decoded, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return fmt.Errorf("invalid base64 encoding: %w", err)
	}

	if len(decoded) > constants.MaxImageSizeBytes {
		return fmt.Errorf("image too large. Maximum size is 20MB")
	}

	validFormat := false
	for _, format := range constants.AllowedImageFormats {
		if strings.Contains(strings.ToLower(header), format) {
			validFormat = true
			break
		}
	}

	if !validFormat {
		return fmt.Errorf("unsupported image format. Supported: JPEG, PNG, GIF, WebP")
	}

	return nil
}

// BuildPrompt constructs the prompt for alt text generation based on options
func (s *OpenAIService) BuildPrompt(options map[string]interface{}) string {
	prompt := "Generate a concise alt text description for this image in 1-2 sentences (max 150 characters). Focus on the most important elements. "

	if includeObjects, ok := options["include_objects"].(bool); ok && includeObjects {
		prompt += "Include descriptions of objects, people, and activities visible in the image. "
	}

	if includeColors, ok := options["include_colors"].(bool); ok && includeColors {
		prompt += "Mention colors and visual elements. "
	}

	if includeText, ok := options["include_text"].(bool); ok && includeText {
		prompt += "Include any text that appears in the image. "
	}

	if maxLength, ok := options["max_length"].(float64); ok {
		prompt += fmt.Sprintf("Keep the description under %.0f characters. ", maxLength)
	}

	prompt += "Keep it brief and informative for screen readers. Aim for 100-150 characters maximum."

	return prompt
}

// GenerateAltText generates alt text for an image using OpenAI API with caching and fallback model support
func (s *OpenAIService) GenerateAltText(ctx context.Context, req *schemas.GenerateAltTextRequest) (*schemas.GenerateAltTextResponse, error) {
	startTime := time.Now()

	if resp, err := s.validateAndCheckClient(req.Image, startTime, ctx); resp != nil || err != nil {
		return resp, err
	}

	imageHash := s.generateImageHash(req.Image)
	if cached := s.getCachedResult(ctx, imageHash, startTime); cached != nil {
		return cached, nil
	}

	altText, model, err := s.generateWithFallback(ctx, req)
	if err != nil {
		return s.handleGenerationError(ctx, imageHash, err.Error(), startTime), nil
	}

	if altText == "" {
		return s.handleGenerationError(ctx, imageHash, "Failed to generate alt text", startTime), nil
	}

	return s.handleSuccess(ctx, imageHash, altText, model, startTime), nil
}

func (s *OpenAIService) validateAndCheckClient(imageData string, startTime time.Time, ctx context.Context) (*schemas.GenerateAltTextResponse, error) {
	if err := s.ValidateImageInput(imageData); err != nil {
		processingTime := int(time.Since(startTime).Milliseconds())
		imageHash := s.generateImageHash(imageData)
		go s.trackFailedGeneration(context.Background(), imageHash, processingTime, err.Error())
		return &schemas.GenerateAltTextResponse{
			Success:        false,
			AltText:        "",
			ProcessingTime: processingTime,
			Error:          stringPtr(err.Error()),
		}, nil
	}

	if s.client == nil {
		processingTime := int(time.Since(startTime).Milliseconds())
		imageHash := s.generateImageHash(imageData)
		go s.trackFailedGeneration(context.Background(), imageHash, processingTime, "OpenAI API key is not configured")
		return &schemas.GenerateAltTextResponse{
			Success:        false,
			AltText:        "",
			ProcessingTime: processingTime,
			Error:          stringPtr("OpenAI API key is not configured. Please add your API key to the .env file."),
		}, nil
	}

	return nil, nil
}

func (s *OpenAIService) getCachedResult(ctx context.Context, imageHash string, startTime time.Time) *schemas.GenerateAltTextResponse {
	cached, err := s.cache.GetCachedResult(ctx, imageHash)
	if err != nil || cached == nil {
		return nil
	}

	processingTime := int(time.Since(startTime).Milliseconds())
	var errorPtr *string
	if cached.Error != "" {
		errorPtr = stringPtr(cached.Error)
	}
	return &schemas.GenerateAltTextResponse{
		Success:        cached.Success,
		AltText:        cached.AltText,
		ProcessingTime: processingTime,
		Error:          errorPtr,
	}
}

func (s *OpenAIService) generateWithFallback(ctx context.Context, req *schemas.GenerateAltTextRequest) (string, string, error) {
	prompt := s.BuildPrompt(req.Options)
	model := s.cfg.OpenAIModel

	response, err := s.callOpenAIAPI(ctx, model, prompt, req.Image)
	if err != nil && model != s.cfg.OpenAIModelFallback {
		model = s.cfg.OpenAIModelFallback
		response, err = s.callOpenAIAPI(ctx, model, prompt, req.Image)
	}

	return strings.TrimSpace(response), model, err
}

func (s *OpenAIService) handleGenerationError(ctx context.Context, imageHash, errorMsg string, startTime time.Time) *schemas.GenerateAltTextResponse {
	processingTime := int(time.Since(startTime).Milliseconds())
	resultData := map[string]interface{}{
		"alt_text":        "",
		"processing_time": processingTime,
		"error":           errorMsg,
		"cached_at":       time.Now().Unix(),
	}
	go s.cache.CacheResult(ctx, imageHash, resultData, false)
	go s.trackFailedGeneration(context.Background(), imageHash, processingTime, errorMsg)

	return &schemas.GenerateAltTextResponse{
		Success:        false,
		AltText:        "",
		ProcessingTime: processingTime,
		Error:          stringPtr(errorMsg),
	}
}

func (s *OpenAIService) handleSuccess(ctx context.Context, imageHash, altText, model string, startTime time.Time) *schemas.GenerateAltTextResponse {
	processingTime := int(time.Since(startTime).Milliseconds())
	resultData := map[string]interface{}{
		"alt_text":        altText,
		"processing_time": processingTime,
		"cached_at":       time.Now().Unix(),
		"model_used":      model,
	}
	go s.cache.CacheResult(ctx, imageHash, resultData, true)
	go s.trackSuccessfulGeneration(context.Background(), imageHash, processingTime, altText, model)

	confidence := 0.95
	return &schemas.GenerateAltTextResponse{
		Success:        true,
		AltText:        altText,
		Confidence:     &confidence,
		ProcessingTime: processingTime,
	}
}

func (s *OpenAIService) callOpenAIAPI(ctx context.Context, model, prompt, imageData string) (string, error) {
	req := openai.ChatCompletionRequest{
		Model:       model,
		MaxTokens:   s.cfg.OpenAIMaxTokens,
		Temperature: constants.DefaultTemperature,
		Messages: []openai.ChatCompletionMessage{
			{
				Role: openai.ChatMessageRoleUser,
				MultiContent: []openai.ChatMessagePart{
					{
						Type: openai.ChatMessagePartTypeText,
						Text: prompt,
					},
					{
						Type: openai.ChatMessagePartTypeImageURL,
						ImageURL: &openai.ChatMessageImageURL{
							URL:    imageData,
							Detail: openai.ImageURLDetailAuto,
						},
					},
				},
			},
		},
	}

	resp, err := s.client.CreateChatCompletion(ctx, req)
	if err != nil {
		return "", err
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no choices in response")
	}

	return resp.Choices[0].Message.Content, nil
}

func (s *OpenAIService) generateImageHash(imageData string) string {
	hash := sha256.Sum256([]byte(imageData))
	return fmt.Sprintf("%x", hash)
}

func (s *OpenAIService) trackSuccessfulGeneration(ctx context.Context, imageHash string, processingTime int, altText string, model string) {
	now := time.Now()
	fileName := fmt.Sprintf("image_%d.jpg", now.Unix())

	event := &imageUploadEvent{
		FileName:         fileName,
		FileSize:         0,
		FileType:         "image/jpeg",
		ImageHash:        imageHash,
		AltText:          altText,
		ProcessingTimeMS: &processingTime,
		Success:          true,
	}

	if err := s.db.TrackImageUpload(ctx, event); err != nil {
		s.logService.Log("error", "openai", fmt.Sprintf("Failed to track successful generation: %v", err), nil, nil)
	}
}

func (s *OpenAIService) trackFailedGeneration(ctx context.Context, imageHash string, processingTime int, errorMessage string) {
	now := time.Now()
	fileName := fmt.Sprintf("image_%d.jpg", now.Unix())

	event := &imageUploadEvent{
		FileName:         fileName,
		FileSize:         0,
		FileType:         "image/jpeg",
		ImageHash:        imageHash,
		ProcessingTimeMS: &processingTime,
		Success:          false,
		ErrorMessage:     stringPtr(errorMessage),
	}

	if err := s.db.TrackImageUpload(ctx, event); err != nil {
		s.logService.Log("error", "openai", fmt.Sprintf("Failed to track failed generation: %v", err), nil, nil)
	}
}

