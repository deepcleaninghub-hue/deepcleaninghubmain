import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { initializeNotifications, isInitialized } = useNotifications();

  useEffect(() => {
    // Initialize notifications when the app starts
    initializeNotifications();
  }, [initializeNotifications]);

  // You can add loading state or error handling here if needed
  if (!isInitialized) {
    // App continues to load even if notifications aren't initialized
    console.log('📱 Initializing notifications...');
  }

  return <>{children}</>;
};

export default NotificationProvider;
