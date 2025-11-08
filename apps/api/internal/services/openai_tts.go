package services

import (
	"context"
	"fmt"
	"io"

	"altread-go/api/internal/config"
	"altread-go/api/internal/schemas"

	"github.com/sashabaranov/go-openai"
)

type OpenAITTSService struct {
	client          *openai.Client
	cfg             *config.Config
	availableVoices []map[string]string
}

func NewOpenAITTSService(cfg *config.Config) *OpenAITTSService {
	voices := []map[string]string{
		{"id": "alloy", "name": "Alloy", "description": "Balanced and clear"},
		{"id": "echo", "name": "Echo", "description": "Deep and calm"},
		{"id": "fable", "name": "Fable", "description": "Warm and expressive"},
		{"id": "onyx", "name": "Onyx", "description": "Authoritative and firm"},
		{"id": "nova", "name": "Nova", "description": "Friendly and enthusiastic"},
		{"id": "shimmer", "name": "Shimmer", "description": "Crisp and pleasant"},
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

func (s *OpenAITTSService) GetAvailableVoices() []map[string]string {
	return s.availableVoices
}

func (s *OpenAITTSService) ValidateVoice(voice string) bool {
	for _, v := range s.availableVoices {
		if v["id"] == voice {
			return true
		}
	}
	return false
}

func (s *OpenAITTSService) GenerateSpeech(ctx context.Context, req *schemas.TTSRequest) (*schemas.TTSResponse, error) {
	if s.client == nil {
		errorMsg := "OpenAI client not initialized. Please check your API key."
		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    stringPtr("CLIENT_NOT_INITIALIZED"),
		}, nil
	}

	if req.Text == "" || len(req.Text) == 0 {
		errorMsg := "Text is required for speech generation"
		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    stringPtr("MISSING_TEXT"),
		}, nil
	}

	if !s.ValidateVoice(req.Voice) {
		errorMsg := fmt.Sprintf("Invalid voice selected. Valid voices: %v", s.GetVoiceIDs())
		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    stringPtr("INVALID_VOICE"),
		}, nil
	}

	if len(req.Text) > 4096 {
		errorMsg := "Text too long. Maximum 4096 characters allowed."
		return &schemas.TTSResponse{
			Success: false,
			Error:   &errorMsg,
			Code:    stringPtr("TEXT_TOO_LONG"),
		}, nil
	}

	model := "tts-1"
	if req.Model != nil {
		model = *req.Model
	}

	speed := 1.0
	if req.Speed != nil {
		speed = *req.Speed
	}

	format := "mp3"
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
		code := "TTS_GENERATION_ERROR"

		if openaiErr, ok := err.(*openai.APIError); ok {
			switch openaiErr.Code {
			case "insufficient_quota":
				errorMsg = "OpenAI API quota exceeded"
				code = "QUOTA_EXCEEDED"
			case "invalid_api_key":
				errorMsg = "Invalid OpenAI API key"
				code = "INVALID_API_KEY"
			case "rate_limit_exceeded":
				errorMsg = "OpenAI API rate limit exceeded"
				code = "RATE_LIMIT_EXCEEDED"
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
			Code:    stringPtr("READ_ERROR"),
		}, nil
	}

	return &schemas.TTSResponse{
		Success:     true,
		AudioBuffer: audioData,
	}, nil
}

func (s *OpenAITTSService) GetVoiceIDs() []string {
	ids := make([]string, len(s.availableVoices))
	for i, v := range s.availableVoices {
		ids[i] = v["id"]
	}
	return ids
}
