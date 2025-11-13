package database

import (
	"fmt"
	"log"
	"strings"
	"time"

	"altread-go/api/internal/config"
	"altread-go/api/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the global database connection instance
var DB *gorm.DB

// Init initializes the database connection with connection pooling
func Init(cfg *config.Config) error {
	var err error

	var gormLogger logger.Interface
	if cfg.Debug {
		gormLogger = logger.Default.LogMode(logger.Info)
	} else {
		gormLogger = logger.Default.LogMode(logger.Error)
	}

	dsn := cfg.GetDSN()
	DB, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // Disable prepared statement cache to avoid conflicts
	}), &gorm.Config{
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

// AutoMigrate is deprecated. Use the migration CLI tool instead.
// Run: go run cmd/migrate/main.go up
//
// Deprecated: This function is no longer used. Database migrations should be
// managed using golang-migrate via the migration CLI tool.
func AutoMigrate() error {
	if DB == nil {
		return fmt.Errorf("database connection not initialized")
	}

	// AutoMigrate will only create missing tables/columns
	err := DB.AutoMigrate(
		&models.ImageUpload{},
		&models.VoicePlay{},
		&models.ApplicationLog{},
	)
	if err != nil {
		// Check if error is just about table already existing
		errStr := strings.ToLower(err.Error())
		if strings.Contains(errStr, "already exists") {
			log.Println("Database tables already exist, skipping migration")
			return nil
		}
		return fmt.Errorf("failed to auto migrate: %w", err)
	}

	log.Println("Database migrations completed")
	return nil
}

// Close closes the database connection
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
