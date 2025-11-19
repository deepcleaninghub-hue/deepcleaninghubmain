import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, useTheme, FAB, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { httpClient } from '@/services/httpClient';
import { adminDataService } from '@/services/adminDataService';

interface DashboardStats {
  totalBookings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  activeServices: number;
  totalCustomers: number;
}

interface RecentBooking {
  id: string;
  customer_name: string;
  service_address: string;
  booking_date: string;
  status: string;
  total_amount: number;
}

export function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: { today: 0, thisWeek: 0, thisMonth: 0 },
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: { today: 0, thisWeek: 0, thisMonth: 0 },
    activeServices: 0,
    totalCustomers: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load bookings
      const bookingsResponse = await adminDataService.getBookings();
      const bookings = bookingsResponse.data || [];
      
      // Calculate statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.booking_date || b.created_at);
        return bookingDate >= today;
      });

      const weekBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.booking_date || b.created_at);
        return bookingDate >= weekAgo;
      });

      const monthBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.booking_date || b.created_at);
        return bookingDate >= monthAgo;
      });

      const pendingBookings = bookings.filter((b: any) => 
        ['pending', 'scheduled', 'confirmed', 'in_progress'].includes(b.status?.toLowerCase())
      );

      const completedBookings = bookings.filter((b: any) => 
        b.status?.toLowerCase() === 'completed'
      );

      // Calculate revenue only from completed bookings
      const todayCompletedBookings = todayBookings.filter((b: any) => 
        b.status?.toLowerCase() === 'completed'
      );
      const weekCompletedBookings = weekBookings.filter((b: any) => 
        b.status?.toLowerCase() === 'completed'
      );
      const monthCompletedBookings = monthBookings.filter((b: any) => 
        b.status?.toLowerCase() === 'completed'
      );

      const todayRevenue = todayCompletedBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
      const weekRevenue = weekCompletedBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
      const monthRevenue = monthCompletedBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

      // Load services
      const servicesResponse = await adminDataService.getServices();
      const activeServices = (servicesResponse.data || []).filter((s: any) => s.isActive !== false).length;

      // Load customers from mobile users table
      const mobileUsersResponse = await adminDataService.getMobileUsers();
      const totalCustomers = mobileUsersResponse.data?.length || 0;

      // Get recent bookings
      const recent = bookings
        .sort((a: any, b: any) => 
          new Date(b.created_at || b.booking_date).getTime() - new Date(a.created_at || a.booking_date).getTime()
        )
        .slice(0, 5)
        .map((b: any) => ({
          id: b.id,
          customer_name: b.customer_name || b.mobile_users?.first_name || 'Customer',
          service_address: b.service_address || 'N/A',
          booking_date: b.booking_date || b.created_at,
          status: b.status,
          total_amount: b.total_amount || 0,
        }));

      setStats({
        totalBookings: {
          today: todayBookings.length,
          thisWeek: weekBookings.length,
          thisMonth: monthBookings.length,
        },
        pendingBookings: pendingBookings.length,
        completedBookings: completedBookings.length,
        totalRevenue: {
          today: todayRevenue,
          thisWeek: weekRevenue,
          thisMonth: monthRevenue,
        },
        activeServices,
        totalCustomers,
      });

      setRecentBookings(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return '#2196F3'; // Bright blue for better visibility
      case 'confirmed': return '#4CAF50'; // Green
      case 'completed': return '#4CAF50'; // Green
      case 'cancelled': return theme.colors.error; // Red
      case 'pending': return '#FF9800'; // Orange
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return '#E3F2FD'; // Light blue background
      case 'confirmed': return '#E8F5E9'; // Light green background
      case 'completed': return '#E8F5E9'; // Light green background
      case 'cancelled': return '#FFEBEE'; // Light red background
      case 'pending': return '#FFF3E0'; // Light orange background
      default: return '#F5F5F5'; // Light gray background
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Dashboard
          </Text>
          <Text variant="bodyMedium" style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Overview of your business
          </Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          {/* Total Bookings */}
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={[styles.statTitle, { color: theme.colors.onSurface }]}>
                  Total Bookings
                </Text>
              </View>
              <View style={styles.statValues}>
                <View style={styles.statValue}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                    {stats.totalBookings.today}
                  </Text>
                  <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Today
                  </Text>
                </View>
                <View style={styles.statValue}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                    {stats.totalBookings.thisWeek}
                  </Text>
                  <Text 
                    variant="bodySmall" 
                    style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={false}
                  >
                    This Week
                  </Text>
                </View>
                <View style={styles.statValue}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                    {stats.totalBookings.thisMonth}
                  </Text>
                  <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    This Month
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Booking Status Cards */}
          <View style={styles.statusRow}>
            <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statusCardContent}>
                <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={[styles.statusNumber, { color: theme.colors.primary }]}>
                  {stats.pendingBookings}
                </Text>
                <Text variant="bodySmall" style={[styles.statusLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Pending
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statusCardContent}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text variant="headlineSmall" style={[styles.statusNumber, { color: '#4CAF50' }]}>
                  {stats.completedBookings}
                </Text>
                <Text variant="bodySmall" style={[styles.statusLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Completed
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Revenue Card */}
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.statHeader}>
                <Ionicons name="cash" size={24} color="#4CAF50" />
                <Text variant="titleMedium" style={[styles.statTitle, { color: theme.colors.onSurface }]}>
                  Total Revenue
                </Text>
              </View>
              <View style={styles.statValues}>
                <View style={styles.statValue}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: '#4CAF50' }]}>
                    €{stats.totalRevenue.today.toFixed(0)}
                  </Text>
                  <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    Today
                  </Text>
                </View>
                <View style={styles.statValue}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: '#4CAF50' }]}>
                    €{stats.totalRevenue.thisWeek.toFixed(0)}
                  </Text>
                  <Text 
                    variant="bodySmall" 
                    style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={false}
                  >
                    This Week
                  </Text>
                </View>
                <View style={styles.statValue}>
                  <Text variant="headlineSmall" style={[styles.statNumber, { color: '#4CAF50' }]}>
                    €{stats.totalRevenue.thisMonth.toFixed(0)}
                  </Text>
                  <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                    This Month
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Services & Customers Row */}
          <View style={styles.statusRow}>
            <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statusCardContent}>
                <Ionicons name="briefcase" size={20} color={theme.colors.secondary} />
                <Text variant="headlineSmall" style={[styles.statusNumber, { color: theme.colors.secondary }]}>
                  {stats.activeServices}
                </Text>
                <Text variant="bodySmall" style={[styles.statusLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Active Services
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statusCardContent}>
                <Ionicons name="people" size={20} color={theme.colors.tertiary} />
                <Text variant="headlineSmall" style={[styles.statusNumber, { color: theme.colors.tertiary }]}>
                  {stats.totalCustomers}
                </Text>
                <Text variant="bodySmall" style={[styles.statusLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Total Customers
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, styles.quickActionCardHalf, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => navigation.navigate('Bookings', { screen: 'BookingCreate' })}
            >
              <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={[styles.quickActionLabel, { color: theme.colors.onPrimaryContainer }]}>
                Create Booking
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, styles.quickActionCardHalf, { backgroundColor: theme.colors.secondaryContainer }]}
              onPress={() => navigation.navigate('Bookings', { screen: 'BookingList' })}
            >
              <Ionicons name="list" size={32} color={theme.colors.secondary} />
              <Text variant="bodyMedium" style={[styles.quickActionLabel, { color: theme.colors.onSecondaryContainer }]}>
                View All Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, styles.quickActionCardFull, { backgroundColor: theme.colors.tertiaryContainer }]}
              onPress={() => navigation.navigate('Customers', { screen: 'CustomerList' })}
            >
              <Ionicons name="people" size={32} color={theme.colors.tertiary} />
              <Text variant="bodyMedium" style={[styles.quickActionLabel, { color: theme.colors.onTertiaryContainer }]}>
                View Customers
              </Text>
            </TouchableOpacity>

            {/* Services section commented out - will be implemented in next prototype */}
            {/* <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: theme.colors.primaryContainer }]}
              onPress={() => navigation.navigate('Services', { screen: 'ServiceCreate' })}
            >
              <Ionicons name="add" size={32} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={[styles.quickActionLabel, { color: theme.colors.onPrimaryContainer }]}>
                Create Service
              </Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Recent Bookings
          </Text>
          {recentBookings.length === 0 ? (
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="calendar-outline" size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  No recent bookings
                </Text>
              </Card.Content>
            </Card>
          ) : (
            recentBookings.map((booking) => (
              <Card
                key={booking.id}
                style={[styles.recentCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => {
                  // Navigate to BookingDetails and indicate we came from Dashboard
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: 'Bookings',
                      params: {
                        screen: 'BookingDetails',
                        params: { bookingId: booking.id, cameFromDashboard: true },
                      },
                    })
                  );
                }}
              >
                <Card.Content>
                  <View style={styles.recentCardHeader}>
                    <View style={styles.recentCardInfo}>
                      <Text variant="titleMedium" style={[styles.recentCustomerName, { color: theme.colors.onSurface }]}>
                        {booking.customer_name}
                      </Text>
                      <Text variant="bodySmall" style={[styles.recentDate, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDate(booking.booking_date)}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: getStatusBackgroundColor(booking.status),
                      borderColor: getStatusColor(booking.status)
                    }]}>
                      <Text variant="bodySmall" style={[styles.statusText, { color: getStatusColor(booking.status), fontWeight: '600' }]}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodySmall" style={[styles.recentAddress, { color: theme.colors.onSurfaceVariant }]}>
                    {booking.service_address}
                  </Text>
                  <Text variant="titleSmall" style={[styles.recentAmount, { color: theme.colors.primary }]}>
                    €{booking.total_amount.toFixed(2)}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Bookings', { screen: 'BookingCreate' })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statTitle: {
    fontWeight: '600',
  },
  statValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statValue: {
    alignItems: 'center',
    minWidth: 90,
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statusCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  statusCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusNumber: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    elevation: 2,
  },
  quickActionLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActionCardHalf: {
    width: '47%',
  },
  quickActionCardFull: {
    width: '100%',
  },
  recentActivityContainer: {
    marginBottom: 24,
  },
  recentCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  recentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recentCardInfo: {
    flex: 1,
  },
  recentCustomerName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recentAddress: {
    marginBottom: 8,
  },
  recentAmount: {
    fontWeight: 'bold',
  },
  emptyCard: {
    borderRadius: 12,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

