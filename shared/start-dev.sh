#!/bin/bash

# DeepClean Mobile Hub - Development Startup Script
# This script starts both the backend and frontend in development mode

echo "🚀 Starting DeepClean Mobile Hub Development Environment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

if ! command_exists expo; then
    echo -e "${YELLOW}⚠️  Expo CLI not found. Installing globally...${NC}"
    npm install -g @expo/cli
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Install shared app dependencies
echo -e "${YELLOW}Installing shared app dependencies...${NC}"
cd shared
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Start backend in background
echo -e "${BLUE}🔧 Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
    echo -e "${BLUE}🌐 Backend running at: http://localhost:5001${NC}"
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    exit 1
fi

# Start frontend
echo -e "${BLUE}📱 Starting shared app...${NC}"
cd shared
echo -e "${YELLOW}Starting Expo development server...${NC}"
echo -e "${BLUE}📱 App will be available at: http://localhost:19006${NC}"
echo -e "${BLUE}📱 Expo DevTools: http://localhost:19002${NC}"
echo ""
echo -e "${GREEN}🎉 Development environment ready!${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Start Expo
npm start

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    if ps -p $BACKEND_PID > /dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}✅ Backend server stopped${NC}"
    fi
    echo -e "${GREEN}✅ Frontend server stopped${NC}"
    echo -e "${GREEN}👋 Goodbye!${NC}"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for background process
wait $BACKEND_PID
