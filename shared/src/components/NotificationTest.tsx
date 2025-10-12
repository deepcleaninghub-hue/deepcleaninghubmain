import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text, useTheme, Divider } from 'react-native-paper';
import { useNotifications } from '../hooks/useNotifications';
import { useLanguage } from '../contexts/LanguageContext';
import { promotionalNotificationService } from '../services/promotionalNotificationService';

const NotificationTest: React.FC = () => {
  const theme = useTheme();
  const { t } = useLanguage();
  const { 
    isInitialized, 
    expoPushToken, 
    sendTestNotification, 
    getScheduledNotifications,
    cancelAllNotifications 
  } = useNotifications();
  
  const [scheduledCount, setScheduledCount] = useState(0);
  const [promoCount, setPromoCount] = useState(0);

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

  const handleTestWeekendPromo = async () => {
    try {
      const notificationId = await promotionalNotificationService.sendTestPromotion('weekend');
      if (notificationId) {
        console.log('✅ Test weekend promotion scheduled:', notificationId);
      }
    } catch (error) {
      console.error('❌ Error sending test weekend promotion:', error);
    }
  };

  const handleTestHolidayPromo = async () => {
    try {
      const notificationId = await promotionalNotificationService.sendTestPromotion('holiday');
      if (notificationId) {
        console.log('✅ Test holiday promotion scheduled:', notificationId);
      }
    } catch (error) {
      console.error('❌ Error sending test holiday promotion:', error);
    }
  };

  const handleGetPromoScheduled = async () => {
    try {
      const promotions = await promotionalNotificationService.getScheduledPromotions();
      setPromoCount(promotions.length);
      console.log('📅 Scheduled promotions:', promotions.length);
      console.log('📋 Promotion details:', promotions);
    } catch (error) {
      console.error('❌ Error getting scheduled promotions:', error);
    }
  };

  const handleReschedulePromos = async () => {
    try {
      await promotionalNotificationService.initialize();
      await handleGetPromoScheduled();
      console.log('✅ Promotional notifications rescheduled');
    } catch (error) {
      console.error('❌ Error rescheduling promotions:', error);
    }
  };

  const handleTest5Minutes = async () => {
    try {
      const notificationId = await promotionalNotificationService.scheduleTestAtTime('weekend', 5);
      if (notificationId) {
        const now = new Date();
        const futureTime = new Date(now.getTime() + 5 * 60000);
        console.log(`✅ Test notification scheduled for ${futureTime.toLocaleTimeString()}`);
        alert(`🕐 Test notification will fire at ${futureTime.toLocaleTimeString()}\n\nClose the app and wait!`);
      }
    } catch (error) {
      console.error('❌ Error scheduling 5-minute test:', error);
    }
  };

  if (!isInitialized) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            📱 {t('notifications.initializing')}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          📱 {t('notifications.test')}
        </Text>
        
        <Text variant="bodySmall" style={[styles.token, { color: theme.colors.onSurfaceVariant }]}>
          {t('notifications.token')}: {expoPushToken ? `${expoPushToken.substring(0, 20)}...` : t('notifications.notAvailable')}
        </Text>
        
        <Text variant="bodySmall" style={[styles.status, { color: theme.colors.primary }]}>
          {t('notifications.status')}: {isInitialized ? `✅ ${t('notifications.initialized')}` : `❌ ${t('notifications.notInitialized')}`}
        </Text>
        
        <Text variant="bodySmall" style={[styles.scheduled, { color: theme.colors.onSurfaceVariant }]}>
          {t('notifications.scheduled')}: {scheduledCount} {t('notifications.notificationsCount')}
        </Text>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleTestNotification}
            style={styles.button}
            compact
          >
            {t('notifications.sendTest')}
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleGetScheduled}
            style={styles.button}
            compact
          >
            {t('notifications.getScheduled')}
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleCancelAll}
            style={styles.button}
            compact
          >
            {t('notifications.cancelAll')}
          </Button>
        </View>

        <Divider style={styles.divider} />

        <Text variant="titleSmall" style={[styles.subtitle, { color: theme.colors.primary }]}>
          🎁 Promotional Notifications
        </Text>

        <Text variant="bodySmall" style={[styles.promoInfo, { color: theme.colors.onSurfaceVariant }]}>
          Scheduled Promos: {promoCount} (Weekends + Holidays)
        </Text>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleTestWeekendPromo}
            style={styles.button}
            compact
            icon="sale"
          >
            Test Weekend (20%)
          </Button>
          
          <Button 
            mode="contained" 
            onPress={handleTestHolidayPromo}
            style={styles.button}
            compact
            icon="party-popper"
          >
            Test Holiday (25%)
          </Button>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={handleGetPromoScheduled}
            style={styles.button}
            compact
          >
            Get Promo Count
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleReschedulePromos}
            style={styles.button}
            compact
          >
            Reschedule All
          </Button>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleTest5Minutes}
            style={styles.fullButton}
            compact
            icon="clock-outline"
            buttonColor="#FF6B35"
          >
            Test in 5 Minutes (Close App!)
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
    marginBottom: 8,
  },
  button: {
    flex: 1,
    minWidth: 80,
  },
  fullButton: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  subtitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  promoInfo: {
    marginBottom: 12,
  },
});

export default NotificationTest;
