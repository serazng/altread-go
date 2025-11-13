package v1

import (
	"fmt"
	"net/http"
	"strings"

	"altread-go/api/internal/constants"
	"altread-go/api/internal/schemas"
	"altread-go/api/internal/services"

	"github.com/labstack/echo/v4"
)

// VoiceHandler handles HTTP requests for TTS voice operations
type VoiceHandler struct {
	ttsService *services.OpenAITTSService
	dbService  *services.DatabaseService
}

// NewVoiceHandler creates a new voice handler instance
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
			"code":    constants.ErrCodeInvalidRequest,
		})
	}

	if req.Text == "" || strings.TrimSpace(req.Text) == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Text is required for speech generation",
			"code":    constants.ErrCodeMissingText,
		})
	}

	if req.Voice == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Voice is required",
			"code":    constants.ErrCodeMissingVoice,
		})
	}

	if !h.ttsService.ValidateVoice(req.Voice) {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Only OpenAI voices are supported. Valid voices: " + strings.Join(constants.OpenAIVoiceList, ", "),
			"code":    constants.ErrCodeInvalidVoice,
		})
	}

	if len(req.Text) > constants.MaxTextLength {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("Text too long. Maximum %d characters allowed.", constants.MaxTextLength),
			"code":    constants.ErrCodeTextTooLong,
		})
	}

	ctx := c.Request().Context()
	response, err := h.ttsService.GenerateSpeech(ctx, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to generate speech",
			"code":    constants.ErrCodeTTSGenerationError,
		})
	}

	if !response.Success {
		return c.JSON(http.StatusBadRequest, response)
	}

	go func() {
		event := &schemas.VoicePlayEvent{
			VoiceName:    req.Voice,
			TextLength:   len(req.Text),
			DurationMS:   0,
			Success:      true,
			ErrorMessage: nil,
		}
		_ = h.dbService.TrackVoicePlayFromSchema(ctx, event)
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

	voiceObjects := make([]VoiceInfo, len(voices))
	for i, v := range voices {
		voiceObjects[i] = VoiceInfo{
			ID:          v["id"],
			Name:        v["name"],
			Description: v["description"],
		}
	}

	return c.JSON(http.StatusOK, GetVoicesResponse{
		Success: true,
		Voices:  voiceObjects,
	})
}
