import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { useNotifications } from '../hooks/useNotifications';

const NotificationTest: React.FC = () => {
  const theme = useTheme();
  const { 
    isInitialized, 
    expoPushToken, 
    sendTestNotification, 
    getScheduledNotifications,
    cancelAllNotifications 
  } = useNotifications();
  
  const [scheduledCount, setScheduledCount] = useState(0);

  const handleTestNotification = async () => {
    try {
      const notificationId = await sendTestNotification();
      if (notificationId) {
        console.log('✅ Test notification scheduled:', notificationId);
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  };

  const handleGetScheduled = async () => {
    try {
      const notifications = await getScheduledNotifications();
      setScheduledCount(notifications.length);
      console.log('📅 Scheduled notifications:', notifications.length);
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
    }
  };

  const handleCancelAll = async () => {
    try {
      const success = await cancelAllNotifications();
      if (success) {
        setScheduledCount(0);
        console.log('✅ All notifications cancelled');
      }
    } catch (error) {
      console.error('❌ Error cancelling notifications:', error);
    }
  };

  if (!isInitialized) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            📱 Initializing notifications...
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          📱 Notification Test
        </Text>
        
        <Text variant="bodySmall" style={[styles.token, { color: theme.colors.onSurfaceVariant }]}>
          Token: {expoPushToken ? `${expoPushToken.substring(0, 20)}...` : 'Not available'}
        </Text>
        
        <Text variant="bodySmall" style={[styles.status, { color: theme.colors.primary }]}>
          Status: {isInitialized ? '✅ Initialized' : '❌ Not initialized'}
        </Text>
        
        <Text variant="bodySmall" style={[styles.scheduled, { color: theme.colors.onSurfaceVariant }]}>
          Scheduled: {scheduledCount} notifications
        </Text>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleTestNotification}
            style={styles.button}
            compact
          >
            Send Test
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleGetScheduled}
            style={styles.button}
            compact
          >
            Get Scheduled
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleCancelAll}
            style={styles.button}
            compact
          >
            Cancel All
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  token: {
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  status: {
    marginBottom: 4,
  },
  scheduled: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: 80,
  },
});

export default NotificationTest;
