import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  scheduledTime: Date;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private scheduledNotifications: Set<string> = new Set();

  async initialize(): Promise<boolean> {
    try {
      // Check if device is physical (notifications don't work on simulators)
      if (!Device.isDevice) {
        // Push notifications only work on physical devices - silent
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        // Failed to get push token - silent
        return false;
      }

      // For local notifications, we don't need a push token
      // Only get push token if we need remote notifications
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        this.expoPushToken = token.data;
        // Expo push token obtained - silent
        await AsyncStorage.setItem('expoPushToken', this.expoPushToken);
      } catch (tokenError) {
        // Could not get push token - silent
        // Local notifications don't require a push token
      }

      // Notifications initialized - silent
      return true;
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      return false;
    }
  }

  async getPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }

    // Try to get from AsyncStorage
    try {
      const storedToken = await AsyncStorage.getItem('expoPushToken');
      if (storedToken) {
        this.expoPushToken = storedToken;
        return storedToken;
      }
    } catch (error) {
      // Could not retrieve stored push token - silent
    }

    return null;
  }

  async scheduleServiceReminder(bookingData: {
    id: string;
    serviceDate: string;
    serviceTime: string;
    serviceTitle: string;
    customerName: string;
    address: string;
  }): Promise<string | null> {
    try {
      // Check if we've already scheduled a reminder for this booking
      const notificationKey = `service_reminder_${bookingData.id}`;
      if (this.scheduledNotifications.has(notificationKey)) {
        // Service reminder already scheduled - silent
        return null;
      }

      const serviceDateTime = new Date(`${bookingData.serviceDate}T${bookingData.serviceTime}`);
      const reminderTime = new Date(serviceDateTime);
      
      // Schedule notification for the morning of the service (8 AM)
      reminderTime.setHours(8, 0, 0, 0);

      // If the service is today and it's already past 8 AM, schedule for tomorrow
      const now = new Date();
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Service Reminder',
          body: `Hi ${bookingData.customerName}! Your ${bookingData.serviceTitle} service is scheduled for today at ${bookingData.serviceTime}.`,
          data: {
            bookingId: bookingData.id,
            serviceDate: bookingData.serviceDate,
            serviceTime: bookingData.serviceTime,
            type: 'service_reminder'
          },
          sound: 'default',
        },
        trigger: reminderTime as any,
      });

      // Mark this notification as scheduled
      this.scheduledNotifications.add(notificationKey);
      // Service reminder scheduled - silent

      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling service reminder:', error);
      return null;
    }
  }

  async scheduleBookingConfirmation(bookingData: {
    id: string;
    serviceDate: string;
    serviceTime: string;
    serviceTitle: string;
    customerName: string;
  }): Promise<string | null> {
    try {
      // scheduleBookingConfirmation called - silent
      
      // Check if we've already scheduled a notification for this booking
      const notificationKey = `booking_confirmation_${bookingData.id}`;
      if (this.scheduledNotifications.has(notificationKey)) {
        // Booking confirmation already scheduled - silent
        return null;
      }

      // Scheduling booking confirmation - silent
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Booking Confirmed',
          body: `Your ${bookingData.serviceTitle} has been booked for ${bookingData.serviceDate} at ${bookingData.serviceTime}.`,
          data: {
            bookingId: bookingData.id,
            serviceDate: bookingData.serviceDate,
            serviceTime: bookingData.serviceTime,
            type: 'booking_confirmation'
          },
          sound: 'default',
        },
        trigger: null, // Show immediately
      });

      // Mark this notification as scheduled
      this.scheduledNotifications.add(notificationKey);
      // Booking confirmation notification sent - silent
      return notificationId;
    } catch (error) {
      console.error('❌ Error sending booking confirmation notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      // Notification cancelled - silent
      return true;
    } catch (error) {
      console.error('❌ Error cancelling notification:', error);
      return false;
    }
  }

  async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      // All notifications cancelled - silent
      return true;
    } catch (error) {
      console.error('❌ Error cancelling all notifications:', error);
      return false;
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Test notification
  async sendTestNotification(): Promise<string | null> {
    try {
      // Check if device is physical (notifications don't work on simulators)
      if (!Device.isDevice) {
        // Test notifications only work on physical devices - silent
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'This is a test notification from Deep Cleaning Hub!',
          data: { type: 'test' },
          sound: 'default',
        },
        trigger: { seconds: 2 } as any, // Show after 2 seconds
      });

      // Test notification sent - silent
      return notificationId;
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
