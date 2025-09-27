import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Card, Button, TextInput, useTheme, Divider, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import MultiDateSelector from '../../components/MultiDateSelector';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { serviceBookingAPI, CreateServiceBookingData } from '../../services/serviceBookingAPI';
import { profileAPI, UserProfile } from '../../services/profileAPI';
import { CartStackScreenProps } from '../../navigation/types';
import { BookingDate } from '../../types';

type Props = CartStackScreenProps<'Checkout'>;

interface OrderAddress {
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  additional_notes: string;
}

const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { cartItems, cartSummary, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Form state
  const [address, setAddress] = useState<OrderAddress>({
    street_address: '',
    city: '',
    postal_code: '',
    country: 'Germany',
    additional_notes: '',
  });
  const [serviceDate, setServiceDate] = useState(new Date());
  const [serviceTime, setServiceTime] = useState(new Date());
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Multi-day booking state
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDates, setSelectedDates] = useState<BookingDate[]>([]);

  // Calculate total price accounting for multiple days
  const calculateTotalPrice = () => {
    const baseTotal = cartSummary?.totalPrice || 0;
    if (isMultiDay && selectedDates.length > 0) {
      return baseTotal * selectedDates.length;
    }
    return baseTotal;
  };

  const totalPrice = calculateTotalPrice();

  // Pre-fill address form with user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const userProfile = await profileAPI.getProfile();
          if (userProfile) {
            setAddress(prevAddress => ({
              ...prevAddress,
              street_address: userProfile.address || '',
              city: userProfile.city || '',
              postal_code: userProfile.postal_code || '',
              country: userProfile.country || 'Germany',
              additional_notes: '', // Leave empty for user to fill
            }));
          } else {
            // Fallback to basic user info if profile not found
            setAddress(prevAddress => ({
              ...prevAddress,
              country: 'Germany',
              additional_notes: '', // Leave empty for user to fill
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to basic user info on error
          setAddress(prevAddress => ({
            ...prevAddress,
            country: 'Germany',
            additional_notes: '', // Leave empty for user to fill
          }));
        }
      }
    };

    loadUserProfile();
  }, [user]);

  // Date picker handlers
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setServiceDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setServiceTime(selectedTime);
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
  };

  const handleTimeConfirm = () => {
    setShowTimePicker(false);
  };

  const validateForm = () => {
    if (!address.street_address.trim()) {
      Alert.alert('Error', 'Please enter your street address');
      return false;
    }
    if (!address.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    if (!address.postal_code.trim()) {
      Alert.alert('Error', 'Please enter your postal code');
      return false;
    }
    if (isMultiDay && selectedDates.length === 0) {
      Alert.alert('Error', 'Please select at least one service date');
      return false;
    }
    if (!isMultiDay && !serviceDate) {
      Alert.alert('Error', 'Please select a service date');
      return false;
    }
    return true;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Prepare dates for booking
      const datesToBook = isMultiDay ? selectedDates : [{
        date: serviceDate.toISOString().split('T')[0],
        time: serviceTime.toTimeString().split(' ')[0]?.substring(0, 5) || '09:00',
        id: 'single_date'
      }];

      console.log('Starting to create service bookings...');
      console.log('Cart items:', cartItems);
      console.log('User:', user);
      console.log('Is multi-day:', isMultiDay);
      console.log('Dates to book:', datesToBook);
      
      // Create service bookings for each cart item
      const bookingPromises = cartItems.map(async (item, index) => {
        console.log(`Creating booking for item ${index + 1}:`, item);
        
        const serviceId = item.service_id || item.serviceId;
        if (!serviceId) {
          throw new Error(`Service ID is required for item ${index + 1}`);
        }
        
        // Calculate total amount for this item
        // For multi-day bookings, send the total amount and let backend split it
        const basePrice = item.calculated_price || item.service_price || item.price || 0;
        const itemTotalAmount = isMultiDay ? basePrice * datesToBook.length : basePrice;
        
        const bookingData: CreateServiceBookingData = {
          service_id: serviceId,
          booking_date: datesToBook[0]?.date || '',
          booking_time: datesToBook[0]?.time || '',
          booking_dates: isMultiDay ? datesToBook.map(d => ({ date: d.date || '', time: d.time || '' })) : [],
          duration_minutes: parseInt((item.service_duration || item.duration || '2').split('-')[0] || '2') * 60 || 120,
          customer_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer',
          customer_email: user?.email || '',
          customer_phone: user?.phone || undefined,
          service_address: `${address.street_address}, ${address.city}, ${address.postal_code}, ${address.country}`,
          special_instructions: specialInstructions || address.additional_notes,
          total_amount: itemTotalAmount,
          payment_method: 'pending'
        };

        console.log(`Booking data for item ${index + 1}:`, bookingData);
        
        try {
          const result = await serviceBookingAPI.createBooking(bookingData);
          console.log(`Successfully created booking for item ${index + 1}:`, result);
          return result;
        } catch (itemError) {
          console.error(`Error creating booking for item ${index + 1}:`, itemError);
          throw itemError;
        }
      });

      // Create all bookings
      console.log('Creating all bookings...');
      const createdBookings = await Promise.all(bookingPromises);
      console.log('All bookings created successfully:', createdBookings);
      
      // Clear cart and navigate to confirmation
      console.log('Clearing cart...');
      await clearCart();
      console.log('Navigating to confirmation...');
      
      // Generate unique order ID
      const uniqueOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      navigation.navigate('OrderConfirmation', { 
        bookingId: uniqueOrderId,
        orderData: {
          service_date: datesToBook[0]?.date || '',
          service_time: datesToBook[0]?.time || '',
          total_amount: totalPrice,
          items: createdBookings.map((booking, index) => ({
            service_title: cartItems[index]?.service_title || cartItems[index]?.title || 'Service',
            calculated_price: booking.total_amount,
            quantity: cartItems[index]?.quantity || 1,
            service_duration: `${booking.duration_minutes / 60} hours`
          })),
          address: address,
          bookings: createdBookings
        }
      });
      
    } catch (error) {
      console.error('Error creating service bookings:', error);
      Alert.alert('Error', `Failed to create service bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.colors.outline} />
          <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            Your cart is empty
          </Text>
          <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Add some services to get started
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Services' as any)}
            style={styles.continueButton}
          >
            Continue Shopping
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Checkout" showBack />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Order Summary */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Order Summary
            </Text>
            <Divider style={styles.divider} />
            
            {cartItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                    {item.service_title || item.title || 'Service'}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.service_duration || item.duration || '2 hours'} • Qty: {item.quantity}
                  </Text>
                </View>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                  €{((item.calculated_price || item.service_price || item.price || 0)).toFixed(2)}
                </Text>
              </View>
            ))}
            
            {isMultiDay && selectedDates.length > 1 && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.pricingBreakdown}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    Base Price (per day): €{(cartSummary?.totalPrice || 0).toFixed(2)}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    Number of Days: {selectedDates.length}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    Total: €{(cartSummary?.totalPrice || 0).toFixed(2)} × {selectedDates.length} = €{totalPrice.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
            
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                Total
              </Text>
              <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                €{totalPrice.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Service Date & Time */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.serviceDetailsHeader}>
              <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                Service Details
              </Text>
              <View style={styles.multiDayToggle}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Multiple Days
                </Text>
                <Switch
                  value={isMultiDay}
                  onValueChange={setIsMultiDay}
                  color={theme.colors.primary}
                />
              </View>
            </View>
            <Divider style={styles.divider} />
            
            {isMultiDay ? (
              <MultiDateSelector
                selectedDates={selectedDates}
                onDatesChange={setSelectedDates}
                serviceTime={serviceTime}
                onTimeChange={setServiceTime}
                maxDays={7}
              />
            ) : (
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeItem}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Service Date
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                    style={styles.dateTimeButton}
                  >
                    {formatDate(serviceDate)}
                  </Button>
                </View>
                
                <View style={styles.dateTimeItem}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Service Time
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => setShowTimePicker(true)}
                    style={styles.dateTimeButton}
                  >
                    {formatTime(serviceTime)}
                  </Button>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Address Form */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Service Address
            </Text>
            <Divider style={styles.divider} />
            
            <TextInput
              label="Street Address"
              value={address.street_address}
              onChangeText={(text) => setAddress({...address, street_address: text})}
              mode="outlined"
              style={styles.input}
            />
            
            <View style={styles.addressRow}>
              <TextInput
                label="City"
                value={address.city}
                onChangeText={(text) => setAddress({...address, city: text})}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Postal Code"
                value={address.postal_code}
                onChangeText={(text) => setAddress({...address, postal_code: text})}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
              />
            </View>
            
            <TextInput
              label="Country"
              value={address.country}
              onChangeText={(text) => setAddress({...address, country: text})}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Additional Notes (Optional)"
              value={address.additional_notes}
              onChangeText={(text) => setAddress({...address, additional_notes: text})}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Special Instructions */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Special Instructions
            </Text>
            <Divider style={styles.divider} />
            
            <TextInput
              label="Any special requests or instructions"
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Place Order Button */}
        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading}
          style={[styles.placeOrderButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
        >
          {loading ? 'Placing Order...' : `Place Order - €${totalPrice.toFixed(2)}`}
        </Button>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={serviceDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.pickerButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(false)}
                style={styles.pickerButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleDateConfirm}
                style={styles.pickerButton}
              >
                OK
              </Button>
            </View>
          )}
        </View>
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={serviceTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.pickerButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowTimePicker(false)}
                style={styles.pickerButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleTimeConfirm}
                style={styles.pickerButton}
              >
                OK
              </Button>
            </View>
          )}
        </View>
      )}
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingBreakdown: {
    paddingVertical: 8,
    gap: 4,
  },
  serviceDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  multiDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateTimeButton: {
    marginTop: 8,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  placeOrderButton: {
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  continueButton: {
    borderRadius: 8,
  },
  pickerContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  pickerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CheckoutScreen;
