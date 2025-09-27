@echo off
REM DeepClean Mobile Hub - Development Startup Script (Windows)
REM This script starts both the backend and frontend in development mode

echo 🚀 Starting DeepClean Mobile Hub Development Environment...
echo ==================================================

REM Check prerequisites
echo 📋 Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

where expo >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Expo CLI not found. Installing globally...
    npm install -g @expo/cli
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo 📦 Installing dependencies...

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
if not exist node_modules (
    npm install
)
cd ..

REM Install shared app dependencies
echo Installing shared app dependencies...
cd shared
if not exist node_modules (
    npm install
)
cd ..

echo ✅ Dependencies installed

REM Start backend in background
echo 🔧 Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo ✅ Backend server started
echo 🌐 Backend running at: http://localhost:5001

REM Start frontend
echo 📱 Starting shared app...
cd shared
echo Starting Expo development server...
echo 📱 App will be available at: http://localhost:19006
echo 📱 Expo DevTools: http://localhost:19002
echo.
echo 🎉 Development environment ready!
echo Press Ctrl+C to stop the frontend server
echo.

REM Start Expo
npm start

echo.
echo 👋 Goodbye!
pause
