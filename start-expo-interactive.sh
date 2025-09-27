#!/bin/bash

# Force interactive mode for Expo
export CI=false
export TERM=xterm-256color
export FORCE_COLOR=1
unset NO_COLOR

cd /Users/Mayank/Desktop/deepclean-mobile-hub-main/shared

echo "🚀 Starting Expo in interactive mode..."
echo "This should show QR code and dev commands"
echo ""

# Kill any existing expo processes
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

# Start expo with proper interactive mode
npx expo start --clear
