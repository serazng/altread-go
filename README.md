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

# Start API server
cd apps/api && go run cmd/server/main.go

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
cd apps/api && go run cmd/server/main.go  # Auto-migrates on start
```

## API Endpoints

```
POST   /api/v1/alt-text              # Generate alt text
POST   /api/v1/voice/openai/speech   # Generate speech
GET    /api/v1/voice/openai/voices   # List voices
GET    /health                       # Health check
```

