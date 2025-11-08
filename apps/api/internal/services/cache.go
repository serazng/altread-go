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

type CacheService struct {
	client *redis.Client
	mu     sync.RWMutex
	cfg    *config.Config
}

var cacheService *CacheService
var cacheOnce sync.Once

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

func (cs *CacheService) GetCachedResult(ctx context.Context, imageHash string) (map[string]interface{}, error) {
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

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(val), &result); err != nil {
		return nil, err
	}

	return result, nil
}

func (cs *CacheService) CacheResult(ctx context.Context, imageHash string, result map[string]interface{}, success bool) error {
	if cs.client == nil {
		return fmt.Errorf("redis not connected")
	}

	key := fmt.Sprintf("alt_text:%s", imageHash)

	cacheData := map[string]interface{}{
		"alt_text":        result["alt_text"],
		"success":         success,
		"processing_time": result["processing_time"],
		"cached_at":       time.Now().Unix(),
	}

	if err, ok := result["error"].(string); ok && err != "" {
		cacheData["error"] = err
	}

	if model, ok := result["model_used"].(string); ok {
		cacheData["model_used"] = model
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

func (cs *CacheService) HealthCheck(ctx context.Context) bool {
	if cs.client == nil {
		return false
	}

	if err := cs.client.Ping(ctx).Err(); err != nil {
		return false
	}

	return true
}

func (cs *CacheService) GetCacheStats(ctx context.Context) (map[string]interface{}, error) {
	if cs.client == nil {
		return map[string]interface{}{
			"connected": false,
			"error":     "redis not connected",
		}, nil
	}

	info := cs.client.Info(ctx, "stats")
	stats, err := info.Result()
	if err != nil {
		return map[string]interface{}{
			"connected": true,
			"error":     err.Error(),
		}, nil
	}

	return map[string]interface{}{
		"connected": true,
		"stats":     stats,
	}, nil
}
