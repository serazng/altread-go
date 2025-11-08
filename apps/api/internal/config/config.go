package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppName     string
	Version     string
	Environment string
	Debug       bool
	Host        string
	Port        int

	// CORS
	AllowedOrigins []string

	// Database
	DatabaseURL string

	// Redis
	RedisURL        string
	RedisTTLSuccess int // seconds
	RedisTTLFailure int // seconds

	// OpenAI
	OpenAIAPIKey        string
	OpenAIModel         string
	OpenAIModelFallback string
	OpenAIMaxTokens     int

	// Rate Limiting
	RateLimitRequests int
	RateLimitWindow   int // seconds

	// File Upload
	MaxFileSize      int64 // bytes
	AllowedFileTypes []string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		AppName:             getEnv("APP_NAME", "AltRead API"),
		Version:             getEnv("VERSION", "1.0.0"),
		Environment:         getEnv("ENVIRONMENT", "development"),
		Debug:               getEnvBool("DEBUG", true),
		Host:                getEnv("HOST", "0.0.0.0"),
		Port:                getEnvInt("PORT", 3001),
		DatabaseURL:         getEnv("DATABASE_URL", "postgresql://user:password@localhost:5432/altread"),
		RedisURL:            getEnv("REDIS_URL", "redis://localhost:6379"),
		RedisTTLSuccess:     getEnvInt("REDIS_TTL_SUCCESS", 30*24*60*60), // 30 days
		RedisTTLFailure:     getEnvInt("REDIS_TTL_FAILURE", 60*60),       // 1 hour
		OpenAIAPIKey:        getEnv("OPENAI_API_KEY", ""),
		OpenAIModel:         getEnv("OPENAI_MODEL", "gpt-4o-mini"),
		OpenAIModelFallback: getEnv("OPENAI_MODEL_FALLBACK", "gpt-4o"),
		OpenAIMaxTokens:     getEnvInt("OPENAI_MAX_TOKENS", 300),
		RateLimitRequests:   getEnvInt("RATE_LIMIT_REQUESTS", 100),
		RateLimitWindow:     getEnvInt("RATE_LIMIT_WINDOW", 60),
		MaxFileSize:         int64(getEnvInt("MAX_FILE_SIZE", 10*1024*1024)), // 10MB
	}

	originsStr := getEnv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
	cfg.AllowedOrigins = strings.Split(originsStr, ",")
	for i, origin := range cfg.AllowedOrigins {
		cfg.AllowedOrigins[i] = strings.TrimSpace(origin)
	}

	fileTypesStr := getEnv("ALLOWED_FILE_TYPES", "image/jpeg,image/png,image/gif,image/webp")
	cfg.AllowedFileTypes = strings.Split(fileTypesStr, ",")
	for i, fileType := range cfg.AllowedFileTypes {
		cfg.AllowedFileTypes[i] = strings.TrimSpace(fileType)
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func (c *Config) GetDSN() string {
	dsn := c.DatabaseURL
	dsn = strings.Replace(dsn, "postgresql://", "postgres://", 1)
	return dsn
}
