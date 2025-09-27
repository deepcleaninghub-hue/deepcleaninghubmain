import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Text, Card, Button, Chip, useTheme, Divider, FAB, SegmentedButtons, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdminData } from '@/contexts/AdminDataContext';
import { AdminBooking } from '@/types';
import { adminDataService } from '@/services/adminDataService';

export function BookingListScreen({ navigation }: any) {
  const theme = useTheme();
  const { bookings, refreshBookings } = useAdminData();
  const [filteredBookings, setFilteredBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'completed'>('scheduled');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeTab, searchQuery]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      await refreshBookings();
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

  const filterBookings = () => {
    let filtered = bookings.filter(booking => {
      const matchesTab = activeTab === 'scheduled' 
        ? booking.status === 'pending' || booking.status === 'confirmed'
        : booking.status === 'completed';
      
      const matchesSearch = searchQuery === '' || 
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.customer_name && booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (booking.customer_email && booking.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesTab && matchesSearch;
    });
    
    setFilteredBookings(filtered);
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

  const handleBookingPress = (booking: AdminBooking) => {
    navigation.navigate('BookingDetails', { bookingId: booking.id });
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
              await adminDataService.updateBookingStatus({ bookingId, status: 'cancelled' });
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Bookings
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        alwaysBounceVertical
        overScrollMode="always"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search bookings..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'scheduled' | 'completed')}
            buttons={[
              {
                value: 'scheduled',
                label: `Scheduled (${bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length})`,
                icon: 'calendar-clock',
              },
              {
                value: 'completed',
                label: `Completed (${bookings.filter(b => b.status === 'completed').length})`,
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
        ) : filteredBookings.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="calendar-outline" size={64} color={theme.colors.onSurfaceVariant} />
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                No {activeTab} bookings found
              </Text>
              <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {activeTab === 'scheduled' 
                  ? "No scheduled bookings at the moment"
                  : "No completed bookings yet"
                }
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.bookingsContainer}>
            {filteredBookings.map((booking, index) => (
              <Card 
                key={booking.id} 
                style={[styles.bookingCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleBookingPress(booking)}
              >
                <Card.Content>
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingInfo}>
                      <Text variant="titleMedium" style={[styles.bookingNumber, { color: theme.colors.onSurface }]}>
                        Booking #{booking.id.slice(-8)}
                      </Text>
                      <Text variant="bodySmall" style={[styles.bookingDate, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDate(booking.created_at || booking.createdAt)}
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

                  <View style={styles.bookingDetails}>
                    <View style={styles.serviceInfo}>
                      <Text variant="bodyMedium" style={[styles.serviceTitle, { color: theme.colors.onSurface }]}>
                        {booking.services?.title || 'Service Booking'}
                        {booking.is_multi_day && (
                          <Text variant="bodySmall" style={[styles.multiDayBadge, { color: theme.colors.primary }]}>
                            {' '}({booking.totalDays || 1} days)
                          </Text>
                        )}
                      </Text>
                      {booking.is_multi_day && booking.allBookingDates ? (
                        <View style={styles.multiDayInfo}>
                          <Text variant="bodySmall" style={[styles.serviceDate, { color: theme.colors.onSurfaceVariant }]}>
                            {booking.allBookingDates.length} appointments scheduled
                          </Text>
                          <Text variant="bodySmall" style={[styles.serviceDate, { color: theme.colors.onSurfaceVariant }]}>
                            {formatDate(booking.allBookingDates?.[0]?.date || '')} - {formatDate(booking.allBookingDates?.[booking.allBookingDates.length - 1]?.date || '')}
                          </Text>
                        </View>
                      ) : (
                        <Text variant="bodySmall" style={[styles.serviceDate, { color: theme.colors.onSurfaceVariant }]}>
                          {formatDate(booking.booking_date || booking.date)} at {formatTime(booking.booking_time || booking.time)}
                        </Text>
                      )}
                      <Text variant="bodySmall" style={[styles.serviceAddress, { color: theme.colors.onSurfaceVariant }]}>
                        {booking.customer_name || `Customer: ${booking.customerId}`}
                      </Text>
                    </View>
                    <Text variant="titleLarge" style={[styles.bookingTotal, { color: theme.colors.primary }]}>
                      €{(booking.total_amount || 0).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.bookingActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleBookingPress(booking)}
                      style={styles.actionButton}
                      compact
                    >
                      View Details
                    </Button>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
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
        onPress={() => navigation.navigate('BookingCreate')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 2,
  },
  tabContainer: {
    padding: 16,
    paddingTop: 8,
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
  bookingsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  bookingCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingNumber: {
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 12,
  },
  bookingDetails: {
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
  multiDayBadge: {
    fontWeight: '600',
  },
  multiDayInfo: {
    marginBottom: 2,
  },
  serviceDate: {
    marginBottom: 2,
  },
  serviceAddress: {
    fontSize: 11,
  },
  bookingTotal: {
    fontWeight: '700',
  },
  bookingActions: {
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