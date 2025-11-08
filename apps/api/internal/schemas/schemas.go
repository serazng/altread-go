package schemas

type GenerateAltTextRequest struct {
	Image   string                 `json:"image" binding:"required"`
	Options map[string]interface{} `json:"options"`
}

type GenerateAltTextResponse struct {
	Success        bool     `json:"success"`
	AltText        string   `json:"altText"`
	Confidence     *float64 `json:"confidence,omitempty"`
	ProcessingTime int      `json:"processing_time"`
	Error          *string  `json:"error,omitempty"`
}

type TTSRequest struct {
	Text           string   `json:"text" binding:"required"`
	Voice          string   `json:"voice" binding:"required"`
	Model          *string  `json:"model"`
	Speed          *float64 `json:"speed"`
	ResponseFormat *string  `json:"response_format"`
}

type TTSResponse struct {
	Success     bool    `json:"success"`
	AudioBuffer []byte  `json:"-"`
	Error       *string `json:"error,omitempty"`
	Code        *string `json:"code,omitempty"`
}

type VoicePlayEvent struct {
	VoiceName    string  `json:"voice_name" binding:"required"`
	TextLength   int     `json:"text_length"`
	DurationMS   int     `json:"duration_ms"`
	Success      bool    `json:"success"`
	ErrorMessage *string `json:"error_message,omitempty"`
}

type ImageUploadEvent struct {
	FileName         string
	FileSize         int
	FileType         string
	ImageHash        string
	AltText          string
	ProcessingTimeMS *int
	Success          bool
	ErrorMessage     *string
}

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *string     `json:"error,omitempty"`
	Code    *string     `json:"code,omitempty"`
}
