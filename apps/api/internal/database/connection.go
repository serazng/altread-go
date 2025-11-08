package database

import (
	"fmt"
	"log"
	"time"

	"altread-go/api/internal/config"
	"altread-go/api/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(cfg *config.Config) error {
	var err error

	gormLogger := logger.Default
	if cfg.Debug {
		gormLogger = logger.Default.LogMode(logger.Info)
	} else {
		gormLogger = logger.Default.LogMode(logger.Error)
	}

	dsn := cfg.GetDSN()
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connection established")
	return nil
}

func AutoMigrate() error {
	if DB == nil {
		return fmt.Errorf("database connection not initialized")
	}

	err := DB.AutoMigrate(
		&models.ImageUpload{},
		&models.VoicePlay{},
		&models.ApplicationLog{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto migrate: %w", err)
	}

	log.Println("Database migrations completed")
	return nil
}

func Close() error {
	if DB == nil {
		return nil
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	return sqlDB.Close()
}

func HealthCheck() (map[string]interface{}, error) {
	if DB == nil {
		return map[string]interface{}{
			"healthy": false,
			"error":   "database connection not initialized",
		}, nil
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return map[string]interface{}{
			"healthy": false,
			"error":   err.Error(),
		}, nil
	}

	if err := sqlDB.Ping(); err != nil {
		return map[string]interface{}{
			"healthy": false,
			"error":   err.Error(),
		}, nil
	}

	var tableCount int64
	expectedTables := []string{"image_uploads", "voice_plays"}
	var existingTables []string

	for _, tableName := range expectedTables {
		DB.Raw("SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?)", tableName).Scan(&tableCount)
		if tableCount > 0 {
			existingTables = append(existingTables, tableName)
		}
	}

	var missingTables []string
	for _, table := range expectedTables {
		found := false
		for _, existing := range existingTables {
			if existing == table {
				found = true
				break
			}
		}
		if !found {
			missingTables = append(missingTables, table)
		}
	}

	healthy := len(missingTables) == 0
	result := map[string]interface{}{
		"healthy":         healthy,
		"connection":      "ok",
		"tables_exist":    len(missingTables) == 0,
		"existing_tables": existingTables,
		"missing_tables":  missingTables,
	}

	if !healthy {
		result["message"] = fmt.Sprintf("Missing tables: %v", missingTables)
	} else {
		result["message"] = "Database is healthy"
	}

	return result, nil
}
