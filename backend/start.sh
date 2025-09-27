#!/bin/bash

# Deep Cleaning Hub Backend Startup Script

echo "🚀 Starting Deep Cleaning Hub Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created. Please configure your environment variables."
        echo "📝 Edit .env file with your Supabase credentials and other settings."
        exit 1
    else
        echo "❌ .env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        exit 1
    fi
    echo "✅ Dependencies installed successfully."
fi

# Check environment variables
echo "🔍 Checking environment configuration..."

# Check required Supabase variables
if ! grep -q "SUPABASE_URL" .env || ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env; then
    echo "⚠️  Supabase configuration incomplete. Please check your .env file."
    echo "   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
fi

# Check JWT secret
if ! grep -q "JWT_SECRET" .env || grep -q "your_jwt_secret_key_here" .env; then
    echo "⚠️  JWT_SECRET not configured or using default value."
    echo "   Please set a secure JWT_SECRET in your .env file."
fi

echo "✅ Environment check completed."

# Start the server
echo "🚀 Starting server in development mode..."
echo "📱 Server will be available at: http://localhost:5000"
echo "🔗 Health check: http://localhost:5000/health"
echo "📚 API base: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
