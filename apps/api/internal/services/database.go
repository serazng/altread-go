package services

import (
	"context"
	"time"

	"altread-go/api/internal/database"
	"altread-go/api/internal/models"
	"altread-go/api/internal/schemas"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DatabaseService struct {
	db *gorm.DB
}

func NewDatabaseService() *DatabaseService {
	return &DatabaseService{
		db: database.DB,
	}
}

func (ds *DatabaseService) TrackImageUpload(ctx context.Context, event *imageUploadEvent) error {
	dbEvent := &models.ImageUpload{
		ID:               uuid.New(),
		FileName:         event.FileName,
		FileSize:         event.FileSize,
		FileType:         event.FileType,
		ImageHash:        event.ImageHash,
		AltText:          event.AltText,
		ProcessingTimeMS: event.ProcessingTimeMS,
		Success:          event.Success,
		ErrorMessage:     event.ErrorMessage,
		CreatedAt:        time.Now(),
	}

	return ds.db.WithContext(ctx).Create(dbEvent).Error
}

func (ds *DatabaseService) TrackVoicePlay(ctx context.Context, event *voicePlayEvent) error {
	var durationMS *int
	if event.DurationMS > 0 {
		durationMS = &event.DurationMS
	}

	dbEvent := &models.VoicePlay{
		ID:           uuid.New(),
		VoiceName:    event.VoiceName,
		TextLength:   event.TextLength,
		DurationMS:   durationMS,
		Success:      event.Success,
		ErrorMessage: event.ErrorMessage,
		CreatedAt:    time.Now(),
	}

	return ds.db.WithContext(ctx).Create(dbEvent).Error
}

func (ds *DatabaseService) TrackVoicePlayFromSchema(ctx context.Context, event *schemas.VoicePlayEvent) error {
	var durationMS *int
	if event.DurationMS > 0 {
		durationMS = &event.DurationMS
	}

	dbEvent := &models.VoicePlay{
		ID:           uuid.New(),
		VoiceName:    event.VoiceName,
		TextLength:   event.TextLength,
		DurationMS:   durationMS,
		Success:      event.Success,
		ErrorMessage: event.ErrorMessage,
		CreatedAt:    time.Now(),
	}

	return ds.db.WithContext(ctx).Create(dbEvent).Error
}

type imageUploadEvent struct {
	FileName         string
	FileSize         int
	FileType         string
	ImageHash        string
	AltText          string
	ProcessingTimeMS *int
	Success          bool
	ErrorMessage     *string
}

type voicePlayEvent struct {
	VoiceName    string
	TextLength   int
	DurationMS   int
	Success      bool
	ErrorMessage *string
}
