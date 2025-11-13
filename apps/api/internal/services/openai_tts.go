package services

import (
	"context"
	"fmt"
	"io"

	"altread-go/api/internal/config"
	"altread-go/api/internal/constants"
	"altread-go/api/internal/schemas"

	"github.com/sashabaranov/go-openai"
)

// OpenAITTSService handles OpenAI TTS API interactions
type OpenAITTSService struct {
	client          *openai.Client
	cfg             *config.Config
	availableVoices []map[string]string
}

// NewOpenAITTSService creates a new OpenAI TTS service instance
func NewOpenAITTSService(cfg *config.Config) *OpenAITTSService {
	voices := []map[string]string{
		{"id": constants.VoiceAlloy, "name": "Alloy", "description": "Balanced and clear"},
		{"id": constants.VoiceEcho, "name": "Echo", "description": "Deep and calm"},
		{"id": constants.VoiceFable, "name": "Fable", "description": "Warm and expressive"},
		{"id": constants.VoiceOnyx, "name": "Onyx", "description": "Authoritative and firm"},
		{"id": constants.VoiceNova, "name": "Nova", "description": "Friendly and enthusiastic"},
		{"id": constants.VoiceShimmer, "name": "Shimmer", "description": "Crisp and pleasant"},
	}

	var client *openai.Client
	if cfg.OpenAIAPIKey != "" {
		client = openai.NewClient(cfg.OpenAIAPIKey)
	}

	return &OpenAITTSService{
		client:          client,
		cfg:             cfg,
		availableVoices: voices,
	}
}

// GetAvailableVoices returns the list of available OpenAI TTS voices
func (s *OpenAITTSService) GetAvailableVoices() []map[string]string {
	return s.availableVoices
}

// ValidateVoice checks if the provided voice is a valid OpenAI TTS voice
func (s *OpenAITTSService) ValidateVoice(voice string) bool {
	for _, v := range s.availableVoices {
		if v["id"] == voice {
			return true
		}
	}
	return false
}

// GenerateSpeech generates speech audio from text using OpenAI TTS API
func (s *OpenAITTSService) GenerateSpeech(ctx context.Context, req *schemas.TTSRequest) (*schemas.TTSResponse, error) {
	if s.client == nil {
		errorMsg := "OpenAI client not initialized. Please check your API key."
		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    stringPtr(constants.ErrCodeClientNotInitialized),
		}, nil
	}

	if req.Text == "" || len(req.Text) == 0 {
		errorMsg := "Text is required for speech generation"
		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    stringPtr(constants.ErrCodeMissingText),
		}, nil
	}

	if !s.ValidateVoice(req.Voice) {
		errorMsg := fmt.Sprintf("Invalid voice selected. Valid voices: %v", s.GetVoiceIDs())
		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    stringPtr(constants.ErrCodeInvalidVoice),
		}, nil
	}

	if len(req.Text) > constants.MaxTextLength {
		errorMsg := fmt.Sprintf("Text too long. Maximum %d characters allowed.", constants.MaxTextLength)
		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    stringPtr(constants.ErrCodeTextTooLong),
		}, nil
	}

	model := constants.DefaultTTSModel
	if req.Model != nil {
		model = *req.Model
	}

	speed := constants.DefaultTTSSpeed
	if req.Speed != nil {
		speed = *req.Speed
	}

	format := constants.DefaultTTSFormat
	if req.ResponseFormat != nil {
		format = *req.ResponseFormat
	}

	ttsReq := openai.CreateSpeechRequest{
		Model:          openai.SpeechModel(model),
		Input:          req.Text,
		Voice:          openai.SpeechVoice(req.Voice),
		Speed:          speed,
		ResponseFormat: openai.SpeechResponseFormat(format),
	}

	resp, err := s.client.CreateSpeech(ctx, ttsReq)
	if err != nil {
		errorMsg := "Failed to generate speech"
		code := constants.ErrCodeTTSGenerationError

		if openaiErr, ok := err.(*openai.APIError); ok {
			switch openaiErr.Code {
			case "insufficient_quota":
				errorMsg = "OpenAI API quota exceeded"
				code = constants.ErrCodeQuotaExceeded
			case "invalid_api_key":
				errorMsg = "Invalid OpenAI API key"
				code = constants.ErrCodeInvalidAPIKey
			case "rate_limit_exceeded":
				errorMsg = "OpenAI API rate limit exceeded"
				code = constants.ErrCodeRateLimitExceeded
			}
		}

		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    &code,
		}, nil
	}

	audioData, err := io.ReadAll(resp)
	if err != nil {
		errorMsg := "Failed to read audio response"
		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    stringPtr(constants.ErrCodeReadError),
		}, nil
	}

	return &schemas.TTSResponse{
		Success:     true,
		AudioBuffer: audioData,
	}, nil
}

// GetVoiceIDs returns a list of available voice IDs
func (s *OpenAITTSService) GetVoiceIDs() []string {
	ids := make([]string, len(s.availableVoices))
	for i, v := range s.availableVoices {
		ids[i] = v["id"]
	}
	return ids
}
