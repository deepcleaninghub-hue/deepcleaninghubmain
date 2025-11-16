import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, useTheme, Divider, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { adminDataService } from '@/services/adminDataService';
import { AdminBooking } from '@/types';

interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  accountStatus: 'active' | 'inactive';
  createdAt: string;
  bookings: AdminBooking[];
}

export function CustomerDetailsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { customerId } = route.params;
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);

  useEffect(() => {
    loadCustomerDetails();
  }, [customerId]);

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);
      
      // Load bookings
      const bookingsResponse = await adminDataService.getBookings();
      const bookings = bookingsResponse.data || [];
      
      // Filter bookings for this customer
      const customerBookings = bookings.filter((b: AdminBooking) => 
        b.user_id === customerId || b.customer_email === customerId
      );

      if (customerBookings.length === 0) {
        setCustomer(null);
        return;
      }

      const firstBooking = customerBookings[0];
      const user = firstBooking.mobile_users;
      const name = user 
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || firstBooking.customer_name || 'Customer'
        : firstBooking.customer_name || 'Customer';

      const totalSpent = customerBookings.reduce((sum: number, b: AdminBooking) => 
        sum + (b.total_amount || 0), 0
      );

      const lastBooking = customerBookings
        .sort((a: AdminBooking, b: AdminBooking) => 
          new Date(b.booking_date || b.created_at || '').getTime() - 
          new Date(a.booking_date || a.created_at || '').getTime()
        )[0];

      setCustomer({
        id: customerId,
        name,
        email: user?.email || firstBooking.customer_email || '',
        phone: user?.phone || firstBooking.customer_phone || '',
        address: firstBooking.service_address,
        totalBookings: customerBookings.length,
        totalSpent,
        lastBookingDate: lastBooking?.booking_date || lastBooking?.created_at,
        accountStatus: 'active' as const,
        createdAt: firstBooking.created_at || '',
        bookings: customerBookings,
      });
    } catch (error) {
      console.error('Error loading customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Linking.openURL(`mailto:${customer.email}`);
    }
  };

  const handleWhatsApp = () => {
    if (customer?.phone) {
      const message = encodeURIComponent('Hello, I wanted to reach out regarding your booking.');
      Linking.openURL(`whatsapp://send?phone=${customer.phone}&text=${message}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'pending':
      case 'scheduled':
      case 'confirmed': return theme.colors.primary;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading customer details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.emptyContent}>
            <Ionicons name="person-outline" size={64} color={theme.colors.onSurfaceVariant} />
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              Customer not found
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              Go Back
            </Button>
          </Card.Content>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Customer Information */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.customerHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.avatarText, { color: theme.colors.onPrimaryContainer }]}>
                  {customer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.customerInfo}>
                <Text variant="headlineSmall" style={[styles.customerName, { color: theme.colors.onSurface }]}>
                  {customer.name}
                </Text>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { 
                      borderColor: customer.accountStatus === 'active' ? '#4CAF50' : theme.colors.error,
                      backgroundColor: customer.accountStatus === 'active' ? '#4CAF50' + '20' : theme.colors.errorContainer
                    }
                  ]}
                >
                  {customer.accountStatus}
                </Chip>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={[styles.infoText, { color: theme.colors.onSurface }]}>
                {customer.email}
              </Text>
            </View>

            {customer.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={[styles.infoText, { color: theme.colors.onSurface }]}>
                  {customer.phone}
                </Text>
              </View>
            )}

            {customer.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={[styles.infoText, { color: theme.colors.onSurface }]}>
                  {customer.address}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={[styles.infoText, { color: theme.colors.onSurface }]}>
                Member since: {formatDate(customer.createdAt)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Actions */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Contact Customer
            </Text>
            <View style={styles.contactActions}>
              {customer.phone && (
                <Button
                  mode="outlined"
                  onPress={handleCall}
                  icon="phone"
                  style={styles.contactButton}
                >
                  Call
                </Button>
              )}
              {customer.email && (
                <Button
                  mode="outlined"
                  onPress={handleEmail}
                  icon="email"
                  style={styles.contactButton}
                >
                  Email
                </Button>
              )}
              {customer.phone && (
                <Button
                  mode="outlined"
                  onPress={handleWhatsApp}
                  icon="chat"
                  style={styles.contactButton}
                >
                  WhatsApp
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text variant="headlineMedium" style={[styles.statValue, { color: theme.colors.primary }]}>
                  {customer.totalBookings}
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Total Bookings
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text variant="headlineMedium" style={[styles.statValue, { color: '#4CAF50' }]}>
                  €{customer.totalSpent.toFixed(0)}
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Total Spent
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Booking History */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Booking History ({customer.bookings.length})
            </Text>
            {customer.bookings.length === 0 ? (
              <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No bookings yet
              </Text>
            ) : (
              customer.bookings
                .sort((a, b) => 
                  new Date(b.booking_date || b.created_at || '').getTime() - 
                  new Date(a.booking_date || a.created_at || '').getTime()
                )
                .map((booking) => (
                  <TouchableOpacity
                    key={booking.id}
                    onPress={() => navigation.navigate('Bookings', { 
                      screen: 'BookingDetails', 
                      params: { bookingId: booking.id } 
                    })}
                  >
                    <View style={styles.bookingItem}>
                      <View style={styles.bookingInfo}>
                        <Text variant="bodyLarge" style={[styles.bookingService, { color: theme.colors.onSurface }]}>
                          {booking.services?.title || 'Service'}
                        </Text>
                        <Text variant="bodySmall" style={[styles.bookingDate, { color: theme.colors.onSurfaceVariant }]}>
                          {formatDate(booking.booking_date || booking.created_at)}
                        </Text>
                        {booking.service_address && (
                          <Text variant="bodySmall" style={[styles.bookingAddress, { color: theme.colors.onSurfaceVariant }]}>
                            {booking.service_address}
                          </Text>
                        )}
                      </View>
                      <View style={styles.bookingRight}>
                        <Chip
                          mode="outlined"
                          textStyle={{ fontSize: 10 }}
                          style={[
                            styles.bookingStatusChip,
                            { borderColor: getStatusColor(booking.status || '') }
                          ]}
                        >
                          {booking.status || 'N/A'}
                        </Chip>
                        <Text variant="titleSmall" style={[styles.bookingAmount, { color: theme.colors.primary }]}>
                          €{(booking.total_amount || 0).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <Divider style={styles.bookingDivider} />
                  </TouchableOpacity>
                ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  contactButton: {
    flex: 1,
    minWidth: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  bookingInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookingService: {
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingDate: {
    marginBottom: 4,
  },
  bookingAddress: {
    fontSize: 11,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  bookingStatusChip: {
    marginBottom: 8,
  },
  bookingAmount: {
    fontWeight: 'bold',
  },
  bookingDivider: {
    marginVertical: 8,
  },
  emptyCard: {
    margin: 16,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
  },
});

