package v1

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"altread-go/api/internal/schemas"
	"altread-go/api/internal/services"

	"github.com/labstack/echo/v4"
)

type VoiceHandler struct {
	ttsService *services.OpenAITTSService
	dbService  *services.DatabaseService
}

func NewVoiceHandler(ttsService *services.OpenAITTSService, dbService *services.DatabaseService) *VoiceHandler {
	return &VoiceHandler{
		ttsService: ttsService,
		dbService:  dbService,
	}
}

func (h *VoiceHandler) GenerateSpeech(c echo.Context) error {
	var req schemas.TTSRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request body",
			"code":    "INVALID_REQUEST",
		})
	}

	if req.Text == "" || strings.TrimSpace(req.Text) == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Text is required for speech generation",
			"code":    "MISSING_TEXT",
		})
	}

	if req.Voice == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Voice is required",
			"code":    "MISSING_VOICE",
		})
	}

	openaiVoices := []string{"alloy", "echo", "fable", "onyx", "nova", "shimmer"}
	validVoice := false
	for _, v := range openaiVoices {
		if v == req.Voice {
			validVoice = true
			break
		}
	}

	if !validVoice {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Only OpenAI voices are supported. Valid voices: " + strings.Join(openaiVoices, ", "),
			"code":    "INVALID_VOICE",
		})
	}

	if len(req.Text) > 4096 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Text too long. Maximum 4096 characters allowed.",
			"code":    "TEXT_TOO_LONG",
		})
	}

	ctx := c.Request().Context()
	response, err := h.ttsService.GenerateSpeech(ctx, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to generate speech",
			"code":    "TTS_GENERATION_ERROR",
		})
	}

	if !response.Success {
		return c.JSON(http.StatusBadRequest, response)
	}

	go func() {
		event := &schemas.VoicePlayEvent{
			VoiceName:    req.Voice,
			TextLength:   len(req.Text),
			DurationMS:   0, // We don't have duration info from OpenAI TTS
			Success:      true,
			ErrorMessage: nil,
		}
		_ = h.dbService.TrackVoicePlayFromSchema(context.Background(), event)
	}()

	c.Response().Header().Set("Content-Type", "audio/mpeg")
	c.Response().Header().Set("Content-Length", fmt.Sprintf("%d", len(response.AudioBuffer)))
	c.Response().Header().Set("Cache-Control", "no-cache")

	c.Response().WriteHeader(http.StatusOK)
	_, err = c.Response().Write(response.AudioBuffer)
	if err != nil {
		return err
	}
	return nil
}

func (h *VoiceHandler) GetOpenAIVoices(c echo.Context) error {
	voices := h.ttsService.GetAvailableVoices()

	voiceObjects := make([]map[string]interface{}, len(voices))
	for i, v := range voices {
		voiceObjects[i] = map[string]interface{}{
			"id":          v["id"],
			"name":        v["name"],
			"description": v["description"],
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"voices":  voiceObjects,
	})
}

func (h *VoiceHandler) TrackVoicePlay(c echo.Context) error {
	var event schemas.VoicePlayEvent
	if err := c.Bind(&event); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request body",
			"code":    "INVALID_REQUEST",
		})
	}

	if event.VoiceName == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Voice name is required",
			"code":    "MISSING_VOICE_NAME",
		})
	}

	openaiVoices := []string{"alloy", "echo", "fable", "onyx", "nova", "shimmer"}
	validVoice := false
	for _, v := range openaiVoices {
		if v == event.VoiceName {
			validVoice = true
			break
		}
	}

	if !validVoice {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Only OpenAI voices are supported. Valid voices: " + strings.Join(openaiVoices, ", "),
			"code":    "INVALID_VOICE_NAME",
		})
	}

	ctx := c.Request().Context()
	if err := h.dbService.TrackVoicePlayFromSchema(ctx, &event); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to track voice play",
			"code":    "VOICE_TRACKING_ERROR",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Voice play tracked successfully",
	})
}
