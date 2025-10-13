# Technical Submission Checklist
## Play Store & App Store Ready

---

## 🚨 **CRITICAL BLOCKERS** (Must complete before ANY submission)

### ✅ **STEP 1: Setup HTTPS Backend**

**Current:** `http://13.211.76.43:5001/api` ❌  
**Required:** `https://api.deepcleaninghub.com/api` ✅

**Why:** Both Apple and Google **reject apps using HTTP** for security.

#### Quick Setup with CloudFlare (Recommended - 5 minutes):

1. **Sign up at CloudFlare** (free): https://dash.cloudflare.com/sign-up
2. **Add your domain**: deepcleaninghub.com
3. **Update nameservers** at your domain registrar (GoDaddy, Namecheap, etc.)
4. **Create DNS record**:
   - Type: `A`
   - Name: `api`
   - IPv4: `13.211.76.43`
   - Proxy: ✅ Enabled (orange cloud)
5. **SSL/TLS Settings**:
   - Go to SSL/TLS → Overview
   - Select: **"Full"** (not Flexible, not Full Strict)
6. **Done!** CloudFlare now provides HTTPS automatically

#### After HTTPS is working:

```bash
# Update production config
# File: shared/src/config/environment.ts (line 86)
# Change from: 'http://13.211.76.43:5001/api'
# Change to:   'https://api.deepcleaninghub.com/api'
```

---

## 📱 **STEP 2: Remove Development/Test Code**

### Files to Clean:

#### A. Remove NotificationTest Component from Production
```typescript
// File: shared/src/screens/main/ProfileScreen.tsx
// Remove line 15: import NotificationTest from '../../components/NotificationTest';
// Remove line 372: <NotificationTest />
```

#### B. Clean up console.log statements (optional but recommended)
```bash
# Search for console.log in production code
grep -r "console.log" shared/src --exclude-dir=node_modules
```

---

## 🔐 **STEP 3: Android Production Build Setup**

### A. Create Release Keystore

```bash
cd /Users/mayankmalhotra/Downloads/deepcleaninghubmain/shared/android/app

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore deepcleanhub-release.keystore \
  -alias deepcleanhub \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**⚠️ IMPORTANT: Write down and save securely:**
- Keystore password: `________________`
- Key alias: `deepcleanhub`
- Key password: `________________`
- Store file location: `android/app/deepcleanhub-release.keystore`

### B. Create keystore.properties

```bash
nano /Users/mayankmalhotra/Downloads/deepcleaninghubmain/shared/android/keystore.properties
```

Add:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=deepcleanhub
storeFile=deepcleanhub-release.keystore
```

### C. Update build.gradle

File: `shared/android/app/build.gradle`

Add before `android {` block:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add inside `android {` block:
```gradle
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### D. Remove HTTP network security config (once HTTPS is working)

```bash
# Delete this file:
rm /Users/mayankmalhotra/Downloads/deepcleaninghubmain/shared/android/app/src/main/res/xml/network_security_config.xml

# Edit AndroidManifest.xml - remove this attribute:
# android:networkSecurityConfig="@xml/network_security_config"
```

### E. Build AAB for Play Store

```bash
cd /Users/mayankmalhotra/Downloads/deepcleaninghubmain/shared

# Set Java environment
export JAVA_HOME="/usr/local/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

# Clean build
./android/gradlew clean

# Build signed AAB
./android/gradlew bundleRelease

# Output location:
# android/app/build/outputs/bundle/release/app-release.aab
```

**File size should be ~30-50MB**

---

## 🍎 **STEP 4: iOS Production Build Setup**

### A. Prerequisites

1. **Mac computer** (required for iOS builds)
2. **Xcode installed** (from Mac App Store)
3. **Apple Developer Account** ($99/year): https://developer.apple.com/programs/enroll/

### B. Update Info.plist (remove HTTP exceptions once HTTPS works)

File: `shared/ios/DeepCleaningHub/Info.plist`

Replace NSAppTransportSecurity with:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

Remove the `NSExceptionDomains` section completely.

### C. Configure Signing in Xcode

```bash
# Open project
cd /Users/mayankmalhotra/Downloads/deepcleaninghubmain/shared/ios
open DeepCleaningHub.xcworkspace
```

In Xcode:
1. Select project in left panel
2. Select "DeepCleaningHub" target
3. Go to "Signing & Capabilities"
4. Check "Automatically manage signing"
5. Select your Team
6. Verify Bundle Identifier: `com.deepcleanhub.mobile`

### D. Archive and Upload

1. Select target: **"Any iOS Device (arm64)"**
2. Menu: **Product → Archive**
3. Wait for archive to complete
4. In Organizer window → **Distribute App**
5. Select: **App Store Connect**
6. Select: **Upload**
7. Follow prompts

**Expected IPA size: ~40-60MB**

---

## 🧪 **STEP 5: Final Testing**

### Test Checklist (on REAL devices, not simulators):

- [ ] Test on Android device (Android 12+)
- [ ] Test on iOS device (iOS 15+)
- [ ] **Sign up new account** → verify privacy policy checkbox works
- [ ] **Login** → verify successful
- [ ] **Browse services** → all load correctly
- [ ] **Add to cart** → cart works
- [ ] **Book service** → booking goes through
- [ ] **Email confirmation** → received
- [ ] **WhatsApp confirmation** → received (if configured)
- [ ] **Push notification** → test promo notifications
- [ ] **View bookings** → shows in profile
- [ ] **Change password** → works
- [ ] **Logout** → successful
- [ ] **All 14 languages** → test 2-3 languages switch properly

---

## 📦 **STEP 6: Version & Build Numbers**

### Update before building:

#### Android: `shared/android/app/build.gradle`
```gradle
android {
    defaultConfig {
        versionCode 10        // Increment each release
        versionName "1.0.0"   // Public version (1.0.0, 1.0.1, etc.)
    }
}
```

#### iOS: `shared/ios/DeepCleaningHub/Info.plist`
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>10</string>
```

