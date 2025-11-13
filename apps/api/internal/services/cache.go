package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"altread-go/api/internal/config"

	"github.com/redis/go-redis/v9"
)

// CacheService handles Redis caching for alt text generation results
type CacheService struct {
	client *redis.Client
	mu     sync.RWMutex
	cfg    *config.Config
}

var cacheService *CacheService
var cacheOnce sync.Once

// GetCacheService returns a singleton cache service instance
func GetCacheService(cfg *config.Config) *CacheService {
	cacheOnce.Do(func() {
		cacheService = &CacheService{
			cfg: cfg,
		}
		cacheService.init()
	})
	return cacheService
}

func (cs *CacheService) init() {
	opt, err := redis.ParseURL(cs.cfg.RedisURL)
	if err != nil {
		log.Printf("Warning: Failed to parse Redis URL: %v", err)
		return
	}

	cs.client = redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := cs.client.Ping(ctx).Err(); err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v", err)
		cs.client = nil
		return
	}

	log.Println("Redis connection established")
}

// GetCachedResult retrieves a cached alt text result by image hash
func (cs *CacheService) GetCachedResult(ctx context.Context, imageHash string) (*CachedAltTextResult, error) {
	if cs.client == nil {
		return nil, fmt.Errorf("redis not connected")
	}

	key := fmt.Sprintf("alt_text:%s", imageHash)
	val, err := cs.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var result CachedAltTextResult
	if err := json.Unmarshal([]byte(val), &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// CacheResult stores an alt text generation result in cache with TTL based on success status
func (cs *CacheService) CacheResult(ctx context.Context, imageHash string, result map[string]interface{}, success bool) error {
	if cs.client == nil {
		return fmt.Errorf("redis not connected")
	}

	key := fmt.Sprintf("alt_text:%s", imageHash)

	cacheData := CachedAltTextResult{
		Success:        success,
		ProcessingTime: getIntFromMap(result, "processing_time"),
		CachedAt:       time.Now().Unix(),
	}

	if altText, ok := result["alt_text"].(string); ok {
		cacheData.AltText = altText
	}

	if err, ok := result["error"].(string); ok && err != "" {
		cacheData.Error = err
	}

	if model, ok := result["model_used"].(string); ok {
		cacheData.ModelUsed = model
	}

	data, err := json.Marshal(cacheData)
	if err != nil {
		return err
	}

	ttl := time.Duration(cs.cfg.RedisTTLFailure) * time.Second
	if success {
		ttl = time.Duration(cs.cfg.RedisTTLSuccess) * time.Second
	}

	return cs.client.Set(ctx, key, data, ttl).Err()
}

func getIntFromMap(m map[string]interface{}, key string) int {
	if v, ok := m[key].(int); ok {
		return v
	}
	if v, ok := m[key].(float64); ok {
		return int(v)
	}
	return 0
}
