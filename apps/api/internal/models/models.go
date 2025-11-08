package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type JSONB map[string]interface{}

func (j JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, j)
}

type ImageUpload struct {
	ID               uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	FileName         string    `gorm:"type:varchar(255)"`
	FileSize         int       `gorm:"type:integer"`
	FileType         string    `gorm:"type:varchar(100)"`
	ImageHash        string    `gorm:"type:varchar(64);index"`
	AltText          string    `gorm:"type:text"`
	ProcessingTimeMS *int      `gorm:"type:integer"`
	Success          bool      `gorm:"type:boolean;default:false"`
	ErrorMessage     *string   `gorm:"type:text"`
	CreatedAt        time.Time `gorm:"type:timestamptz;default:now();index"`
}

func (ImageUpload) TableName() string {
	return "image_uploads"
}

type VoicePlay struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	VoiceName    string    `gorm:"type:varchar(100);index"`
	TextLength   int       `gorm:"type:integer;not null"`
	DurationMS   *int      `gorm:"type:integer"`
	Success      bool      `gorm:"type:boolean;default:false"`
	ErrorMessage *string   `gorm:"type:text"`
	CreatedAt    time.Time `gorm:"type:timestamptz;default:now();index"`
}

func (VoicePlay) TableName() string {
	return "voice_plays"
}

type ApplicationLog struct {
	ID        uint      `gorm:"primary_key;auto_increment"`
	Timestamp time.Time `gorm:"type:timestamptz;default:now();index"`
	Level     string    `gorm:"type:varchar(20);not null;index"`
	Service   string    `gorm:"type:varchar(100);not null;index"`
	Message   string    `gorm:"type:text;not null"`
	TraceID   *string   `gorm:"type:varchar(100);index"`
	Context   JSONB     `gorm:"type:jsonb"`
	CreatedAt time.Time `gorm:"type:timestamptz;default:now();index"`
}

func (ApplicationLog) TableName() string {
	return "application_logs"
}
