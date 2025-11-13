package v1

import (
	"net/http"

	"altread-go/api/internal/services"

	"github.com/labstack/echo/v4"
)

// AnalyticsHandler handles HTTP requests for analytics data
type AnalyticsHandler struct {
	analyticsService *services.AnalyticsService
}

// NewAnalyticsHandler creates a new analytics handler instance
func NewAnalyticsHandler(analyticsService *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: analyticsService,
	}
}

// GetAnalytics retrieves analytics data for the specified time range
func (h *AnalyticsHandler) GetAnalytics(c echo.Context) error {
	// Get time range from query parameter, default to "30d"
	timeRange := c.QueryParam("timeRange")
	if timeRange == "" {
		timeRange = "30d"
	}

	// Validate time range
	validRanges := map[string]bool{
		"7d":  true,
		"30d": true,
		"90d": true,
		"all": true,
	}
	if !validRanges[timeRange] {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid timeRange parameter. Must be one of: 7d, 30d, 90d, all",
		})
	}

	ctx := c.Request().Context()
	data, err := h.analyticsService.GetAnalytics(ctx, timeRange)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to retrieve analytics data",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    data,
	})
}

