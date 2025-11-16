import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, TextInput, Button, useTheme, Chip, FAB, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminDataService } from '@/services/adminDataService';
import { AdminBooking } from '@/types';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  accountStatus: 'active' | 'inactive';
  createdAt: string;
}

export function CustomerListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, statusFilter, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      // Load bookings to extract customer data
      const bookingsResponse = await adminDataService.getBookings();
      const bookings = bookingsResponse.data || [];
      
      // Group bookings by customer
      const customerMap = new Map<string, {
        bookings: AdminBooking[];
        totalSpent: number;
        lastBookingDate?: string;
      }>();

      bookings.forEach((booking: AdminBooking) => {
        const customerId = booking.user_id || booking.customer_email || 'unknown';
        
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            bookings: [],
            totalSpent: 0,
          });
        }
        
        const customerData = customerMap.get(customerId)!;
        customerData.bookings.push(booking);
        customerData.totalSpent += booking.total_amount || 0;
        
        const bookingDate = new Date(booking.booking_date || booking.created_at || '');
        if (!customerData.lastBookingDate || bookingDate > new Date(customerData.lastBookingDate)) {
          customerData.lastBookingDate = booking.booking_date || booking.created_at;
        }
      });

      // Convert to customer list
      const customerList: Customer[] = Array.from(customerMap.entries()).map(([id, data]) => {
        const firstBooking = data.bookings[0];
        const user = firstBooking.mobile_users;
        const name = user 
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || firstBooking.customer_name || 'Customer'
          : firstBooking.customer_name || 'Customer';
        
        return {
          id,
          name,
          email: user?.email || firstBooking.customer_email || '',
          phone: user?.phone || firstBooking.customer_phone || '',
          totalBookings: data.bookings.length,
          totalSpent: data.totalSpent,
          lastBookingDate: data.lastBookingDate,
          accountStatus: 'active' as const,
          createdAt: firstBooking.created_at || '',
        };
      });

      // Sort by total bookings (descending)
      customerList.sort((a, b) => b.totalBookings - a.totalBookings);
      
      setCustomers(customerList);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.accountStatus === statusFilter);
    }

    setFilteredCustomers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading customers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Customers
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Search by name, email, or phone"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
          right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : undefined}
        />
        
        <View style={styles.filterContainer}>
          <Button
            mode={statusFilter === 'all' ? 'contained' : 'outlined'}
            onPress={() => setStatusFilter('all')}
            style={styles.filterButton}
            compact
          >
            All
          </Button>
          <Button
            mode={statusFilter === 'active' ? 'contained' : 'outlined'}
            onPress={() => setStatusFilter('active')}
            style={styles.filterButton}
            compact
          >
            Active
          </Button>
          <Button
            mode={statusFilter === 'inactive' ? 'contained' : 'outlined'}
            onPress={() => setStatusFilter('inactive')}
            style={styles.filterButton}
            compact
          >
            Inactive
          </Button>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredCustomers.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="people-outline" size={64} color={theme.colors.onSurfaceVariant} />
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                {searchQuery ? 'No customers found' : 'No customers yet'}
              </Text>
              <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {searchQuery 
                  ? 'Try adjusting your search criteria'
                  : 'Customers will appear here once they make bookings'
                }
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              style={[styles.customerCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('CustomerDetails', { customerId: customer.id })}
            >
              <Card.Content>
                <View style={styles.customerHeader}>
                  <View style={styles.customerInfo}>
                    <View style={styles.customerNameRow}>
                      <Text variant="titleMedium" style={[styles.customerName, { color: theme.colors.onSurface }]}>
                        {customer.name}
                      </Text>
                      <Chip
                        mode="outlined"
                        textStyle={{ fontSize: 10 }}
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
                    <Text variant="bodySmall" style={[styles.customerEmail, { color: theme.colors.onSurfaceVariant }]}>
                      {customer.email}
                    </Text>
                    {customer.phone && (
                      <Text variant="bodySmall" style={[styles.customerPhone, { color: theme.colors.onSurfaceVariant }]}>
                        {customer.phone}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.customerStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="calendar" size={16} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                      {customer.totalBookings}
                    </Text>
                    <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Bookings
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="cash" size={16} color="#4CAF50" />
                    <Text variant="bodyMedium" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                      €{customer.totalSpent.toFixed(0)}
                    </Text>
                    <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Total Spent
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                      Last: {formatDate(customer.lastBookingDate)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 80,
  },
  customerCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  customerHeader: {
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  customerName: {
    fontWeight: '600',
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  customerEmail: {
    marginBottom: 2,
  },
  customerPhone: {
    marginBottom: 4,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
  },
  emptyCard: {
    borderRadius: 12,
    elevation: 2,
    marginTop: 32,
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
  },
});

