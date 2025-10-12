# Testing Promotional Notifications - Complete Guide

## Prerequisites

✅ **Physical Android or iOS device** (notifications don't work on simulators)
✅ **APK/IPA installed** on your device
✅ **Notification permissions** granted
✅ **NotificationTest component** accessible in your app

## Quick Test Methods

### Method 1: Instant Test (2 Seconds) ⚡

**Best for:** Quick verification that notifications work

**Steps:**
1. Open the app on your device
2. Navigate to NotificationTest screen
3. Click **"Test Weekend (20%)"** or **"Test Holiday (25%)"**
4. **Close the app completely** (swipe it away)
5. **Wait 2 seconds**
6. ✅ Notification appears!

**What this proves:**
- ✅ Notifications work on your device
- ✅ Notifications fire even when app is closed
- ✅ Message content is correct
- ✅ Sound/vibration works

---

### Method 2: Real-Time Test (5 Minutes) ⏰

**Best for:** Testing that scheduled notifications actually fire at the right time

**Steps:**
1. Open the app
2. Navigate to NotificationTest screen
3. Click **"Test in 5 Minutes (Close App!)"**
4. You'll see an alert: "Test notification will fire at [TIME]"
5. Note the time
6. **Close the app completely**
7. **Put phone in pocket and wait 5 minutes**
8. ✅ Notification fires at exact time!

**What this proves:**
- ✅ Scheduled notifications fire at correct time
- ✅ App doesn't need to be running
- ✅ Works in background
- ✅ System respects scheduled time

---

### Method 3: Check Scheduled Count 📊

**Best for:** Verifying automatic scheduling is working

**Steps:**
1. Open the app fresh (first time or after 24 hours)
2. Navigate to NotificationTest screen
3. Click **"Get Promo Count"**
4. Check the displayed number (should be ~25-30)
5. Look at console logs for details:
```
📅 Scheduled promotions: 28
📋 Promotion details: [
  { id: "abc123", date: "2025-10-18", type: "weekend" },
  { id: "def456", date: "2025-10-19", type: "weekend" },
  { id: "ghi789", date: "2025-10-31", type: "holiday" },
  ...
]
```

**What this proves:**
- ✅ Automatic scheduling works
- ✅ Correct number of notifications
- ✅ Dates are correct
- ✅ Mix of weekends and holidays

---

### Method 4: Full Production Test 🎯

**Best for:** Testing the real user experience over time

**Steps:**
1. **Day 1:** Install fresh on device
   - Open app, grant permissions
   - Check "Get Promo Count" = ~28 notifications
   - Note first scheduled date (should be this weekend)

2. **Day 1 - Weekend:** Wait for actual weekend
   - Saturday 10 AM: ✅ Should receive "20% OFF Weekend" notification
   - Sunday 10 AM: ✅ Should receive another weekend notification

3. **Day 10:** Don't open app for 10 days
   - Notifications should still fire on weekends
   - Check phone notification history

4. **Day 30:** Open app again
   - System checks: "Last scheduled 30 days ago? No"
   - Keeps existing schedule
   - "Get Promo Count" should show remaining notifications

5. **Day 95:** Open app (after 90-day window expired)
   - System checks: "Last scheduled 95 days ago? Yes"
   - Reschedules fresh 90 days
   - "Get Promo Count" = ~28 new notifications

**What this proves:**
- ✅ Complete end-to-end functionality
- ✅ Real timing is correct
- ✅ Works without opening app
- ✅ Auto-reschedules when needed

---

## Developer Testing Commands

### Using Chrome DevTools / Console

If you can access the console while running on device:

```javascript
// Get promotional notification service
import { promotionalNotificationService } from './services/promotionalNotificationService';

// Test immediate notification (2 seconds)
await promotionalNotificationService.sendTestPromotion('weekend', 2);
await promotionalNotificationService.sendTestPromotion('holiday', 2);

// Test in 10 seconds
await promotionalNotificationService.sendTestPromotion('weekend', 10);

// Test in specific minutes
await promotionalNotificationService.scheduleTestAtTime('weekend', 5);  // 5 minutes
await promotionalNotificationService.scheduleTestAtTime('holiday', 10); // 10 minutes

// Get all scheduled promotions
const promos = await promotionalNotificationService.getScheduledPromotions();
console.log('Total scheduled:', promos.length);
console.log('Details:', promos);

// Force reschedule (ignores 24-hour check)
await promotionalNotificationService.cancelAllPromotionalNotifications();
await promotionalNotificationService.initialize();

// Get scheduled count again
const newPromos = await promotionalNotificationService.getScheduledPromotions();
console.log('After reschedule:', newPromos.length);
```

---

## Testing Checklist

### Initial Setup ✅
- [ ] App installed on physical device
- [ ] Notification permissions granted
- [ ] App opened at least once
- [ ] NotificationTest component accessible

### Immediate Tests ✅
- [ ] "Test Weekend (20%)" fires in 2 seconds
- [ ] "Test Holiday (25%)" fires in 2 seconds
- [ ] Notifications appear when app is closed
- [ ] Sound/vibration works
- [ ] Message content is correct

### Scheduling Tests ✅
- [ ] "Get Promo Count" shows ~25-30 notifications
- [ ] Console shows detailed promotion list
- [ ] Dates are within next 90 days
- [ ] Mix of weekend and holiday types
- [ ] No duplicate dates

### Real-Time Tests ✅
- [ ] "Test in 5 Minutes" fires at exact time
- [ ] Notification appears even with app closed
- [ ] System clock is used (not app timer)

### Long-Term Tests ✅
- [ ] Weekend notifications fire on actual Saturdays/Sundays
- [ ] Holiday notifications fire on actual holidays
- [ ] Notifications work without opening app for weeks
- [ ] Reschedule happens after 24+ hours
- [ ] New 90-day window calculated correctly

---

## Troubleshooting Tests

### Problem: No notifications appearing

**Test:**
```bash
# Check notification permissions
Settings > Apps > [Your App] > Notifications > Enabled? ✅

# Check Do Not Disturb
Settings > Sound > Do Not Disturb > Disabled? ✅

# Check scheduled notifications
In app: Click "Get Promo Count" > Should show number > 0
```

**Solution:**
- Grant notification permissions
- Disable Do Not Disturb during test
- Click "Reschedule All" to force refresh

---

### Problem: Wrong number of notifications

**Test:**
```javascript
// Check console for this output:
📅 Scheduled X weekend promotions
📅 Scheduled Y holiday promotions
```

**Expected:**
- Weekends: ~26 (13 weeks × 2 days)
- Holidays: ~2-4 (depends on current date)
- Total: ~28-30

**Solution:**
If count is wrong:
- Check console for errors
- Click "Reschedule All"
- Verify dates in PUBLIC_HOLIDAYS array

---

### Problem: Notifications fire at wrong time

**Test:**
```javascript
// Schedule test for exact time
await promotionalNotificationService.scheduleTestAtTime('weekend', 1);
// Should fire in exactly 1 minute
```

**Solution:**
- Check device timezone settings
- Verify system clock is correct
- Test again with longer delay (5 minutes)

---

## Advanced Testing

### Test Specific Date Range

Temporarily modify the code for testing:

```typescript
// In promotionalNotificationService.ts
// Change 90 to 7 for testing (next week only)
const endDate = new Date();
endDate.setDate(endDate.getDate() + 7); // Instead of 90
```

This lets you:
- See exactly which dates are scheduled
- Test this weekend specifically
- Verify holiday detection quickly

---

### Test Rescheduling Logic

```typescript
// Force multiple reschedules
await promotionalNotificationService.initialize(); // First schedule
console.log('First schedule:', await promotionalNotificationService.getScheduledPromotions());

await promotionalNotificationService.cancelAllPromotionalNotifications();
await promotionalNotificationService.initialize(); // Second schedule
console.log('Second schedule:', await promotionalNotificationService.getScheduledPromotions());

// Both should have similar counts (~28-30)
```

---

## Production Verification

Before releasing to users:

### Day 1: Installation
- [ ] Install on 3 different devices (if possible)
- [ ] Grant permissions on all
- [ ] Verify "Get Promo Count" shows ~28-30 on all

### Day 3: First Weekend
- [ ] Saturday 10 AM: Verify notification received on all devices
- [ ] Sunday 10 AM: Verify notification received on all devices

### Week 2: Check Consistency
- [ ] Weekend notifications still firing
- [ ] App hasn't been opened since Day 1
- [ ] All 3 devices still receiving

### Day 30: Reschedule Test
- [ ] Open app on one device
- [ ] Verify "Get Promo Count" still ~25+ (some fired already)
- [ ] Close app
- [ ] Next weekend: Notifications still work

### Day 91+: Long-term Test
- [ ] Open app after 90 days
- [ ] System reschedules automatically
- [ ] "Get Promo Count" = ~28-30 again
- [ ] Next weekend: Notifications resume

---

## Success Criteria

✅ **All tests passed** if:
1. Instant tests (2 sec) work consistently
2. 5-minute test fires at exact time
3. "Get Promo Count" shows 25-35 notifications
4. Real weekend notifications fire on Saturday/Sunday at 10 AM
5. Real holiday notifications fire on holidays at 9 AM
6. Notifications work with app closed
7. Reschedule happens automatically after 24 hours
8. System works for 90+ days without issues

---

## Quick Reference

| Test Type | Duration | Purpose |
|-----------|----------|---------|
| Instant Test | 2 sec | Verify basic functionality |
| 5-Minute Test | 5 min | Test background scheduling |
| Count Check | Instant | Verify correct scheduling |
| Weekend Test | Days | Real-world validation |
| Long-term Test | 90+ days | Production readiness |

---

## Notes

⚠️ **Simulators:** Do not work - always test on real devices
⚠️ **Battery Saver:** May delay notifications - disable for testing
⚠️ **Do Not Disturb:** Blocks notifications - disable for testing
✅ **Background:** Notifications work with app completely closed
✅ **Offline:** Local notifications don't need internet

---

**Need Help?** Check console logs for detailed debugging information.

