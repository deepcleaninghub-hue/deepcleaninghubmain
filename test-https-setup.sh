#!/bin/bash

# HTTPS Setup Test Script
# Tests if HTTPS is configured correctly

echo "🔍 Testing HTTPS Configuration for Deep Cleaning Hub"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if SSL certificates exist
echo "1️⃣  Checking SSL Certificates..."
if [ -f "/etc/letsencrypt/live/deepcleaninghub.com/fullchain.pem" ]; then
    echo -e "${GREEN}✅ SSL certificate found${NC}"
else
    echo -e "${RED}❌ SSL certificate NOT found${NC}"
    echo "Run: sudo certbot certonly --standalone -d deepcleaninghub.com"
    exit 1
fi

# Test 2: Check if Nginx is installed
echo ""
echo "2️⃣  Checking Nginx..."
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✅ Nginx is installed${NC}"
    nginx -v
else
    echo -e "${RED}❌ Nginx is NOT installed${NC}"
    echo "Run: sudo yum install nginx -y"
    exit 1
fi

# Test 3: Check Nginx configuration
echo ""
echo "3️⃣  Checking Nginx Configuration..."
if sudo nginx -t &> /dev/null; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    sudo nginx -t
    exit 1
fi

# Test 4: Check if Nginx is running
echo ""
echo "4️⃣  Checking Nginx Status..."
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx is not running${NC}"
    echo "Run: sudo systemctl start nginx"
fi

# Test 5: Check if Node.js backend is running on port 5001
echo ""
echo "5️⃣  Checking Node.js Backend..."
if lsof -i:5001 &> /dev/null || netstat -tuln | grep :5001 &> /dev/null; then
    echo -e "${GREEN}✅ Backend is running on port 5001${NC}"
else
    echo -e "${RED}❌ Backend is NOT running on port 5001${NC}"
    echo "Run: cd backend && pm2 start ecosystem.config.js --env production"
fi

# Test 6: Check firewall ports
echo ""
echo "6️⃣  Checking Firewall Configuration..."
if firewall-cmd --list-services 2>/dev/null | grep -q "https"; then
    echo -e "${GREEN}✅ HTTPS port (443) is open${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS port might not be open in firewall${NC}"
    echo "Run: sudo firewall-cmd --permanent --add-service=https && sudo firewall-cmd --reload"
fi

# Test 7: Test HTTPS endpoint
echo ""
echo "7️⃣  Testing HTTPS Connection..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://deepcleaninghub.com/health --max-time 10 2>/dev/null)

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS endpoint is responding (HTTP $RESPONSE)${NC}"
elif [ "$RESPONSE" = "000" ]; then
    echo -e "${YELLOW}⚠️  Cannot connect to HTTPS endpoint${NC}"
    echo "Possible issues:"
    echo "  - DNS not propagated yet"
    echo "  - Nginx not started"
    echo "  - Backend not running"
else
    echo -e "${YELLOW}⚠️  HTTPS endpoint returned HTTP $RESPONSE${NC}"
fi

# Test 8: Test API endpoint
echo ""
echo "8️⃣  Testing API Endpoint..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://deepcleaninghub.com/api/services --max-time 10 2>/dev/null)

if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ API endpoint is responding (HTTP $API_RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠️  API endpoint returned HTTP $API_RESPONSE${NC}"
fi

# Test 9: Check SSL certificate expiry
echo ""
echo "9️⃣  Checking SSL Certificate Expiry..."
EXPIRY=$(sudo certbot certificates 2>/dev/null | grep "Expiry Date" | head -1)
if [ ! -z "$EXPIRY" ]; then
    echo -e "${GREEN}✅ $EXPIRY${NC}"
else
    echo -e "${YELLOW}⚠️  Could not check certificate expiry${NC}"
fi

# Test 10: Test HTTP to HTTPS redirect
echo ""
echo "🔟  Testing HTTP → HTTPS Redirect..."
REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://deepcleaninghub.com --max-time 10 2>/dev/null)
if [ "$REDIRECT" = "301" ] || [ "$REDIRECT" = "302" ]; then
    echo -e "${GREEN}✅ HTTP redirects to HTTPS (HTTP $REDIRECT)${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP redirect returned HTTP $REDIRECT${NC}"
fi

echo ""
echo "=================================================="
echo "🎉 HTTPS Setup Test Complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. If all tests passed, update your mobile app"
echo "   2. Test API: curl https://deepcleaninghub.com/api/services"
echo "   3. Build new APK/IPA with HTTPS URL"
echo ""

