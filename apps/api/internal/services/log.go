package services

import (
	"context"
	"sync"
	"time"

	"altread-go/api/internal/database"
	"altread-go/api/internal/models"

	"gorm.io/gorm"
)

// LogService handles asynchronous logging to database with batching
type LogService struct {
	db      *gorm.DB
	queue   chan *LogEntry
	wg      sync.WaitGroup
	stopCh  chan struct{}
	stopped bool
	mu      sync.RWMutex
}

// LogEntry represents a single log entry
type LogEntry struct {
	Timestamp time.Time
	Level     string
	Service   string
	Message   string
	TraceID   *string
	Context   map[string]interface{}
}

var globalLogService *LogService
var logOnce sync.Once

// GetLogService returns a singleton log service instance
func GetLogService() *LogService {
	logOnce.Do(func() {
		globalLogService = &LogService{
			db:     database.DB,
			queue:  make(chan *LogEntry, 1000),
			stopCh: make(chan struct{}),
		}
		globalLogService.start()
	})
	return globalLogService
}

func (ls *LogService) start() {
	ls.mu.Lock()
	if ls.stopped {
		ls.mu.Unlock()
		return
	}
	ls.mu.Unlock()

	ls.wg.Add(1)
	go ls.processQueue()
}

func (ls *LogService) Stop() {
	ls.mu.Lock()
	if ls.stopped {
		ls.mu.Unlock()
		return
	}
	ls.stopped = true
	ls.mu.Unlock()

	close(ls.stopCh)

	close(ls.queue)
	for entry := range ls.queue {
		ls.storeLog(context.Background(), entry)
	}

	ls.wg.Wait()
}

func (ls *LogService) Log(level, service, message string, traceID *string, context map[string]interface{}) {
	ls.mu.RLock()
	if ls.stopped {
		ls.mu.RUnlock()
		return
	}
	ls.mu.RUnlock()

	entry := &LogEntry{
		Timestamp: time.Now(),
		Level:     level,
		Service:   service,
		Message:   message,
		TraceID:   traceID,
		Context:   context,
	}

	select {
	case ls.queue <- entry:
	default:
	}
}

func (ls *LogService) processQueue() {
	defer ls.wg.Done()

	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	batch := make([]*LogEntry, 0, 100)

	for {
		select {
		case <-ls.stopCh:
			for entry := range ls.queue {
				batch = append(batch, entry)
				if len(batch) >= 100 {
					ls.processBatch(context.Background(), batch)
					batch = batch[:0]
				}
			}
			if len(batch) > 0 {
				ls.processBatch(context.Background(), batch)
			}
			return

		case entry := <-ls.queue:
			batch = append(batch, entry)
			if len(batch) >= 100 {
				ls.processBatch(context.Background(), batch)
				batch = batch[:0]
			}

		case <-ticker.C:
			if len(batch) > 0 {
				ls.processBatch(context.Background(), batch)
				batch = batch[:0]
			}
		}
	}
}

func (ls *LogService) processBatch(ctx context.Context, entries []*LogEntry) {
	for _, entry := range entries {
		ls.storeLog(ctx, entry)
	}
}

func (ls *LogService) storeLog(ctx context.Context, entry *LogEntry) {
	if ls.db == nil {
		return
	}

	var contextJSON models.JSONB
	if entry.Context != nil {
		contextJSON = models.JSONB(entry.Context)
	}

	logEntry := &models.ApplicationLog{
		ID:        0,
		Timestamp: entry.Timestamp,
		Level:     entry.Level,
		Service:   entry.Service,
		Message:   entry.Message,
		TraceID:   entry.TraceID,
		Context:   contextJSON,
		CreatedAt: time.Now(),
	}

	bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := ls.db.WithContext(bgCtx).Create(logEntry).Error; err != nil {
	}
}
