# altread-go

Built with Go + Echo, OpenAI Vision & TTS, and React + Vite, an accessible image description tool that generates alt text and reads it aloud with natural voices.

## Architecture

```
Frontend (React) → REST API (Go/Echo) → OpenAI (Vision + TTS)
                         ↓
                   PostgreSQL + Redis
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp apps/api/.env.example apps/api/.env
# Add your OPENAI_API_KEY and database credentials

# Run database migrations
pnpm migrate

# Start API server
pnpm api

# Start web app
cd apps/web && pnpm dev
```

## Project Structure

```
apps/
  api/         # Go backend (Echo + OpenAI)
  web/         # React frontend (Vite + TailwindCSS)
packages/
  config/      # Shared configuration
  types/       # Shared TypeScript types
  ui/          # Shared UI components
```

## Commands

```bash
# Development
pnpm dev                   # Start all services
cd apps/api && go run cmd/server/main.go  # API only
cd apps/web && pnpm dev    # Frontend only

# Build
pnpm build                 # Build all packages
cd apps/web && pnpm build  # Build frontend

# Database
# Run migrations before starting the server
pnpm migrate              # Apply all migrations (or: cd apps/api && go run cmd/migrate/main.go -command up)
pnpm migrate:version      # Check current version
pnpm migrate:down         # Rollback last migration
pnpm api                  # Start API server
```

## API Endpoints

```
POST   /api/v1/alt-text              # Generate alt text
POST   /api/v1/voice/openai/speech   # Generate speech
GET    /api/v1/voice/openai/voices   # List voices
GET    /health                       # Health check
```