#### App.json: `shared/app.json`
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "10"
    },
    "android": {
      "versionCode": 10
    }
  }
}
```

---

## 📝 **STEP 7: Store Listings (Prepare these)**

### Screenshots Needed:

#### Android (1080 x 1920 px minimum):
- [ ] Home screen
- [ ] Services list
- [ ] Service detail with booking
- [ ] Cart screen
- [ ] Booking confirmation
- [ ] Profile screen
- [ ] Order history
- [ ] Language selector

**Feature Graphic (1024 x 500 px):**
- [ ] Create banner with app logo and tagline

#### iOS (Multiple sizes needed):
- [ ] 6.7" Display (1290 x 2796 px) - iPhone 14 Pro Max
- [ ] 6.5" Display (1242 x 2688 px) - iPhone 11 Pro Max
- [ ] 5.5" Display (1242 x 2208 px) - iPhone 8 Plus

### App Description (prepared):
```
Deep Cleaning Hub - Professional Cleaning Services

Professional home and office cleaning services at your fingertips. 

🏠 SERVICES:
• Deep Cleaning
• Office Setup Cleaning
• Moving Cleaning
• Furniture Cleaning
• Painting Preparation

✨ FEATURES:
• Easy booking in 3 taps
• 14 language support
• Weekend discount: 20% OFF
• Holiday special: 25% OFF
• Secure payments
• Order tracking
• Real-time notifications

📍 Serving Frankfurt, Germany

🔒 Privacy: We protect your data with bank-level security.

Download now and get your space professionally cleaned!
```

---

## 🌐 **STEP 8: Host Privacy Policy Online**

**Required:** Both stores need a URL to your privacy policy.

### Quick Option - GitHub Pages:

```bash
cd /Users/mayankmalhotra/Downloads/deepcleaninghubmain

# Create docs folder
mkdir docs

# Copy privacy policy as HTML
# (I'll create this for you)
```

Enable GitHub Pages:
1. Go to repo settings
2. Pages → Source: `main` branch, `/docs` folder
3. Your URL: `https://deepcleaninghub-hue.github.io/deepcleaninghubmain/privacy-policy.html`

**Better Option:** Host on your domain:
- `https://deepcleaninghub.com/privacy-policy`

---

## ✅ **Final Checklist Before Upload**

### Code:
- [ ] HTTPS backend configured and working
- [ ] Production API URL updated in environment.ts
- [ ] NotificationTest removed from ProfileScreen
- [ ] HTTP network security configs removed (Android & iOS)
- [ ] Version numbers updated
- [ ] All console.logs removed or minimized

### Builds:
- [ ] Android AAB built and signed
- [ ] iOS IPA archived and ready
- [ ] Tested on real devices
- [ ] All features working

### Store Assets:
- [ ] Screenshots captured (8 per platform)
- [ ] Feature graphic created (Android)
- [ ] App description written
- [ ] Privacy policy hosted online
- [ ] Developer accounts created

### Legal:
- [ ] Privacy policy URL ready
- [ ] Contact information confirmed
- [ ] Age rating known (All ages)
- [ ] Category selected (House & Home)

---

## 🚀 **Upload Process**

### Google Play Console:

1. Go to: https://play.google.com/console
2. Create new app
3. Fill app details:
   - Name: Deep Cleaning Hub
   - Category: House & Home
   - Privacy Policy URL: [your URL]
4. Upload AAB to Production → Create new release
5. Add release notes
6. Complete content rating questionnaire
7. Complete data safety form
8. Set pricing & distribution
9. Submit for review

**Review time:** 1-3 days typically

### Apple App Store Connect:

1. Go to: https://appstoreconnect.apple.com
2. My Apps → + → New App
3. Fill details:
   - Name: Deep Cleaning Hub
   - Bundle ID: com.deepcleanhub.mobile
   - Primary Language: English
4. App Information:
   - Category: Lifestyle or Home & Decoration
   - Privacy Policy URL: [your URL]
5. Pricing: Free
6. Upload build from Xcode Organizer
7. Select build in App Store Connect
8. Add screenshots
9. Submit for review

**Review time:** 1-3 days typically (can be longer for first app)

---

## 📊 **Estimated Timeline**

| Task | Time |
|------|------|
| Setup HTTPS (CloudFlare) | 30 mins |
| Remove test code | 15 mins |
| Create Android keystore | 10 mins |
| Build signed AAB | 15 mins |
| iOS signing setup | 30 mins |
| Build iOS IPA | 20 mins |
| Take screenshots | 1 hour |
| Host privacy policy | 15 mins |
| Upload to stores | 1 hour |
| **TOTAL** | **~4-5 hours** |
| Store review wait | 1-3 days |

---

## 🆘 **Troubleshooting**

### Build Errors:

**"Unable to load script"**
- Run: `npm start -- --reset-cache`

**"Task :app:bundleReleaseJsAndAssets FAILED"**
- Run: `./android/gradlew clean`

**iOS Build Fails**
- Clean: Product → Clean Build Folder (Cmd+Shift+K)
- Delete derived data
- Restart Xcode

### Store Rejection:

**"HTTP not allowed"**
- ✅ Setup HTTPS first

**"Privacy policy not accessible"**
- ✅ Ensure URL is publicly accessible

**"Missing required screenshots"**
- ✅ Upload minimum 2 for Android, 3 for iOS

---

## 📞 **Support**

If stuck:
- **Android:** https://support.google.com/googleplay/android-developer/
- **iOS:** https://developer.apple.com/contact/

---

Last Updated: December 2024

