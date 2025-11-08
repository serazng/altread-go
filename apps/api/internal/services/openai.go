package services

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"altread-go/api/internal/config"
	"altread-go/api/internal/schemas"

	"github.com/sashabaranov/go-openai"
)

type OpenAIService struct {
	client *openai.Client
	cfg    *config.Config
	cache  *CacheService
	db     *DatabaseService
}

func NewOpenAIService(cfg *config.Config, cache *CacheService, db *DatabaseService) *OpenAIService {
	var client *openai.Client
	if cfg.OpenAIAPIKey != "" {
		client = openai.NewClient(cfg.OpenAIAPIKey)
	}

	return &OpenAIService{
		client: client,
		cfg:    cfg,
		cache:  cache,
		db:     db,
	}
}

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

	if len(decoded) > 20*1024*1024 {
		return fmt.Errorf("image too large. Maximum size is 20MB")
	}

	allowedFormats := []string{"jpeg", "jpg", "png", "gif", "webp"}
	validFormat := false
	for _, fmt := range allowedFormats {
		if strings.Contains(strings.ToLower(header), fmt) {
			validFormat = true
			break
		}
	}

	if !validFormat {
		return fmt.Errorf("unsupported image format. Supported: JPEG, PNG, GIF, WebP")
	}

	return nil
}

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

func (s *OpenAIService) GenerateAltText(ctx context.Context, req *schemas.GenerateAltTextRequest) (*schemas.GenerateAltTextResponse, error) {
	startTime := time.Now()

	if err := s.ValidateImageInput(req.Image); err != nil {
		processingTime := int(time.Since(startTime).Milliseconds())
		imageHash := s.generateImageHash(req.Image)
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
		imageHash := s.generateImageHash(req.Image)
		go s.trackFailedGeneration(context.Background(), imageHash, processingTime, "OpenAI API key is not configured")
		return &schemas.GenerateAltTextResponse{
			Success:        false,
			AltText:        "",
			ProcessingTime: processingTime,
			Error:          stringPtr("OpenAI API key is not configured. Please add your API key to the .env file."),
		}, nil
	}

	imageHash := s.generateImageHash(req.Image)

	if cached, err := s.cache.GetCachedResult(ctx, imageHash); err == nil && cached != nil {
		processingTime := int(time.Since(startTime).Milliseconds())
		go s.trackCacheHit(context.Background(), imageHash, processingTime)
		return &schemas.GenerateAltTextResponse{
			Success:        cached["success"].(bool),
			AltText:        getStringFromMap(cached, "alt_text"),
			ProcessingTime: processingTime,
			Error:          getStringPtrFromMap(cached, "error"),
		}, nil
	}

	prompt := s.BuildPrompt(req.Options)

	model := s.cfg.OpenAIModel
	response, err := s.callOpenAIAPI(ctx, model, prompt, req.Image)
	if err != nil {
		if model != s.cfg.OpenAIModelFallback {
			model = s.cfg.OpenAIModelFallback
			response, err = s.callOpenAIAPI(ctx, model, prompt, req.Image)
		}
	}

	if err != nil {
		processingTime := int(time.Since(startTime).Milliseconds())
		errorMsg := err.Error()

		resultData := map[string]interface{}{
			"alt_text":        "",
			"processing_time": processingTime,
			"error":           errorMsg,
			"cached_at":       time.Now().Unix(),
		}
		go s.cache.CacheResult(context.Background(), imageHash, resultData, false)
		go s.trackFailedGeneration(context.Background(), imageHash, processingTime, errorMsg)

		return &schemas.GenerateAltTextResponse{
			Success:        false,
			AltText:        "",
			ProcessingTime: processingTime,
			Error:          stringPtr(errorMsg),
		}, nil
	}

	altText := strings.TrimSpace(response)
	if altText == "" {
		processingTime := int(time.Since(startTime).Milliseconds())
		errorMsg := "Failed to generate alt text"
		go s.trackFailedGeneration(context.Background(), imageHash, processingTime, errorMsg)
		return &schemas.GenerateAltTextResponse{
			Success:        false,
			AltText:        "",
			ProcessingTime: processingTime,
			Error:          stringPtr(errorMsg),
		}, nil
	}

	processingTime := int(time.Since(startTime).Milliseconds())

	resultData := map[string]interface{}{
		"alt_text":        altText,
		"processing_time": processingTime,
		"cached_at":       time.Now().Unix(),
		"model_used":      model,
	}
	go s.cache.CacheResult(context.Background(), imageHash, resultData, true)
	go s.trackSuccessfulGeneration(context.Background(), imageHash, processingTime, altText, model)

	confidence := 0.95
	return &schemas.GenerateAltTextResponse{
		Success:        true,
		AltText:        altText,
		Confidence:     &confidence,
		ProcessingTime: processingTime,
	}, nil
}

func (s *OpenAIService) callOpenAIAPI(ctx context.Context, model, prompt, imageData string) (string, error) {
	req := openai.ChatCompletionRequest{
		Model:       model,
		MaxTokens:   s.cfg.OpenAIMaxTokens,
		Temperature: 0.3,
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
		fmt.Printf("Failed to track successful generation: %v\n", err)
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
		fmt.Printf("Failed to track failed generation: %v\n", err)
	}
}

func (s *OpenAIService) trackCacheHit(ctx context.Context, imageHash string, processingTime int) {
}

func getStringFromMap(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func getStringPtrFromMap(m map[string]interface{}, key string) *string {
	if v, ok := m[key].(string); ok && v != "" {
		return &v
	}
	return nil
}
