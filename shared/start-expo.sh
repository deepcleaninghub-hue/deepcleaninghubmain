#!/bin/bash

echo "🚀 Starting DeepClean Mobile Hub App..."
echo "=================================="

cd /Users/Mayank/Desktop/deepclean-mobile-hub-main/shared

echo "📱 Starting Expo development server..."
echo "This will show QR code and development options"
echo ""

# Kill any existing expo processes
pkill -f "expo" 2>/dev/null
sleep 2

# Start expo with full development interface
npx expo start --clear

echo ""
echo "🎉 Your app is now running!"
echo "Look for:"
echo "- QR code for mobile testing"
echo "- Development options (press i, a, w, etc.)"
echo "- Metro bundler on http://localhost:8081"
