import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, Chip, useTheme, Divider, FAB, SegmentedButtons, Searchbar, Portal, Checkbox } from 'react-native-paper';
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
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Filter states
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('');
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeTab, searchQuery, statusFilters, serviceTypeFilter, customerFilter, dateRangeStart, dateRangeEnd]);

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
      // Tab filter
      const matchesTab = activeTab === 'upcoming' 
        ? booking.status !== 'completed' && booking.status !== 'cancelled'
        : booking.status === 'completed';
      
      // Enhanced search - by booking ID, customer name/email/phone, service address
      const query = searchQuery.toLowerCase();
      const searchCustomerName = getCustomerName(booking).toLowerCase();
      const matchesSearch = searchQuery === '' || 
        booking.id.toLowerCase().includes(query) ||
        searchCustomerName.includes(query) ||
        (booking.customer_email && booking.customer_email.toLowerCase().includes(query)) ||
        (booking.customer_phone && booking.customer_phone.toLowerCase().includes(query)) ||
        (() => {
          const mobileUser = getMobileUser(booking);
          return (mobileUser?.email && mobileUser.email.toLowerCase().includes(query)) ||
                 (mobileUser?.phone && mobileUser.phone.toLowerCase().includes(query));
        })() ||
        (booking.service_address && booking.service_address.toLowerCase().includes(query));
      
      // Status filter
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(booking.status);
      
      // Service type filter
      const matchesServiceType = serviceTypeFilter === '' || 
        booking.services?.category === serviceTypeFilter ||
        booking.services?.title?.toLowerCase().includes(serviceTypeFilter.toLowerCase());
      
      // Customer filter
      const filterCustomerName = getCustomerName(booking).toLowerCase();
      const mobileUser = getMobileUser(booking);
      const matchesCustomer = customerFilter === '' ||
        filterCustomerName.includes(customerFilter.toLowerCase()) ||
        booking.customer_email?.toLowerCase().includes(customerFilter.toLowerCase()) ||
        (mobileUser?.email && mobileUser.email.toLowerCase().includes(customerFilter.toLowerCase()));
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRangeStart || dateRangeEnd) {
        const bookingDate = new Date(booking.booking_date || booking.created_at || '');
        if (dateRangeStart) {
          const startDate = new Date(dateRangeStart);
          startDate.setHours(0, 0, 0, 0);
          if (bookingDate < startDate) matchesDateRange = false;
        }
        if (dateRangeEnd) {
          const endDate = new Date(dateRangeEnd);
          endDate.setHours(23, 59, 59, 999);
          if (bookingDate > endDate) matchesDateRange = false;
        }
      }
      
      return matchesTab && matchesSearch && matchesStatus && matchesServiceType && matchesCustomer && matchesDateRange;
    });
    
    setFilteredBookings(filtered);
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setServiceTypeFilter('');
    setCustomerFilter('');
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  const hasActiveFilters = statusFilters.length > 0 || serviceTypeFilter !== '' || customerFilter !== '' || dateRangeStart !== '' || dateRangeEnd !== '';

  // Helper function to get mobile user (handles both object and array)
  const getMobileUser = (booking: AdminBooking): any => {
    if (!booking.mobile_users) return null;
    return Array.isArray(booking.mobile_users) 
      ? booking.mobile_users[0] || null
      : booking.mobile_users;
  };

  // Helper function to get customer name from first_name + last_name
  const getCustomerName = (booking: AdminBooking): string => {
    const mobileUser = getMobileUser(booking);

    // Priority 1: Use mobile_users first_name + last_name
    if (mobileUser) {
      const firstName = (mobileUser.first_name || '').trim();
      const lastName = (mobileUser.last_name || '').trim();
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
      // If mobile_users exists but name is empty, try email as fallback
      if (mobileUser.email) {
        return mobileUser.email;
      }
    }
    
    // Priority 2: Use customer_name if available and not "Customer"
    if (booking.customer_name) {
      const customerName = booking.customer_name.trim();
      if (customerName !== '' && customerName !== 'Customer' && customerName.toLowerCase() !== 'customer') {
        return customerName;
      }
    }
    
    // Priority 3: Try to construct from customer_email if available
    if (booking.customer_email) {
      const emailName = booking.customer_email.split('@')[0];
      if (emailName) {
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }
    }
    
    // Last resort: Return "Customer" as fallback
    return 'Customer';
  };

  // Get unique service types and customers for filter dropdowns
  const serviceTypes = Array.from(new Set(bookings.map(b => b.services?.category).filter(Boolean)));
  const customers = Array.from(new Set(
    bookings.map(b => getCustomerName(b)).filter(name => name !== 'Customer')
  ));

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
        {/* Search Bar and Filter Toggle */}
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <Searchbar
              placeholder="Search by ID, name, email, phone, or address..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[styles.searchBar, { flex: 1 }]}
            />
            <Button
              mode={hasActiveFilters ? 'contained' : 'outlined'}
              onPress={() => setShowFilters(true)}
              icon="filter"
              style={styles.filterButton}
              compact
            >
              {hasActiveFilters ? 'Filtered' : 'Filter'}
            </Button>
          </View>
          
          {/* View Mode Toggle */}
          <View style={styles.viewModeContainer}>
            <Button
              mode={viewMode === 'list' ? 'contained' : 'outlined'}
              onPress={() => setViewMode('list')}
              icon="list"
              style={styles.viewModeButton}
              compact
            >
              List
            </Button>
            <Button
              mode={viewMode === 'calendar' ? 'contained' : 'outlined'}
              onPress={() => setViewMode('calendar')}
              icon="calendar"
              style={styles.viewModeButton}
              compact
            >
              Calendar
            </Button>
          </View>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'upcoming' | 'completed')}
            buttons={[
              {
                value: 'upcoming',
                label: `Upcoming (${bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length})`,
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
                {activeTab === 'upcoming' 
                  ? "No upcoming bookings at the moment"
                  : "No completed bookings yet"
                }
              </Text>
            </Card.Content>
          </Card>
        ) : viewMode === 'calendar' ? (
          <View style={styles.bookingsContainer}>
            <Text variant="bodyMedium" style={[styles.calendarSubtext, { color: theme.colors.onSurfaceVariant, textAlign: 'center', padding: 16 }]}>
              Switch to List view to see bookings. Calendar view coming soon.
            </Text>
          </View>
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
                      <View style={styles.customerInfo}>
                        <Text variant="bodySmall" style={[styles.customerName, { color: theme.colors.onSurface }]}>
                          {(() => {
                            const customerName = getCustomerName(booking);
                            // Debug log in development
                            if (__DEV__ && customerName === 'Customer') {
                              console.log('Booking showing "Customer":', {
                                id: booking.id,
                                mobile_users: booking.mobile_users,
                                customer_name: booking.customer_name,
                                customer_email: booking.customer_email,
                                user_id: booking.user_id
                              });
                            }
                            return customerName;
                          })()}
                        </Text>
                        {(() => {
                          const mobileUser = getMobileUser(booking);
                          return mobileUser?.email && (
                            <View style={styles.customerDetailRow}>
                              <Ionicons name="mail-outline" size={12} color={theme.colors.onSurfaceVariant} />
                              <Text variant="bodySmall" style={[styles.customerDetail, { color: theme.colors.onSurfaceVariant }]}>
                                {mobileUser.email}
                              </Text>
                            </View>
                          );
                        })()}
                        {(() => {
                          const mobileUser = getMobileUser(booking);
                          return mobileUser?.phone && (
                            <View style={styles.customerDetailRow}>
                              <Ionicons name="call-outline" size={12} color={theme.colors.onSurfaceVariant} />
                              <Text variant="bodySmall" style={[styles.customerDetail, { color: theme.colors.onSurfaceVariant }]}>
                                {mobileUser.phone}
                              </Text>
                            </View>
                          );
                        })()}
                        {!getMobileUser(booking) && booking.customer_email && (
                          <View style={styles.customerDetailRow}>
                            <Ionicons name="mail-outline" size={12} color={theme.colors.onSurfaceVariant} />
                            <Text variant="bodySmall" style={[styles.customerDetail, { color: theme.colors.onSurfaceVariant }]}>
                              {booking.customer_email}
                            </Text>
                          </View>
                        )}
                        {!booking.mobile_users && booking.customer_phone && (
                          <View style={styles.customerDetailRow}>
                            <Ionicons name="call-outline" size={12} color={theme.colors.onSurfaceVariant} />
                            <Text variant="bodySmall" style={[styles.customerDetail, { color: theme.colors.onSurfaceVariant }]}>
                              {booking.customer_phone}
                            </Text>
                          </View>
                        )}
                      </View>
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

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                Filter Bookings
              </Text>
              <Button onPress={() => setShowFilters(false)} icon="close">
                Close
              </Button>
            </View>

          <ScrollView style={styles.modalContent}>
            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text variant="titleMedium" style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>
                Status
              </Text>
              {['pending', 'confirmed', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((status) => (
                <View key={status} style={styles.checkboxRow}>
                  <Checkbox
                    status={statusFilters.includes(status) ? 'checked' : 'unchecked'}
                    onPress={() => {
                      setStatusFilters(prev => 
                        prev.includes(status) 
                          ? prev.filter(s => s !== status)
                          : [...prev, status]
                      );
                    }}
                  />
                  <Text style={[styles.checkboxLabel, { color: theme.colors.onSurface }]}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </View>

            {/* Service Type Filter */}
            <View style={styles.filterSection}>
              <Text variant="titleMedium" style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>
                Service Type
              </Text>
              <Searchbar
                placeholder="Search service type..."
                onChangeText={setServiceTypeFilter}
                value={serviceTypeFilter}
                style={styles.filterSearch}
              />
            </View>

            {/* Customer Filter */}
            <View style={styles.filterSection}>
              <Text variant="titleMedium" style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>
                Customer
              </Text>
              <Searchbar
                placeholder="Search customer..."
                onChangeText={setCustomerFilter}
                value={customerFilter}
                style={styles.filterSearch}
              />
            </View>

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text variant="titleMedium" style={[styles.filterSectionTitle, { color: theme.colors.onSurface }]}>
                Date Range
              </Text>
              <View style={styles.dateRangeRow}>
                <View style={styles.dateInput}>
                  <Text variant="bodySmall" style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Start Date
                  </Text>
                  <Searchbar
                    placeholder="YYYY-MM-DD"
                    onChangeText={setDateRangeStart}
                    value={dateRangeStart}
                    style={styles.dateInputField}
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text variant="bodySmall" style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
                    End Date
                  </Text>
                  <Searchbar
                    placeholder="YYYY-MM-DD"
                    onChangeText={setDateRangeEnd}
                    value={dateRangeEnd}
                    style={styles.dateInputField}
                  />
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={styles.modalActionButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.modalActionButton}
              >
                Apply Filters
              </Button>
            </View>
          </ScrollView>
          </View>
        </Modal>
      </Portal>

      {/* Calendar View Placeholder */}
      {viewMode === 'calendar' && (
        <Card style={[styles.calendarCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.calendarContent}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" style={[styles.calendarText, { color: theme.colors.onSurface }]}>
              Calendar View
            </Text>
            <Text variant="bodyMedium" style={[styles.calendarSubtext, { color: theme.colors.onSurfaceVariant }]}>
              Calendar view with monthly/daily/weekly options coming soon
            </Text>
            <Text variant="bodySmall" style={[styles.calendarSubtext, { color: theme.colors.onSurfaceVariant }]}>
              Switch to List view to see bookings
            </Text>
          </Card.Content>
        </Card>
      )}
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
  customerInfo: {
    marginTop: 8,
  },
  customerName: {
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 13,
  },
  customerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  customerDetail: {
    fontSize: 11,
    marginLeft: 6,
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
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    marginLeft: 8,
  },
  viewModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  filterSearch: {
    marginTop: 8,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: 4,
  },
  dateInputField: {
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalActionButton: {
    flex: 1,
  },
  calendarCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  calendarContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  calendarText: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  calendarSubtext: {
    textAlign: 'center',
    marginTop: 4,
  },
});