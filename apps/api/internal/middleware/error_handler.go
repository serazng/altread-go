package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type CustomHTTPError struct {
	Code    int
	Message string
	Details interface{}
}

func (e *CustomHTTPError) Error() string {
	return e.Message
}

func ErrorHandler(err error, c echo.Context) {
	var (
		code    = http.StatusInternalServerError
		msg     = "Internal server error"
		details interface{}
	)

	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
		if msgStr, ok := he.Message.(string); ok {
			msg = msgStr
		}
		if he.Internal != nil {
			details = he.Internal.Error()
		}
	}

	if customErr, ok := err.(*CustomHTTPError); ok {
		code = customErr.Code
		msg = customErr.Message
		details = customErr.Details
	}

	if !c.Response().Committed {
		response := map[string]interface{}{
			"success": false,
			"error":   msg,
		}

		if details != nil {
			if detailsMap, ok := details.(map[string]interface{}); ok {
				for k, v := range detailsMap {
					response[k] = v
				}
			} else {
				response["details"] = details
			}
		}

		if err := c.JSON(code, response); err != nil {
			c.Logger().Error(err)
		}
	}
}

func NewHTTPError(code int, message string, details interface{}) *CustomHTTPError {
	return &CustomHTTPError{
		Code:    code,
		Message: message,
		Details: details,
	}
}
