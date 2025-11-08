package middleware

import (
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

type RequestMetric struct {
	Path         string    `json:"path"`
	Method       string    `json:"method"`
	StatusCode   int       `json:"status_code"`
	ResponseTime float64   `json:"response_time_ms"`
	IsError      bool      `json:"is_error"`
	Timestamp    time.Time `json:"timestamp"`
}

type MetricsTracker struct {
	metrics map[string][]RequestMetric
	mu      sync.RWMutex
	maxSize int
}

func NewMetricsTracker(maxSize int) *MetricsTracker {
	return &MetricsTracker{
		metrics: make(map[string][]RequestMetric),
		maxSize: maxSize,
	}
}

func (mt *MetricsTracker) Track(path, method string, statusCode int, responseTime time.Duration) {
	mt.mu.Lock()
	defer mt.mu.Unlock()

	endpointKey := method + ":" + path
	metric := RequestMetric{
		Path:         path,
		Method:       method,
		StatusCode:   statusCode,
		ResponseTime: float64(responseTime.Nanoseconds()) / 1e6, // Convert to milliseconds
		IsError:      statusCode >= 400,
		Timestamp:    time.Now(),
	}

	metrics := mt.metrics[endpointKey]
	if len(metrics) >= mt.maxSize {
		metrics = metrics[1:]
	}
	metrics = append(metrics, metric)
	mt.metrics[endpointKey] = metrics
}

func (mt *MetricsTracker) GetRecentMetrics(endpointKey string, limit int) []RequestMetric {
	mt.mu.RLock()
	defer mt.mu.RUnlock()

	metrics := mt.metrics[endpointKey]
	if len(metrics) > limit {
		return metrics[len(metrics)-limit:]
	}
	return metrics
}

func (mt *MetricsTracker) GetAllMetrics() map[string][]RequestMetric {
	mt.mu.RLock()
	defer mt.mu.RUnlock()

	result := make(map[string][]RequestMetric)
	for k, v := range mt.metrics {
		result[k] = v
	}
	return result
}

func MetricsMiddleware(tracker *MetricsTracker) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			path := c.Request().URL.Path
			if path == "/health" {
				return next(c)
			}

			start := time.Now()
			err := next(c)
			responseTime := time.Since(start)

			statusCode := c.Response().Status
			if err != nil {
				if httpErr, ok := err.(*echo.HTTPError); ok {
					statusCode = httpErr.Code
				} else {
					statusCode = 500
				}
			}

			tracker.Track(path, c.Request().Method, statusCode, responseTime)

			return err
		}
	}
}
