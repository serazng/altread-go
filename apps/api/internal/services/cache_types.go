package services

// CachedAltTextResult represents a cached alt text generation result
type CachedAltTextResult struct {
	AltText        string `json:"alt_text"`
	Success        bool   `json:"success"`
	ProcessingTime int    `json:"processing_time"`
	CachedAt       int64  `json:"cached_at"`
	Error          string `json:"error,omitempty"`
	ModelUsed      string `json:"model_used,omitempty"`
}

