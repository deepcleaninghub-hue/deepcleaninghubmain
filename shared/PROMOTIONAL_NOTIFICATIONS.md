# Promotional Notifications System

## Overview
The app automatically schedules local push notifications for promotional discounts on weekends and public holidays.

## Features

### 1. Weekend Promotions (20% OFF)
- **When**: Every Saturday and Sunday
- **Time**: 10:00 AM
- **Message**: "✨ Keep Your Home Spotless! Get 20% OFF Deep Cleaning this weekend!"
- **Coverage**: All weekends through 2027

### 2. Holiday Promotions (25% OFF)
- **When**: German public holidays
- **Time**: 9:00 AM
- **Message**: "🎉 Festival Cleaning Offer 🎉 - Save 25% OFF!"
- **Holidays Covered**:
  - New Year's Day
  - International Women's Day (March 8)
  - Good Friday, Easter Monday
  - Labour Day (May 1)
  - Ascension Day
  - Whit Monday
  - Corpus Christi
  - German Unity Day (October 3)
  - Reformation Day (October 31)
  - Christmas (December 25-26)

## How It Works

### Automatic Scheduling
1. **On App Launch**: Promotional notifications are automatically scheduled when the app starts
2. **Smart Rescheduling**: The system checks every 24 hours and reschedules if needed
3. **90-Day Window**: Notifications are scheduled for the next 90 days (Expo limitation)
4. **Priority System**: Holiday notifications take precedence over weekend notifications if they fall on the same day

### Data Storage
- Scheduled notifications are stored in AsyncStorage
- Last schedule date is tracked to prevent duplicate scheduling
- Notification IDs are saved for easy cancellation if needed

## Testing

The app includes a testing interface in the NotificationTest component:

### Test Buttons:
- **Test Weekend (20%)**: Send a test weekend promotion notification (triggers in 2 seconds)
- **Test Holiday (25%)**: Send a test holiday promotion notification (triggers in 2 seconds)
- **Get Promo Count**: Check how many promotional notifications are currently scheduled
- **Reschedule All**: Manually trigger the rescheduling process

### Developer Testing:
```typescript
import { promotionalNotificationService } from './services/promotionalNotificationService';

// Initialize (automatically called on app start)
await promotionalNotificationService.initialize();

// Send test notifications
await promotionalNotificationService.sendTestPromotion('weekend');
await promotionalNotificationService.sendTestPromotion('holiday');

// Get scheduled promotions
const promotions = await promotionalNotificationService.getScheduledPromotions();
console.log('Scheduled promotions:', promotions);

// Cancel all promotional notifications
await promotionalNotificationService.cancelAllPromotionalNotifications();
```

## Important Notes

### Device Requirements
- ✅ Works on physical devices (iOS & Android)
- ❌ Does NOT work on simulators/emulators
- ⚠️ Requires notification permissions

### Limitations
- **Maximum 90 days**: Due to Expo's local notification limits, we schedule up to 90 days in advance
- **Automatic Refresh**: App reschedules notifications every 24 hours when opened
- **Local Only**: These are local notifications, not push notifications from a server

### Production Considerations
1. **Permissions**: The app requests notification permissions on first launch
2. **Background**: Notifications are scheduled even when app is closed
3. **Updates**: If dates need to be changed, update the `PUBLIC_HOLIDAYS` array in `promotionalNotificationService.ts`

## File Structure

```
shared/src/
├── services/
│   ├── promotionalNotificationService.ts  # Main promotional notification logic
│   └── notificationService.ts              # Base notification service
├── components/
│   ├── NotificationProvider.tsx            # Initializes notifications on app start
│   └── NotificationTest.tsx                # Testing interface
└── hooks/
    └── useNotifications.ts                 # Notification hook
```

## Customization

### Adding New Holidays
Edit `/shared/src/services/promotionalNotificationService.ts`:

```typescript
const PUBLIC_HOLIDAYS = [
  '2025-01-01', // New Year
  '2025-12-25', // Christmas
  // Add your new holiday here:
  '2025-11-11', // Veterans Day
];
```

### Changing Notification Time
Edit the `scheduleWeekendPromotions` or `scheduleHolidayPromotions` methods:

```typescript
// Change from 10 AM to 8 AM for weekends
notificationDate.setHours(8, 0, 0, 0); // Instead of (10, 0, 0, 0)
```

### Modifying Messages
Edit the notification content in the scheduling methods:

```typescript
content: {
  title: 'Your Custom Title!',
  body: 'Your custom message here...',
  // ...
}
```

## Troubleshooting

### Notifications Not Appearing
1. Check device permissions: Settings > App > Notifications
2. Verify app is on a physical device (not simulator)
3. Check scheduled count in NotificationTest component
4. Review console logs for errors

### Too Many/Few Notifications
- Use "Get Promo Count" to check current schedule
- Use "Reschedule All" to force refresh
- Check if 24-hour window has passed

### Testing Issues
- Test notifications appear after 2 seconds
- Ensure notification permissions are granted
- Check device Do Not Disturb settings

## Future Enhancements

Potential improvements:
- [ ] Add region-specific holidays
- [ ] Allow users to opt-out of promotional notifications
- [ ] Add analytics tracking for notification engagement
- [ ] Server-side scheduling for unlimited date range
- [ ] A/B testing different promotional messages
- [ ] Time zone awareness for international users

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Use the NotificationTest component for debugging
3. Review AsyncStorage for stored notification data
4. Ensure expo-notifications is properly installed

## Version History

- **v1.0.0** (2025-10-12): Initial implementation
  - Weekend notifications (20% OFF)
  - Holiday notifications (25% OFF)
  - Testing interface
  - Automatic scheduling on app launch

