import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text, Card, Button, Chip, useTheme, Divider, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdminData } from '@/contexts/AdminDataContext';
import { AdminBooking } from '@/types';
import { adminDataService } from '@/services/adminDataService';

export function BookingDetailsScreen({ navigation, route }: any) {
  const theme = useTheme();
  const { refreshBookings } = useAdminData();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const result = await adminDataService.getBooking(bookingId);
      if (result.success && result.data) {
        setBooking(result.data);
      }
    } catch (error) {
      console.error('Error loading booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookingDetails();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return theme.colors.primary;
      case 'confirmed': return '#4CAF50';
      case 'completed': return '#4CAF50';
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return 'calendar-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'scheduled': return 0.2;
      case 'confirmed': return 0.4;
      case 'completed': return 1.0;
      case 'cancelled': return 0.0;
      default: return 0.0;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminDataService.updateBookingStatus({ bookingId: booking.id, status: 'cancelled' });
              await refreshBookings();
              Alert.alert('Success', 'Booking cancelled successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!booking) return;
    
    try {
      await adminDataService.updateBookingStatus({ bookingId: booking.id, status: newStatus });
      setBooking({ ...booking, status: newStatus as any });
      await refreshBookings();
      Alert.alert('Success', 'Booking status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  if (loading || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            icon="arrow-left"
          >
            Back
          </Button>
          <Text variant="headlineSmall" style={styles.headerTitle}>Booking Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canComplete = booking.status === 'confirmed';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          icon="arrow-left"
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={styles.headerTitle}>Booking Details</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Booking Status */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Text variant="titleLarge" style={[styles.statusTitle, { color: theme.colors.onSurface }]}>
                Booking Status
              </Text>
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
            
            <ProgressBar
              progress={getProgressValue(booking.status)}
              color={getStatusColor(booking.status)}
              style={styles.progressBar}
            />
            
            <View style={styles.statusSteps}>
              <View style={[styles.statusStep, booking.status !== 'cancelled' && (booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'completed') ? styles.activeStep : styles.inactiveStep]}>
                <Ionicons name="checkmark-circle" size={20} color={booking.status !== 'cancelled' && (booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'completed') ? '#4CAF50' : '#E0E0E0'} />
                <Text variant="bodySmall" style={styles.stepText}>Booking Placed</Text>
              </View>
              
              <View style={[styles.statusStep, booking.status !== 'cancelled' && (booking.status === 'confirmed' || booking.status === 'completed') ? styles.activeStep : styles.inactiveStep]}>
                <Ionicons name="checkmark-circle" size={20} color={booking.status !== 'cancelled' && (booking.status === 'confirmed' || booking.status === 'completed') ? '#4CAF50' : '#E0E0E0'} />
                <Text variant="bodySmall" style={styles.stepText}>Confirmed</Text>
              </View>
              
              <View style={[styles.statusStep, booking.status === 'completed' ? styles.activeStep : styles.inactiveStep]}>
                <Ionicons name="checkmark-circle" size={20} color={booking.status === 'completed' ? '#4CAF50' : '#E0E0E0'} />
                <Text variant="bodySmall" style={styles.stepText}>Completed</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Booking Information */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Booking Information
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Booking Number
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                #{booking.id.slice(-8)}
              </Text>
            </View>
            
            {/* Multi-day booking display */}
            {booking.is_multi_day && booking.allBookingDates ? (
              <View style={styles.multiDaySection}>
                <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Service Dates ({booking.totalDays || 1} days)
                </Text>
                <View style={styles.multiDayDates}>
                  {booking.allBookingDates.map((bookingDate, index) => (
                    <View key={index} style={styles.dateItem}>
                      <Text variant="bodyMedium" style={[styles.dateText, { color: theme.colors.onSurface }]}>
                        {formatDate(bookingDate.date)}
                      </Text>
                      <Text variant="bodySmall" style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
                        {formatTime(bookingDate.time)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Service Date
                  </Text>
                  <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                    {formatDate(booking.booking_date || booking.date)}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Service Time
                  </Text>
                  <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                    {formatTime(booking.booking_time || booking.time)}
                  </Text>
                </View>
              </>
            )}
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Priority
              </Text>
              <Text variant="titleMedium" style={[styles.infoValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                {(booking.priority || 'medium').toUpperCase()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Customer
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {booking.customer_name || booking.customerId}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Service
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                {booking.services?.title || booking.serviceId}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Amount
              </Text>
              <Text variant="titleMedium" style={[styles.infoValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                €{(booking.total_amount || 0).toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Service Details */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Service Details
            </Text>
            <Divider style={styles.divider} />
            
            <View style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text variant="bodyLarge" style={[styles.serviceTitle, { color: theme.colors.onSurface }]}>
                  Service Booking
                </Text>
                <Text variant="bodyMedium" style={[styles.serviceQuantity, { color: theme.colors.onSurfaceVariant }]}>
                  Duration: {booking.estimatedDuration || 60} minutes
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Notes */}
        {(booking.staffNotes || booking.adminNotes) && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Notes
              </Text>
              <Divider style={styles.divider} />
              {booking.staffNotes && (
                <View style={styles.noteSection}>
                  <Text variant="bodyMedium" style={[styles.noteLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Staff Notes:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.noteText, { color: theme.colors.onSurface }]}>
                    {booking.staffNotes}
                  </Text>
                </View>
              )}
              {booking.adminNotes && (
                <View style={styles.noteSection}>
                  <Text variant="bodyMedium" style={[styles.noteLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Admin Notes:
                  </Text>
                  <Text variant="bodyMedium" style={[styles.noteText, { color: theme.colors.onSurface }]}>
                    {booking.adminNotes}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {canCancel && (
            <Button
              mode="outlined"
              onPress={handleCancelBooking}
              style={[styles.actionButton, styles.cancelButton]}
              textColor={theme.colors.error}
            >
              Cancel Booking
            </Button>
          )}
          
          {canComplete && (
            <Button
              mode="contained"
              onPress={() => handleUpdateStatus('completed')}
              style={styles.actionButton}
            >
              Mark as Completed
            </Button>
          )}

          {booking.status === 'pending' && (
            <Button
              mode="contained"
              onPress={() => handleUpdateStatus('confirmed')}
              style={styles.actionButton}
            >
              Confirm Booking
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    marginLeft: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  statusSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusStep: {
    alignItems: 'center',
    flex: 1,
  },
  activeStep: {
    opacity: 1,
  },
  inactiveStep: {
    opacity: 0.5,
  },
  stepText: {
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    fontWeight: '500',
  },
  multiDaySection: {
    marginBottom: 12,
  },
  multiDayDates: {
    marginTop: 8,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 4,
  },
  dateText: {
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceQuantity: {
    fontSize: 14,
  },
  noteSection: {
    marginBottom: 16,
  },
  noteLabel: {
    fontWeight: '500',
    marginBottom: 4,
  },
  noteText: {
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: '#f44336',
  },
});