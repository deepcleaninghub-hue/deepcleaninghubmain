// Enhanced with new color palette: #F9F7F7, #DBE2EF, #3F72AF, #112D4E
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Text, Card, Button, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AppHeader from '../../components/AppHeader';
import { CartStackScreenProps } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../hooks/useNotifications';

type Props = CartStackScreenProps<'OrderConfirmation'>;

const OrderConfirmationScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { bookingId, orderData } = route.params || {};
  const [refreshing, setRefreshing] = useState(false);
  const [emailsSent, setEmailsSent] = useState(true); // Emails are sent during booking creation
  const [notificationsScheduled, setNotificationsScheduled] = useState(false);
  const { scheduleBookingConfirmation, scheduleServiceReminder, isInitialized } = useNotifications();

  const handleContinueShopping = () => {
    navigation.navigate('Services' as any);
  };


  const handleViewOrders = () => {
    navigation.navigate('Orders' as any);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Schedule notifications when order is confirmed (only once)
  useEffect(() => {
    console.log('🚨🚨🚨 NEW NOTIFICATION SYSTEM LOADED! 🚨🚨🚨');
    
    const scheduleNotifications = async () => {
      console.log('🔍 SIMPLE NOTIFICATION CHECK:', { 
        hasOrderData: !!orderData, 
        hasBookingId: !!bookingId, 
        notificationsScheduled
      });

      if (!orderData || !bookingId || notificationsScheduled) {
        console.log('🚫 SKIPPING - Already scheduled or missing data');
        return;
      }

      console.log('🚀 FORCING NOTIFICATION NOW!');
      setNotificationsScheduled(true);

      // Wait 2 seconds then force send notification
      setTimeout(async () => {
        try {
          console.log('🔥 SENDING FORCED NOTIFICATION...');
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: t('orders.bookingConfirmedNotification'),
              body: `${t('orders.bookingConfirmedBody')} ${bookingId}`,
              sound: 'default',
            },
            trigger: null,
          });
          console.log('🎉 FORCED NOTIFICATION SENT:', notificationId);
        } catch (error) {
          console.error('💥 FORCED NOTIFICATION FAILED:', error);
        }
      }, 2000);

    };

    scheduleNotifications();
  }, [orderData, bookingId]);



  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('orders.orderConfirmation')} showBack />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Success Message */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.successContent}>
            <Ionicons name="checkmark-circle" size={80} color={theme.colors.primary} />
            <Text variant="headlineMedium" style={[styles.successTitle, { color: theme.colors.onSurface }]}>
              {t('orders.orderConfirmed')}
            </Text>
            <Text variant="bodyLarge" style={[styles.successSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('orders.orderPlacedSuccessfully')}
            </Text>
            <Text variant="bodyMedium" style={[styles.orderId, { color: theme.colors.primary }]}>
              {t('orders.orderId')} {bookingId || 'N/A'}
            </Text>
            
            {/* Email Status */}
            <View style={styles.emailStatus}>
              {emailsSent ? (
                <View style={styles.emailStatusRow}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={[styles.emailStatusText, { color: theme.colors.primary }]}>
                    {t('orders.confirmationEmailsSent')}
                  </Text>
                </View>
              ) : null}
            </View>

          </Card.Content>
        </Card>

        {/* Order Details */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              {t('orders.orderDetails')}
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('orders.serviceDate')}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {orderData?.service_date || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('orders.serviceTime')}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {orderData?.service_time || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('orders.totalAmount')}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                €{(orderData?.total_amount || 0).toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Service Address */}
        {orderData?.address && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                {t('orders.serviceAddress')}
              </Text>
              <Divider style={styles.divider} />
              
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {orderData.address.street_address}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {orderData.address.city}, {orderData.address.postal_code}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {orderData.address.country}
              </Text>
              
              {orderData.address.additional_notes && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                  {t('orders.notes')} {orderData.address.additional_notes}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Order Items */}
        {orderData?.items && orderData.items.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                {t('orders.servicesOrdered')}
              </Text>
              <Divider style={styles.divider} />
              
              {orderData.items.map((item: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                      {item.service_title || t('orders.service')}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {item.service_duration || t('orders.twoHours')} • {t('orders.qty')} {item.quantity}
                    </Text>
                  </View>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    €{(item.calculated_price || 0).toFixed(2)}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}


        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleViewOrders}
            style={styles.actionButton}
            icon="receipt"
          >
            {t('orders.viewOrders')}
          </Button>
          <Button
            mode="contained"
            onPress={handleContinueShopping}
            style={styles.actionButton}
            icon="shopping"
          >
            {t('orders.continueShopping')}
          </Button>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F7',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  emailStatus: {
    marginTop: 16,
    alignItems: 'center',
  },
  emailStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailStatusText: {
    fontSize: 12,
  },
});

export default OrderConfirmationScreen;
