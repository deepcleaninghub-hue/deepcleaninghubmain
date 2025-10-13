#!/bin/bash

# Nginx + HTTPS Setup Script for AWS EC2
# Run this script on your AWS server

echo "🚀 Setting up Nginx + HTTPS for Deep Cleaning Hub"
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (sudo)"
    exit 1
fi

# Step 1: Install Nginx
echo "📦 Step 1: Installing Nginx..."
if command -v nginx &> /dev/null; then
    echo "✅ Nginx already installed"
else
    yum install nginx -y
    systemctl enable nginx
    echo "✅ Nginx installed"
fi

# Step 2: Create Nginx configuration
echo ""
echo "📝 Step 2: Creating Nginx configuration..."

cat > /etc/nginx/conf.d/deepcleaninghub.conf << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name deepcleaninghub.com www.deepcleaninghub.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name deepcleaninghub.com www.deepcleaninghub.com;
    
    # SSL Certificate Configuration
    ssl_certificate /etc/letsencrypt/live/deepcleaninghub.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/deepcleaninghub.com/privkey.pem;
    
    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # SSL Session Cache
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Max Upload Size
    client_max_body_size 10M;
    
    # Proxy to Node.js Backend
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Root location
    location / {
        return 200 'Deep Cleaning Hub API - Use /api endpoint';
        add_header Content-Type text/plain;
    }
}
EOF

echo "✅ Nginx configuration created at /etc/nginx/conf.d/deepcleaninghub.conf"

# Step 3: Test Nginx configuration
echo ""
echo "🧪 Step 3: Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

# Step 4: Configure firewall
echo ""
echo "🔥 Step 4: Configuring firewall..."
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    echo "✅ Firewall configured (firewalld)"
else
    echo "⚠️  firewalld not found, skipping firewall configuration"
fi

# Step 5: Start Nginx
echo ""
echo "🚀 Step 5: Starting Nginx..."
systemctl restart nginx
systemctl status nginx --no-pager

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Failed to start Nginx"
    exit 1
fi

# Step 6: Check SSL certificates
echo ""
echo "🔐 Step 6: Checking SSL certificates..."
if [ -f "/etc/letsencrypt/live/deepcleaninghub.com/fullchain.pem" ]; then
    echo "✅ SSL certificates found"
    certbot certificates
else
    echo "❌ SSL certificates NOT found"
    echo "Run: sudo certbot certonly --standalone -d deepcleaninghub.com -d www.deepcleaninghub.com"
    exit 1
fi

# Success
echo ""
echo "================================================"
echo "🎉 Setup Complete!"
echo ""
echo "✅ Nginx is running with HTTPS"
echo "✅ SSL certificates configured"
echo "✅ Proxying to Node.js backend on port 5001"
echo ""
echo "📝 Test your setup:"
echo "   curl https://deepcleaninghub.com/health"
echo "   curl https://deepcleaninghub.com/api/services"
echo ""
echo "🔄 SSL certificates will auto-renew via certbot"
echo ""

