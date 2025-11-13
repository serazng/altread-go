package v1

// VoiceInfo represents information about an available voice
type VoiceInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// GetVoicesResponse represents the response for getting available voices
type GetVoicesResponse struct {
	Success bool        `json:"success"`
	Voices  []VoiceInfo `json:"voices"`
}

