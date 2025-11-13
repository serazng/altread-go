package constants

// OpenAI TTS voices
const (
	VoiceAlloy   = "alloy"
	VoiceEcho    = "echo"
	VoiceFable   = "fable"
	VoiceOnyx    = "onyx"
	VoiceNova    = "nova"
	VoiceShimmer = "shimmer"
)

// OpenAIVoiceList contains all available OpenAI TTS voices
var OpenAIVoiceList = []string{
	VoiceAlloy,
	VoiceEcho,
	VoiceFable,
	VoiceOnyx,
	VoiceNova,
	VoiceShimmer,
}

// Validation limits
const (
	MaxTextLength     = 4096
	MaxImageSizeBytes = 20 * 1024 * 1024
	MaxFileSizeBytes  = 10 * 1024 * 1024
)

// Error codes
const (
	ErrCodeInvalidRequest       = "INVALID_REQUEST"
	ErrCodeMissingImage         = "MISSING_IMAGE"
	ErrCodeMissingText          = "MISSING_TEXT"
	ErrCodeMissingVoice         = "MISSING_VOICE"
	ErrCodeMissingVoiceName     = "MISSING_VOICE_NAME"
	ErrCodeInvalidVoice         = "INVALID_VOICE"
	ErrCodeInvalidVoiceName     = "INVALID_VOICE_NAME"
	ErrCodeTextTooLong          = "TEXT_TOO_LONG"
	ErrCodeInternalError        = "INTERNAL_ERROR"
	ErrCodeTTSGenerationError   = "TTS_GENERATION_ERROR"
	ErrCodeVoiceTrackingError   = "VOICE_TRACKING_ERROR"
	ErrCodeClientNotInitialized = "CLIENT_NOT_INITIALIZED"
	ErrCodeReadError            = "READ_ERROR"
	ErrCodeQuotaExceeded        = "QUOTA_EXCEEDED"
	ErrCodeInvalidAPIKey        = "INVALID_API_KEY"
	ErrCodeRateLimitExceeded    = "RATE_LIMIT_EXCEEDED"
	ErrCodeRateLimitExceededAPI = "RATE_LIMIT_EXCEEDED"
)

// OpenAI TTS defaults
const (
	DefaultTTSModel    = "tts-1"
	DefaultTTSFormat   = "mp3"
	DefaultTTSSpeed    = 1.0
	DefaultMaxTokens   = 300
	DefaultTemperature = 0.3
)

// Image formats
var AllowedImageFormats = []string{"jpeg", "jpg", "png", "gif", "webp"}
