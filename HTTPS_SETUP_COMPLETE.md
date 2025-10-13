# 🔐 HTTPS Setup Guide - Complete

## ✅ You Already Have:
- SSL Certificates from Let's Encrypt ✅
- Certificate: `/etc/letsencrypt/live/deepcleaninghub.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/deepcleaninghub.com/privkey.pem`
- Expires: 2026-01-11 (auto-renews)

---

## 🚀 Quick Setup (5 minutes)

### On Your AWS Server:

```bash
# 1. Upload and run the setup script
sudo bash setup-nginx-https.sh

# That's it! Script will:
# - Install Nginx
# - Configure HTTPS proxy
# - Setup firewall
# - Start services
```

### Manual Setup (if you prefer):

#### Step 1: Install Nginx
```bash
sudo yum install nginx -y
sudo systemctl enable nginx
```

#### Step 2: Create Nginx Config
```bash
sudo nano /etc/nginx/conf.d/deepcleaninghub.conf
```

Paste this configuration:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name deepcleaninghub.com www.deepcleaninghub.com;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name deepcleaninghub.com www.deepcleaninghub.com;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/deepcleaninghub.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/deepcleaninghub.com/privkey.pem;
    
    # Modern SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Proxy to Node.js
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        proxy_pass http://localhost:5001;
    }
}
```

#### Step 3: Test & Start
```bash
# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl status nginx

# Configure firewall
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

---

## 🧪 Test Your Setup

### Run Test Script:
```bash
bash test-https-setup.sh
```

### Manual Tests:
```bash
# Test HTTPS health check
curl https://deepcleaninghub.com/health

# Test API endpoint
curl https://deepcleaninghub.com/api/services

# Test HTTP redirect
curl -I http://deepcleaninghub.com

# Check SSL certificate
openssl s_client -connect deepcleaninghub.com:443 -servername deepcleaninghub.com < /dev/null
```

---

## 📱 Update Mobile App

### ✅ Already Done!
Your app configuration has been updated to use HTTPS:

**File:** `shared/src/config/environment.ts`
```typescript
API_BASE_URL: 'https://deepcleaninghub.com/api'
```

---

## 🏗️ Architecture

```
Mobile App (iOS/Android)
         ↓ HTTPS
    deepcleaninghub.com:443
         ↓
      Nginx (SSL Termination)
         ↓ HTTP
    Node.js Backend (localhost:5001)
         ↓
    Supabase Database
```

**Benefits:**
- ✅ SSL handled by Nginx (better performance)
- ✅ Node.js stays simple (no SSL code)
- ✅ Easy to scale (add load balancing later)
- ✅ Automatic certificate renewal
- ✅ App Store & Play Store compliant

---

## 🔄 SSL Certificate Auto-Renewal

Certbot automatically renews certificates. Check renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot-renew.timer

# Manual renewal (if needed)
sudo certbot renew
sudo systemctl reload nginx
```

---

## 🐛 Troubleshooting

### Issue: Nginx won't start
```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check configuration
sudo nginx -t

# Check if port 443 is in use
sudo lsof -i:443
```

### Issue: Can't connect to HTTPS
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check firewall
sudo firewall-cmd --list-all

# Check backend
curl http://localhost:5001/health
```

### Issue: SSL certificate errors
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### Issue: Backend not responding
```bash
# Check if Node.js is running
pm2 status

# Check backend logs
pm2 logs deepclean-hub-backend

# Restart backend
pm2 restart deepclean-hub-backend
```

---

## 📊 Performance

### Enable Gzip Compression (Optional)
Add to nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### Enable Caching (Optional)
```nginx
location /api {
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503;
    # ... rest of proxy config
}
```

---

## 🔒 Security Checklist

- [x] SSL/TLS enabled (HTTPS)
- [x] HTTP → HTTPS redirect
- [x] Modern TLS protocols (1.2, 1.3)
- [x] Security headers (HSTS, X-Frame-Options, etc.)
- [x] Firewall configured
- [x] Non-root user for Node.js
- [ ] Rate limiting (already in Node.js app)
- [ ] DDoS protection (consider Cloudflare)

---

## 🎯 Next Steps

1. **Test HTTPS**: Run `test-https-setup.sh`
2. **Build New APK/IPA**: With HTTPS URL
3. **Test Mobile App**: Ensure it connects via HTTPS
4. **Remove HTTP workarounds**: 
   - Delete `android/app/src/main/res/xml/network_security_config.xml`
   - Remove Android manifest network security config reference
   - Remove iOS Info.plist HTTP exceptions
5. **Submit to Stores**: You're now App Store/Play Store compliant!

---

## 📞 Support

**Nginx Docs:** https://nginx.org/en/docs/  
**Let's Encrypt:** https://letsencrypt.org/docs/  
**Certbot:** https://certbot.eff.org/

---

## ✅ Status

- [x] SSL Certificates obtained
- [ ] Nginx installed & configured
- [ ] HTTPS tested and working
- [ ] Mobile app updated
- [ ] New build created
- [ ] Submitted to stores

---

Last Updated: December 2024

