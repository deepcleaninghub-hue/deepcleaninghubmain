import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Text, Card, Button, Chip, useTheme, Divider, FAB, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../contexts/AuthContext';
import { serviceBookingAPI, ServiceBooking } from '../../services/serviceBookingAPI';
import { OrdersStackScreenProps } from '../../navigation/types';

type Props = OrdersStackScreenProps<'OrdersMain'>;

const OrderHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [scheduledBookings, setScheduledBookings] = useState<ServiceBooking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'completed'>('scheduled');

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const [scheduled, completed] = await Promise.all([
        serviceBookingAPI.getScheduledBookings(),
        serviceBookingAPI.getCompletedBookings()
      ]);
      setScheduledBookings(scheduled);
      setCompletedBookings(completed);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return theme.colors.primary;
      case 'completed': return '#4CAF50';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return 'calendar-outline';
      case 'completed': return 'checkmark-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleBookingPress = (booking: ServiceBooking) => {
    // For now, show an alert - OrderDetails screen needs to be created
    Alert.alert('Order Details', `Viewing details for booking ${booking.id.slice(-8)}`);
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceBookingAPI.cancelBooking(bookingId);
              await loadBookings();
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const currentBookings = activeTab === 'scheduled' ? scheduledBookings : completedBookings;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'scheduled' | 'completed')}
            buttons={[
              {
                value: 'scheduled',
                label: `Scheduled (${scheduledBookings.length})`,
                icon: 'calendar-clock',
              },
              {
                value: 'completed',
                label: `Completed (${completedBookings.length})`,
                icon: 'check-circle',
              },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Bookings List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading bookings...</Text>
          </View>
        ) : currentBookings.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="calendar-outline" size={64} color={theme.colors.onSurfaceVariant} />
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                No {activeTab} bookings found
              </Text>
              <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {activeTab === 'scheduled' 
                  ? "You don't have any scheduled bookings yet"
                  : "You don't have any completed bookings yet"
                }
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Services' as any)}
                style={styles.browseButton}
              >
                Browse Services
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.ordersContainer}>
            {(currentBookings || []).map((booking, index) => (
              <Card 
                key={booking.id} 
                style={[styles.orderCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleBookingPress(booking)}
              >
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text variant="titleMedium" style={[styles.orderNumber, { color: theme.colors.onSurface }]}>
                        Booking #{booking.id.slice(-8)}
                      </Text>
                      <Text variant="bodySmall" style={[styles.orderDate, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDate(booking.created_at)}
                      </Text>
                    </View>
                    <Chip
                      mode="outlined"
                      textStyle={{ color: getStatusColor(booking.status) }}
                      style={{ borderColor: getStatusColor(booking.status) }}
                      icon={(props) => (
                        <Ionicons
                          name={getStatusIcon(booking.status) as any}
                          size={props.size}
                          color={getStatusColor(booking.status)}
                        />
                      )}
                    >
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.orderDetails}>
                    <View style={styles.serviceInfo}>
                      <Text variant="bodyMedium" style={[styles.serviceTitle, { color: theme.colors.onSurface }]}>
                        {booking.services?.title || 'Service'}
                      </Text>
                      <Text variant="bodySmall" style={[styles.serviceDate, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDate(booking.booking_date)} at {formatTime(booking.booking_time)}
                      </Text>
                      <Text variant="bodySmall" style={[styles.serviceAddress, { color: theme.colors.onSurfaceVariant }]}>
                        {booking.service_address}
                      </Text>
                    </View>
                    <Text variant="titleLarge" style={[styles.orderTotal, { color: theme.colors.primary }]}>
                      €{(booking.total_amount || 0).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.orderActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleBookingPress(booking)}
                      style={styles.actionButton}
                      compact
                    >
                      View Details
                    </Button>
                    {booking.status === 'scheduled' && (
                      <Button
                        mode="outlined"
                        onPress={() => handleCancelBooking(booking.id)}
                        style={[styles.actionButton, styles.cancelButton]}
                        textColor={theme.colors.error}
                        compact
                      >
                        Cancel
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Services' as any)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  tabContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyCard: {
    margin: 16,
    borderRadius: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    borderRadius: 8,
  },
  ordersContainer: {
    padding: 16,
    paddingTop: 8,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 12,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceDate: {
    marginBottom: 2,
  },
  serviceAddress: {
    fontSize: 11,
  },
  orderTotal: {
    fontWeight: '700',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#f44336',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default OrderHistoryScreen;