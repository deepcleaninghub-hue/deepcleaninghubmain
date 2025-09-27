import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import notificationService from '../services/notificationService';

export interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isInitialized: boolean;
  initializeNotifications: () => Promise<boolean>;
  scheduleServiceReminder: (bookingData: {
    id: string;
    serviceDate: string;
    serviceTime: string;
    serviceTitle: string;
    customerName: string;
    address: string;
  }) => Promise<string | null>;
  scheduleBookingConfirmation: (bookingData: {
    id: string;
    serviceDate: string;
    serviceTime: string;
    serviceTitle: string;
    customerName: string;
  }) => Promise<string | null>;
  sendTestNotification: () => Promise<string | null>;
  cancelNotification: (notificationId: string) => Promise<boolean>;
  cancelAllNotifications: () => Promise<boolean>;
  getScheduledNotifications: () => Promise<Notifications.NotificationRequest[]>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize notifications on mount
    initializeNotifications();

    // Set up notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📱 Notification response:', response);
      const data = response.notification.request.content.data;
      
      if (data?.type === 'service_reminder') {
        // Handle service reminder tap
        console.log('🔔 Service reminder tapped:', data);
      } else if (data?.type === 'booking_confirmation') {
        // Handle booking confirmation tap
        console.log('✅ Booking confirmation tapped:', data);
      }
    });

    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  const initializeNotifications = async (): Promise<boolean> => {
    try {
      const success = await notificationService.initialize();
      if (success) {
        const token = await notificationService.getPushToken();
        setExpoPushToken(token);
        setIsInitialized(true);
        console.log('✅ Notifications initialized successfully');
      } else {
        console.log('❌ Failed to initialize notifications');
      }
      return success;
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      return false;
    }
  };

  const scheduleServiceReminder = useCallback(async (bookingData: {
    id: string;
    serviceDate: string;
    serviceTime: string;
    serviceTitle: string;
    customerName: string;
    address: string;
  }): Promise<string | null> => {
    if (!isInitialized) {
      console.log('⚠️ Notifications not initialized');
      return null;
    }

    return await notificationService.scheduleServiceReminder(bookingData);
  }, [isInitialized]);

  const scheduleBookingConfirmation = useCallback(async (bookingData: {
    id: string;
    serviceDate: string;
    serviceTime: string;
    serviceTitle: string;
    customerName: string;
  }): Promise<string | null> => {
    if (!isInitialized) {
      console.log('⚠️ Notifications not initialized');
      return null;
    }

    return await notificationService.scheduleBookingConfirmation(bookingData);
  }, [isInitialized]);

  const sendTestNotification = useCallback(async (): Promise<string | null> => {
    if (!isInitialized) {
      console.log('⚠️ Notifications not initialized');
      return null;
    }

    return await notificationService.sendTestNotification();
  }, [isInitialized]);

  const cancelNotification = async (notificationId: string): Promise<boolean> => {
    return await notificationService.cancelNotification(notificationId);
  };

  const cancelAllNotifications = async (): Promise<boolean> => {
    return await notificationService.cancelAllNotifications();
  };

  const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
    return await notificationService.getScheduledNotifications();
  };

  return {
    expoPushToken,
    notification,
    isInitialized,
    initializeNotifications,
    scheduleServiceReminder,
    scheduleBookingConfirmation,
    sendTestNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
  };
};

export default useNotifications;
