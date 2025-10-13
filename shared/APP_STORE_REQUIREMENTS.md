# App Store Submission Requirements

## ✅ Completed

### Privacy Policy
- ✅ Comprehensive privacy policy created
- ✅ Added to Sign Up screen with checkbox
- ✅ Users must accept before creating account
- ✅ Accessible via navigation

### App Information
- ✅ App Name: Deep Cleaning Hub
- ✅ Package Name: `com.deepcleanhub.mobile`
- ✅ Version: 1.0.0
- ✅ Build Number: 9
- ✅ Category: House & Home
- ✅ Target Audience: All ages

### Contact Information
- ✅ Website: deepcleaninghub.com
- ✅ Email: info@deepcleaninghub.com
- ✅ Phone: +49 160 9704 4182
- ✅ Location: Frankfurt, Germany

---

## ⚠️ Still Needed Before Submission

### 1. CRITICAL: HTTPS Backend (BLOCKER)
**Current:** `http://13.211.76.43:5001/api`
**Required:** `https://api.deepcleaninghub.com/api`

**Why it's blocking:**
- Both Google Play and Apple App Store reject apps using HTTP
- Security risk for user data

**How to fix:**
1. Purchase domain: deepcleaninghub.com
2. Set up SSL certificate (free via Let's Encrypt)
3. Configure Nginx/CloudFlare to proxy HTTPS → HTTP
4. Update `API_BASE_URL` in `shared/src/config/environment.ts`

### 2. Developer Accounts
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Apple Developer Account ($99/year)

### 3. Screenshots (Required)
Need to capture and save:

**Android (Google Play):**
- [ ] At least 2 screenshots (1080x1920px or higher)
- [ ] Recommended: 8 screenshots
- [ ] Feature graphic: 1024x500px

**iOS (App Store):**
- [ ] iPhone 6.7": 1290x2796px (3-8 screenshots)
- [ ] iPhone 6.5": 1242x2688px (3-8 screenshots)
- [ ] iPhone 5.5": 1242x2208px (3-8 screenshots)

**Suggested Screenshots:**
1. Home screen
2. Services list
3. Service detail/booking
4. Cart screen
5. Booking confirmation
6. Profile/Account
7. Order history
8. Special offers

### 4. App Store Descriptions

**Short Description (80 characters):**
```
Professional cleaning services at your doorstep. Book now & save!
```

**Full Description (4000 characters max):**
```
Deep Cleaning Hub - Your Trusted Cleaning Service Partner

Experience professional home and office cleaning services with just a few taps. Deep Cleaning Hub connects you with expert cleaners in Frankfurt, Germany, making it easier than ever to maintain a spotless living or working space.

🏠 OUR SERVICES:
• Deep Cleaning - Comprehensive home cleaning
• Office Setup Cleaning - Get your workspace pristine
• Moving Cleaning - Before or after relocation
• Furniture Cleaning - Professional upholstery care
• Painting Preparation - Prep and post-painting cleanup

✨ WHY CHOOSE US:
• Verified and trained cleaning professionals
• Flexible scheduling to fit your lifestyle
• Transparent pricing with no hidden fees
• Secure online booking and payment
• Multi-language support (English, German, and 12 more languages)
• Special weekend offers (20% OFF)
• Holiday promotions (25% OFF)

📱 FEATURES:
• Easy booking in just a few taps
• Real-time booking confirmations
• Order history and tracking
• Secure user profiles
• Multiple service options and customizations
• Push notifications for booking updates
• WhatsApp and email confirmations

💰 SPECIAL OFFERS:
• Weekend Discount: Get 20% OFF on all services booked for weekends
• Holiday Special: Save 25% during public holidays
• First-time customer benefits

🔒 YOUR DATA IS SAFE:
We take your privacy seriously. All personal information is encrypted and stored securely. Read our comprehensive Privacy Policy in the app.

📞 CUSTOMER SUPPORT:
Need help? Our friendly support team is ready to assist you.
Phone: +49 160 9704 4182
Email: info@deepcleaninghub.com
Website: deepcleaninghub.com

🌍 SERVING FRANKFURT, GERMANY:
Currently serving the Frankfurt metropolitan area with plans to expand to more cities soon.

Download Deep Cleaning Hub today and experience the ease of professional cleaning services at your fingertips!
```

### 5. Keywords (iOS Only - 100 characters)
```
cleaning,house,home,service,deep clean,professional,maid,office,moving,furniture
```

### 6. Build Files

**Android:**
- [ ] Build AAB (not APK) for Play Store:
  ```bash
  cd shared
  ./android/gradlew bundleRelease
  ```
- [ ] Sign with release keystore
- [ ] Set up Google Play App Signing

**iOS:**
- [ ] Build with Xcode on Mac
- [ ] Archive for App Store distribution
- [ ] Code signing with Distribution certificate
- [ ] Upload via Xcode or Transporter

### 7. App Store Connect / Play Console Setup

**Google Play:**
- [ ] Create app listing
- [ ] Upload AAB
- [ ] Fill content rating questionnaire
- [ ] Complete data safety form
- [ ] Add privacy policy URL
- [ ] Set pricing & distribution
- [ ] Submit for review

**Apple App Store:**
- [ ] Create app in App Store Connect
- [ ] Upload build via Xcode
- [ ] Add app privacy details
- [ ] Provide test account credentials
- [ ] Submit for review

### 8. Legal Documents

- [x] Privacy Policy (completed)
- [ ] Terms of Service
- [ ] Refund/Cancellation Policy

### 9. Testing

- [ ] Test on physical Android devices (Android 12+)
- [ ] Test on physical iOS devices (iOS 15+)
- [ ] Test all payment flows
- [ ] Test booking confirmation emails
- [ ] Test push notifications
- [ ] Test promotional notifications
- [ ] Verify all features work
- [ ] Check translations in all languages

---

## 📝 Submission Checklist

### Before Submitting:
- [ ] Replace HTTP with HTTPS
- [ ] Remove all test/debug code
- [ ] Update app version if needed
- [ ] Test on real devices
- [ ] Take all screenshots
- [ ] Write app descriptions
- [ ] Prepare privacy policy URL (hosted online)
- [ ] Create Terms of Service
- [ ] Build production AAB/IPA
- [ ] Sign builds properly

### Google Play Submission:
- [ ] Complete app listing
- [ ] Upload signed AAB
- [ ] Add screenshots and graphics
- [ ] Fill out content rating
- [ ] Complete data safety form
- [ ] Set pricing (free/paid)
- [ ] Select countries for distribution
- [ ] Submit for review

### Apple App Store Submission:
- [ ] Create app in App Store Connect
- [ ] Upload signed IPA
- [ ] Add screenshots for all device sizes
- [ ] Write description and keywords
- [ ] Fill app privacy details
- [ ] Provide demo/test account
- [ ] Submit for review

---

## 💰 Estimated Costs

| Item | Cost | Frequency |
|------|------|-----------|
| Google Play Developer Account | $25 | One-time |
| Apple Developer Account | $99 | Per year |
| Domain (deepcleaninghub.com) | $10-15 | Per year |
| SSL Certificate | Free (Let's Encrypt) | - |
| **Year 1 Total** | ~$134 | - |
| **Year 2+ Total** | ~$109/year | - |

---

## 📞 Support & Resources

### Apple Resources:
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Connect](https://appstoreconnect.apple.com/)

### Google Resources:
- [Play Console](https://play.google.com/console)
- [Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [Content Policy](https://support.google.com/googleplay/android-developer/answer/9876937)

---

## ⏱️ Timeline

**Estimated timeline from now to published:**

- Week 1-2: Setup HTTPS, developer accounts, legal docs
- Week 3: Build, test, screenshots
- Week 4: Submit and review
- **Total: 4-6 weeks**

**Review times:**
- Google Play: 1-3 days typically
- Apple App Store: 1-3 days (can be longer for first submission)

---

## 🚀 Next Steps

1. **PRIORITY: Set up HTTPS backend** (this is the biggest blocker)
2. Register developer accounts
3. Take app screenshots
4. Build AAB and IPA files
5. Submit for review

---

Last Updated: December 2024

