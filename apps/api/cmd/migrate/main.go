package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"altread-go/api/internal/config"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	var (
		command = flag.String("command", "up", "Migration command: up, down, version, force, create")
		steps    = flag.Int("steps", 0, "Number of migration steps (0 = all)")
		version  = flag.Int("version", 0, "Version for force command")
		name     = flag.String("name", "", "Name for create command")
	)
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Get absolute path to migrations directory
	wd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get working directory: %v", err)
	}

	migrationsPath := filepath.Join(wd, "migrations")
	if _, err := os.Stat(migrationsPath); os.IsNotExist(err) {
		log.Fatalf("Migrations directory not found: %s", migrationsPath)
	}

	// Convert to file:// URL format
	migrationsURL := fmt.Sprintf("file://%s", migrationsPath)
	databaseURL := cfg.GetDSN()

	m, err := migrate.New(migrationsURL, databaseURL)
	if err != nil {
		log.Fatalf("Failed to create migrate instance: %v", err)
	}
	defer m.Close()

	switch *command {
	case "up":
		if *steps > 0 {
			err = m.Steps(*steps)
		} else {
			err = m.Up()
		}
		if err != nil && err != migrate.ErrNoChange {
			log.Fatalf("Failed to run migrations up: %v", err)
		}
		if err == migrate.ErrNoChange {
			log.Println("No migrations to apply")
		} else {
			log.Println("Migrations applied successfully")
		}

	case "down":
		stepsToRun := *steps
		if stepsToRun == 0 {
			stepsToRun = 1 // Default to 1 step down
		}
		err = m.Steps(-stepsToRun)
		if err != nil && err != migrate.ErrNoChange {
			log.Fatalf("Failed to run migrations down: %v", err)
		}
		if err == migrate.ErrNoChange {
			log.Println("No migrations to rollback")
		} else {
			log.Printf("Rolled back %d migration(s) successfully", stepsToRun)
		}

	case "version":
		version, dirty, err := m.Version()
		if err != nil {
			if err == migrate.ErrNilVersion {
				log.Println("No migrations have been applied")
				return
			}
			log.Fatalf("Failed to get migration version: %v", err)
		}
		if dirty {
			log.Printf("Current version: %d (dirty - migration failed partway through)", version)
		} else {
			log.Printf("Current version: %d", version)
		}

	case "force":
		if *version == 0 {
			log.Fatal("Version is required for force command. Use -version flag")
		}
		err = m.Force(*version)
		if err != nil {
			log.Fatalf("Failed to force version: %v", err)
		}
		log.Printf("Forced migration version to %d", *version)

	case "create":
		if *name == "" {
			log.Fatal("Name is required for create command. Use -name flag")
		}
		log.Println("To create a new migration, use the migrate CLI tool:")
		log.Println("  migrate create -ext sql -dir migrations -seq <name>")
		log.Println("Or manually create files:")
		log.Printf("  migrations/XXXXXX_%s.up.sql", *name)
		log.Printf("  migrations/XXXXXX_%s.down.sql", *name)

	default:
		log.Fatalf("Unknown command: %s. Use: up, down, version, force, or create", *command)
	}
}

