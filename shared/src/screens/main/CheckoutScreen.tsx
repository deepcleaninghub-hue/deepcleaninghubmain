// Enhanced with comprehensive color palette: #F9F7F7, #DBE2EF, #3F72AF, #112D4E
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
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
import { useLanguage } from '../../contexts/LanguageContext';
import AutoTranslateText from '../../components/AutoTranslateText';
import AppModal from '../../components/common/AppModal';
import { useAppModal } from '../../hooks/useAppModal';
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
  const { t, tAuto } = useLanguage();
  const { modalConfig, visible, hideModal, showError } = useAppModal();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Form state
  const [address, setAddress] = useState<OrderAddress>({
    street_address: '',
    city: '',
    postal_code: '',
    country: t('common.germany'),
    additional_notes: '',
  });
  const [serviceDate, setServiceDate] = useState(new Date());
  const [serviceTime, setServiceTime] = useState(new Date());
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Multi-day booking state
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDates, setSelectedDates] = useState<BookingDate[]>([]);
  
  // Check if multi-day booking is allowed for current cart items
  const isMultiDayAllowed = () => {
    if (!cartItems || cartItems.length === 0) return false;
    
    // Only allow multi-day for deep cleaning and kitchen cleaning services
    const allowedServiceIds = ['deep-cleaning', 'kitchen-cleaning'];
    
    return cartItems.every(item => {
      const serviceId = item.service_id || item.serviceId;
      return allowedServiceIds.includes(serviceId);
    });
  };
  
  // Refs for focusing next field
  const cityRef = useRef<any>(null);
  const postalCodeRef = useRef<any>(null);
  const countryRef = useRef<any>(null);
  const additionalNotesRef = useRef<any>(null);
  const specialInstructionsRef = useRef<any>(null);

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
              country: userProfile.country || t('common.germany'),
              additional_notes: '', // Leave empty for user to fill
            }));
          } else {
            // Fallback to basic user info if profile not found
            setAddress(prevAddress => ({
              ...prevAddress,
              country: t('common.germany'),
              additional_notes: '', // Leave empty for user to fill
            }));
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to basic user info on error
          setAddress(prevAddress => ({
            ...prevAddress,
            country: t('common.germany'),
            additional_notes: '', // Leave empty for user to fill
          }));
        }
      }
    };

    loadUserProfile();
  }, [user]);

  // Reset multi-day state when cart changes and multi-day is no longer allowed
  useEffect(() => {
    if (!isMultiDayAllowed() && isMultiDay) {
      setIsMultiDay(false);
      setSelectedDates([]);
    }
  }, [cartItems, isMultiDay]);

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
      showError(t('errors.validationError'), t('checkout.enterStreetAddress'));
      return false;
    }
    if (!address.city.trim()) {
      showError(t('errors.validationError'), t('checkout.enterCity'));
      return false;
    }
    if (!address.postal_code.trim()) {
      showError(t('errors.validationError'), t('checkout.enterPostalCode'));
      return false;
    }
    if (isMultiDay && selectedDates.length === 0) {
      showError(t('errors.validationError'), t('checkout.selectServiceDate'));
      return false;
    }
    if (!isMultiDay && !serviceDate) {
      showError(t('errors.validationError'), t('checkout.selectServiceDate'));
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

      // Creating service bookings - silent
      
      // Create service bookings for each cart item
      const bookingPromises = cartItems.map(async (item, index) => {
        // Creating booking for item - silent
        
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
          payment_method: 'pending',
          // Include user inputs from cart item
          user_inputs: item.user_inputs || {},
          service_variant_data: item.service_variant_data || null,
          moving_service_data: item.moving_service_data || null,
          cost_breakdown: item.cost_breakdown || null,
          booking_type: item.booking_type || 'standard',
          is_house_moving: item.is_house_moving || false,
          area_sqm: item.area_sqm || null,
          distance_km: item.distance_km || null,
          number_of_boxes: item.number_of_boxes || 0,
          boxes_cost: item.boxes_cost || 0,
          area_cost: item.area_cost || null,
          distance_cost: item.distance_cost || null,
          subtotal_before_vat: item.subtotal_before_vat || null,
          vat_amount: item.vat_amount || null,
          vat_rate: item.vat_rate || 0.19,
          service_duration_hours: item.service_duration_hours || null,
          measurement_value: item.measurement_value || null,
          measurement_unit: item.measurement_unit || null,
          unit_price: item.unit_price || null,
          pricing_type: item.pricing_type || 'fixed',
          selected_dates: item.selected_dates || null,
          is_multi_day_booking: item.is_multi_day_booking || false
        };

        // Debug: Log what's being sent to booking creation

        // Booking data for item - silent
        
        try {
          const result = await serviceBookingAPI.createBooking(bookingData);
          // Successfully created booking - silent
          return result;
        } catch (itemError) {
          console.error(`Error creating booking for item ${index + 1}:`, itemError);
          throw itemError;
        }
      });

      // Create all bookings
      // Creating all bookings - silent
      const createdBookings = await Promise.all(bookingPromises);
      // All bookings created successfully - silent
      
      // Clear cart and navigate to confirmation
      // Clearing cart - silent
      await clearCart();
      // Navigating to confirmation - silent
      
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
      showError(t('errors.validationError'), `${t('checkout.bookingFailed')}: ${error instanceof Error ? error.message : t('errors.unexpectedError')}`);
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
            {t('checkout.yourCartIsEmpty')}
          </Text>
          <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('checkout.addSomeServices')}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Services' as any)}
            style={styles.continueButton}
          >
            {t('checkout.continueShopping')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('checkout.title')} showBack />
      
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
              {t('checkout.orderSummary')}
            </Text>
            <Divider style={styles.divider} />
            
            {cartItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                    {item.service_title || item.title || t('checkout.service')}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.service_duration || item.duration || t('checkout.twoHours')} • {t('checkout.qty')} {item.quantity}
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
                    {t('checkout.basePricePerDay')} €{(cartSummary?.totalPrice || 0).toFixed(2)}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    {t('checkout.numberOfDays')} {selectedDates.length}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    {t('checkout.total')} €{(cartSummary?.totalPrice || 0).toFixed(2)} × {selectedDates.length} = €{totalPrice.toFixed(2)}
                  </Text>
                </View>
              </>
            )}
            
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                {t('checkout.total')}
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
                {t('checkout.serviceDetails')}
              </Text>
              {isMultiDayAllowed() && (
                <View style={styles.multiDayToggle}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t('checkout.multipleDays')}
                  </Text>
                  <Switch
                    value={isMultiDay}
                    onValueChange={setIsMultiDay}
                    color={theme.colors.primary}
                  />
                </View>
              )}
            </View>
            <Divider style={styles.divider} />
            
            {isMultiDay ? (
              <MultiDateSelector
                selectedDates={selectedDates}
                onDatesChange={setSelectedDates}
                serviceTime={serviceTime}
                onTimeChange={setServiceTime}
                maxDays={7}
                t={t}
              />
            ) : (
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeItem}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {t('checkout.serviceDate')}
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
                    {t('checkout.serviceTime')}
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
            
            {/* Multi-day availability info */}
            {!isMultiDayAllowed() && cartItems.length > 0 && (
              <View style={styles.multiDayInfo}>
                <Text variant="bodySmall" style={[styles.multiDayInfoText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('checkout.multiDayOnlyForCleaning')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Address Form */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              {t('checkout.serviceAddress')}
            </Text>
            <Divider style={styles.divider} />
            
            <TextInput
              label={t('checkout.streetAddress')}
              value={address.street_address}
              onChangeText={(text) => setAddress({...address, street_address: text})}
              mode="outlined"
              style={styles.input}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => cityRef.current?.focus()}
            />
            
            <View style={styles.addressRow}>
              <TextInput
                ref={cityRef}
                label={t('checkout.city')}
                value={address.city}
                onChangeText={(text) => setAddress({...address, city: text})}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => postalCodeRef.current?.focus()}
              />
              <TextInput
                ref={postalCodeRef}
                label={t('checkout.postalCode')}
                value={address.postal_code}
                onChangeText={(text) => setAddress({...address, postal_code: text})}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => countryRef.current?.focus()}
              />
            </View>
            
            <TextInput
              ref={countryRef}
              label={t('checkout.country')}
              value={address.country}
              onChangeText={(text) => setAddress({...address, country: text})}
              mode="outlined"
              style={styles.input}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => additionalNotesRef.current?.focus()}
            />
            
            <TextInput
              ref={additionalNotesRef}
              label={t('checkout.additionalNotesOptional')}
              value={address.additional_notes}
              onChangeText={(text) => setAddress({...address, additional_notes: text})}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => specialInstructionsRef.current?.focus()}
            />
          </Card.Content>
        </Card>

        {/* Special Instructions */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              {t('checkout.specialInstructions')}
            </Text>
            <Divider style={styles.divider} />
            
            <TextInput
              ref={specialInstructionsRef}
              label={t('checkout.specialRequests')}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={handlePlaceOrder}
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
          {loading ? (
            t('checkout.placingOrder')
          ) : (
            `${t('checkout.placeOrder')}${totalPrice.toFixed(2)}`
          )}
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
                {t('checkout.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleDateConfirm}
                style={styles.pickerButton}
              >
                {t('checkout.ok')}
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
                {t('checkout.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleTimeConfirm}
                style={styles.pickerButton}
              >
                {t('checkout.ok')}
              </Button>
            </View>
          )}
        </View>
      )}
      
      {/* App Modal */}
      {modalConfig && (
        <AppModal
          visible={visible}
          onDismiss={hideModal}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          showCancel={modalConfig.showCancel}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
          icon={modalConfig.icon}
        />
      )}
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
  multiDayInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(63, 114, 175, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3F72AF',
  },
  multiDayInfoText: {
    fontStyle: 'italic',
    textAlign: 'center',
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
    shadowColor: '#112D4E',
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
