#!/bin/bash

# GDMS Production Build Script for macOS
# Run from project root: ./scripts/build-production.sh

set -e

echo "🚀 GDMS Production Build for macOS"
echo "=================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ required. Current: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v)"

# Check for .env
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Create .env with:"
    echo "   DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET"
    exit 1
fi

echo "✓ .env file found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci 2>/dev/null || npm install

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo ""
echo "🗄️  Pushing database schema..."
npm run db:push

# Optional: Seed database (skip in production by default)
SEED=${SEED:-0}
if [ "$SEED" = "1" ] || [ "$SEED" = "true" ]; then
    echo ""
    echo "🌱 Seeding database..."
    npm run db:seed
else
    echo ""
    echo "⏭️  Skipping seed (set SEED=1 to seed: SEED=1 ./scripts/build-production.sh)"
fi

# Build for production
echo ""
echo "🏗️  Building for production..."
npm run build

echo ""
echo "✅ Production build complete!"
echo ""
echo "To start the production server:"
echo "  npm start"
echo ""
echo "Default: http://localhost:3000"
