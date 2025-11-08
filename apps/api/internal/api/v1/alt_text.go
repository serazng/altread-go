package v1

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"altread-go/api/internal/schemas"
	"altread-go/api/internal/services"

	"github.com/labstack/echo/v4"
)

type AltTextHandler struct {
	openAIService *services.OpenAIService
	logService    *services.LogService
}

func NewAltTextHandler(openAIService *services.OpenAIService, logService *services.LogService) *AltTextHandler {
	return &AltTextHandler{
		openAIService: openAIService,
		logService:    logService,
	}
}

func (h *AltTextHandler) GenerateAltText(c echo.Context) error {
	startTime := time.Now()

	var req schemas.GenerateAltTextRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request body",
			"code":    "INVALID_REQUEST",
		})
	}

	if req.Image == "" {
		duration := int(time.Since(startTime).Milliseconds())
		h.logRequest(c.Request().Method, c.Request().URL.Path, http.StatusBadRequest, duration)
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Image is required",
			"code":    "MISSING_IMAGE",
		})
	}

	ctx := c.Request().Context()
	response, err := h.openAIService.GenerateAltText(ctx, &req)
	if err != nil {
		duration := int(time.Since(startTime).Milliseconds())
		h.logRequest(c.Request().Method, c.Request().URL.Path, http.StatusInternalServerError, duration)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Internal server error",
			"code":    "INTERNAL_ERROR",
		})
	}

	duration := int(time.Since(startTime).Milliseconds())
	statusCode := http.StatusOK
	if !response.Success {
		if response.Error != nil && (*response.Error == "OpenAI API key is not configured" ||
			contains(*response.Error, "API key")) {
			statusCode = http.StatusServiceUnavailable
		} else {
			statusCode = http.StatusInternalServerError
		}
	}

	h.logRequest(c.Request().Method, c.Request().URL.Path, statusCode, duration)

	if !response.Success {
		return c.JSON(statusCode, response)
	}

	return c.JSON(http.StatusOK, response)
}

func (h *AltTextHandler) HealthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"success":   true,
		"service":   "alt-text",
		"message":   "Alt text generation service is healthy",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

func (h *AltTextHandler) logRequest(method, path string, status int, durationMs int) {
	level := "info"
	if status >= 400 {
		level = "warning"
	}
	if status >= 500 {
		level = "error"
	}

	message := fmt.Sprintf("%s %s - %d (%dms)", method, path, status, durationMs)
	h.logService.Log(level, "api", message, nil, nil)
}

func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}
