package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

type RateLimiter struct {
	requests          map[string][]time.Time
	mu                sync.RWMutex
	requestsPerMinute int
	window            time.Duration
}

func NewRateLimiter(requestsPerMinute int) *RateLimiter {
	rl := &RateLimiter{
		requests:          make(map[string][]time.Time),
		requestsPerMinute: requestsPerMinute,
		window:            time.Minute,
	}

	go rl.cleanup()

	return rl
}

func (rl *RateLimiter) Middleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			clientIP := c.RealIP()

			rl.mu.Lock()
			now := time.Now()
			cutoff := now.Add(-rl.window)

			requests := rl.requests[clientIP]
			var validRequests []time.Time
			for _, reqTime := range requests {
				if reqTime.After(cutoff) {
					validRequests = append(validRequests, reqTime)
				}
			}

			if len(validRequests) >= rl.requestsPerMinute {
				rl.mu.Unlock()
				return c.JSON(http.StatusTooManyRequests, map[string]interface{}{
					"success": false,
					"error":   "Rate limit exceeded",
					"code":    "RATE_LIMIT_EXCEEDED",
				})
			}

			validRequests = append(validRequests, now)
			rl.requests[clientIP] = validRequests
			rl.mu.Unlock()

			return next(c)
		}
	}
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		cutoff := now.Add(-rl.window)

		for ip, requests := range rl.requests {
			var validRequests []time.Time
			for _, reqTime := range requests {
				if reqTime.After(cutoff) {
					validRequests = append(validRequests, reqTime)
				}
			}

			if len(validRequests) == 0 {
				delete(rl.requests, ip)
			} else {
				rl.requests[ip] = validRequests
			}
		}
		rl.mu.Unlock()
	}
}
