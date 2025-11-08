#!/bin/bash

# AltRead Setup Script
echo "🚀 Setting up AltRead development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ PNPM is not installed. Please install PNPM first:"
    echo "npm install -g pnpm@8.6.10"
    exit 1
fi

# Check if Node.js version is 18+
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ PNPM version: $(pnpm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Create environment files
echo "🔧 Setting up environment files..."

# API environment
if [ ! -f "apps/api/.env" ]; then
    echo "⚠️  apps/api/.env not found - create it manually with required environment variables"
    echo "   See apps/api/README.md for required variables"
else
    echo "✅ apps/api/.env exists"
fi

# Web environment
if [ ! -f "apps/web/.env" ]; then
    cat > apps/web/.env << EOF
VITE_API_URL=http://localhost:3001
EOF
    echo "✅ Created apps/web/.env"
else
    echo "⚠️  apps/web/.env already exists"
fi

# Build packages
echo "🔨 Building packages..."
pnpm build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your OpenAI API key to apps/api/.env (see apps/api/README.md)"
echo "2. Start Go API: cd apps/api && go run cmd/server/main.go"
echo "3. Start Web: cd apps/web && pnpm dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🚀"
