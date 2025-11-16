import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Card, Button, TextInput, useTheme, Divider, Switch, Menu, Searchbar, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiDateSelector from '../../../../shared/src/components/MultiDateSelector';
import { BookingDate } from '../../../../shared/src/types';
import { useAdminData } from '@/contexts/AdminDataContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminDataService } from '@/services/adminDataService';
import { AdminService, AdminBooking } from '@/types';
import { buildBookingData } from './bookingDataBuilder';

// Hardcoded service categories
const SERVICE_CATEGORIES = [
  { id: 'cleaning', title: 'Cleaning', category: 'Cleaning' },
  { id: 'furniture-assembly', title: 'Furniture Assembly', category: 'Furniture Assembly' },
  { id: 'furniture-disassembly', title: 'Furniture Disassembly', category: 'Furniture Disassembly' },
  { id: 'moving', title: 'Moving', category: 'Moving' },
  { id: 'office-setup', title: 'Office Setup', category: 'Office Setup' },
  { id: 'house-painting', title: 'House Painting', category: 'House Painting' },
];

type ServiceVariant = {
  id: string;
  service_id: string;
  title: string;
  description?: string;
  price?: number;
  unitPrice?: number;
  unitMeasure?: string;
  pricingType?: 'fixed' | 'per_unit' | 'hourly';
  minMeasurement?: number;
  maxMeasurement?: number;
  measurementStep?: number;
  measurementPlaceholder?: string;
  duration?: number;
  is_active?: boolean;
  display_order?: number;
};

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// Helper functions for initial date and time
const getInitialDate = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const getInitialTime = () => {
  const now = new Date();
  const futureTime = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
  return futureTime;
};

export function BookingCreateScreen({ navigation }: any) {
  const theme = useTheme();
  const { services } = useAdminData();
  const { signOut } = useAdminAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  
  // Service selection state
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<AdminService | null>(null);
  const [selectedServiceVariant, setSelectedServiceVariant] = useState<ServiceVariant | null>(null);
  
  // Dropdown visibility
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [serviceTypeMenuVisible, setServiceTypeMenuVisible] = useState(false);
  const [variantMenuVisible, setVariantMenuVisible] = useState(false);
  
  // Filtered data
  const [filteredServices, setFilteredServices] = useState<AdminService[]>([]);
  const [serviceVariants, setServiceVariants] = useState<ServiceVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  
  // Variant configuration state
  const [variantQuantity, setVariantQuantity] = useState('1');
  const [variantMeasurement, setVariantMeasurement] = useState('');
  const [distance, setDistance] = useState('');
  const [numberOfBoxes, setNumberOfBoxes] = useState('');
  
  // Date and time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // Initialize with current date and time + 1 hour to ensure it's in the future
  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  const [selectedTime, setSelectedTime] = useState<Date>(getInitialTime());
  
  // Formatted date and time strings for backend
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Multi-day booking state
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDates, setSelectedDates] = useState<BookingDate[]>([]);
  const [serviceTime, setServiceTime] = useState(new Date());

  // Check if this is a house moving service
  const isHouseMovingService = selectedServiceType?.title?.toLowerCase().includes('moving') || 
                               selectedServiceType?.title?.toLowerCase().includes('house') ||
                               selectedServiceCategory === 'moving';

  // Check if this is a weekly cleaning service (mandatory multi-day booking)
  const isWeeklyCleaningService = selectedServiceType?.id === 'weekly-cleaning' ||
                                  selectedServiceType?.title?.toLowerCase().includes('weekly cleaning') ||
                                  selectedServiceVariant?.title?.toLowerCase().includes('weekly cleaning') ||
                                  selectedServiceVariant?.id === 'weekly-cleaning';

  // Determine pricing type with fallback logic
  const getPricingType = (variant: ServiceVariant | null): 'fixed' | 'per_unit' | 'hourly' => {
    if (!variant) return 'fixed';
    
    // If pricingType is explicitly set, use it
    if (variant.pricingType) {
      return variant.pricingType;
    }
    
    // Fallback: If variant has unitPrice or unitMeasure, it's per_unit
    if (variant.unitPrice || variant.unitMeasure) {
      return 'per_unit';
    }
    
    // Default to fixed pricing
    return 'fixed';
  };

  const effectivePricingType = getPricingType(selectedServiceVariant);

  // Automatically set multi-day to true for weekly cleaning, false for others
  useEffect(() => {
    if (isWeeklyCleaningService) {
      setIsMultiDay(true);
    } else {
      setIsMultiDay(false);
    }
  }, [isWeeklyCleaningService]);

  // Reset variant configuration when variant changes
  useEffect(() => {
    if (selectedServiceVariant) {
      setVariantQuantity('1');
      setVariantMeasurement('');
      setDistance('');
      setNumberOfBoxes('');
    }
  }, [selectedServiceVariant]);

  // Calculate house moving cost
  const calculateHouseMovingCost = (area: number, distanceValue: number, rate: number, boxes: number = 0) => {
    const RATE_PER_KM = 0.5; // 0.5 euro per km
    const BOX_PRICE = 2.50; // €2.50 per box
    const VAT_RATE = 0.19; // 19% VAT
    
    const areaCost = rate * area;
    const distanceCost = distanceValue * RATE_PER_KM;
    const boxesCost = boxes * BOX_PRICE;
    const subtotal = areaCost + distanceCost + boxesCost;
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    
    return {
      areaCost,
      distanceCost,
      boxesCost,
      subtotal,
      vat,
      total,
      ratePerKm: RATE_PER_KM,
      boxPrice: BOX_PRICE,
      vatRate: VAT_RATE
    };
  };

  // Calculate total price based on pricing type
  const calculateTotalPrice = (): number => {
    if (!selectedServiceVariant) return 0;

    if (isHouseMovingService) {
      const area = effectivePricingType === 'per_unit' 
        ? parseFloat(variantMeasurement || '0')
        : parseFloat(variantQuantity || '1');
      const distanceValue = parseFloat(distance) || 0;
      const boxesValue = parseFloat(numberOfBoxes) || 0;
      const rate = effectivePricingType === 'per_unit' 
        ? (selectedServiceVariant.unitPrice || selectedServiceVariant.price || 0)
        : (selectedServiceVariant.price || 0);
      
      const movingCost = calculateHouseMovingCost(area, distanceValue, rate, boxesValue);
      return movingCost.total;
    }

    if (effectivePricingType === 'per_unit') {
      const measurement = parseFloat(variantMeasurement || '0');
      return measurement * (selectedServiceVariant.unitPrice || selectedServiceVariant.price || 0);
    }
    
    // Fixed pricing - multiply by quantity
    return (selectedServiceVariant.price || 0) * parseFloat(variantQuantity || '1');
  };

  // Handle numeric input with validation
  const handleMeasurementChange = (text: string) => {
    // Allow empty string, numbers, and a single decimal point
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    
    // Remove any non-numeric characters except decimal point
    let cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      cleanedText = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Validate against regex
    if (cleanedText === '' || numericRegex.test(cleanedText)) {
      setVariantMeasurement(cleanedText);
    }
  };

  const handleDistanceChange = (text: string) => {
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    let cleanedText = text.replace(/[^0-9.]/g, '');
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      cleanedText = parts[0] + '.' + parts.slice(1).join('');
    }
    if (cleanedText === '' || numericRegex.test(cleanedText)) {
      setDistance(cleanedText);
    }
  };

  const handleBoxesChange = (text: string) => {
    // For boxes, only allow whole numbers
    const numericRegex = /^[0-9]*$/;
    const cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText === '' || numericRegex.test(cleanedText)) {
      setNumberOfBoxes(cleanedText);
    }
  };

  const handleQuantityChange = (text: string) => {
    // Allow empty string, numbers, and a single decimal point
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    
    // Remove any non-numeric characters except decimal point
    let cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      cleanedText = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Validate against regex
    if (cleanedText === '' || numericRegex.test(cleanedText)) {
      setVariantQuantity(cleanedText);
    }
  };

  // Date picker handlers
  const handleDateChange = (event: any, pickedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (pickedDate) {
      // Ensure the date is today or later
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const pickedDateOnly = new Date(pickedDate);
      pickedDateOnly.setHours(0, 0, 0, 0);
      
      if (pickedDateOnly < today) {
        Alert.alert('Invalid Date', 'Please select a date from today onwards');
        return;
      }
      
      setSelectedDate(pickedDate);
      // Format date as YYYY-MM-DD
      const formattedDate = pickedDate.toISOString().split('T')[0] || '';
      setDate(formattedDate);
      
      // If the selected date is today, reset time to current time + 1 hour to ensure it's in the future
      if (pickedDateOnly.getTime() === today.getTime()) {
        const now = new Date();
        const futureTime = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
        setSelectedTime(futureTime);
        const formattedTime = futureTime.toTimeString().split(' ')[0]?.substring(0, 5) || '09:00';
        setTime(formattedTime);
      }
    }
  };

  const handleTimeChange = (event: any, pickedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (pickedTime) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);
      
      // If the selected date is today, ensure the time is in the future
      if (selectedDateOnly.getTime() === today.getTime()) {
        const now = new Date();
        const pickedDateTime = new Date(pickedTime);
        pickedDateTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (pickedDateTime <= now) {
          Alert.alert('Invalid Time', 'Please select a time after the current time');
          return;
        }
      }
      
      setSelectedTime(pickedTime);
      // Format time as HH:MM
      const formattedTime = pickedTime.toTimeString().split(' ')[0]?.substring(0, 5) || '09:00';
      setTime(formattedTime);
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
  };

  const handleTimeConfirm = () => {
    setShowTimePicker(false);
  };

  // Format date for display
  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatDisplayTime = (time: Date): string => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Initialize date and time strings on mount
  useEffect(() => {
    const initialDate = getInitialDate();
    const initialTime = getInitialTime();
    setDate(initialDate.toISOString().split('T')[0] || '');
    setTime(initialTime.toTimeString().split(' ')[0]?.substring(0, 5) || '09:00');
  }, []);

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers based on search query
  useEffect(() => {
    if (customerSearchQuery.trim()) {
      const query = customerSearchQuery.toLowerCase();
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearchQuery, customers]);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      
      // Load bookings to extract customer data
      const bookingsResponse = await adminDataService.getBookings();
      const bookings = bookingsResponse.data || [];
      
      // Group bookings by customer
      const customerMap = new Map<string, {
        bookings: AdminBooking[];
      }>();

      bookings.forEach((booking: AdminBooking) => {
        // Only use user_id if it exists and is a valid UUID format
        // Don't fall back to email as it's not a valid user_id
        const customerId = booking.user_id;
        
        // Skip bookings without a valid user_id
        if (!customerId || customerId === 'unknown') {
          console.warn('Skipping booking without valid user_id:', booking.id);
          return;
        }
        
        // Validate UUID format (basic check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(customerId)) {
          console.warn('Skipping booking with invalid user_id format:', customerId);
          return;
        }
        
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            bookings: [],
          });
        }
        
        const customerData = customerMap.get(customerId)!;
        customerData.bookings.push(booking);
      });

      // Convert to customer list
      const customerList: Customer[] = [];
      for (const [id, data] of customerMap.entries()) {
        const firstBooking = data.bookings[0];
        if (!firstBooking) continue;
        
        const user = firstBooking.mobile_users;
        const name = user 
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || firstBooking.customer_name || 'Customer'
          : firstBooking.customer_name || 'Customer';
        
        customerList.push({
          id, // This is now guaranteed to be a valid UUID
          name,
          email: user?.email || firstBooking.customer_email || '',
          phone: user?.phone || firstBooking.customer_phone || '',
        });
      }

      // Sort by name
      customerList.sort((a, b) => a.name.localeCompare(b.name));
      
      setCustomers(customerList);
      setFilteredCustomers(customerList);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Filter services when category is selected
  useEffect(() => {
    if (selectedServiceCategory) {
      const category = SERVICE_CATEGORIES.find(cat => cat.id === selectedServiceCategory);
      if (category) {
        const filtered = services.filter(service => service.category === category.category);
        setFilteredServices(filtered);
        // Reset service type and variant when category changes
        setSelectedServiceType(null);
        setSelectedServiceVariant(null);
        setServiceVariants([]);
      }
    } else {
      setFilteredServices([]);
      setSelectedServiceType(null);
      setSelectedServiceVariant(null);
      setServiceVariants([]);
    }
  }, [selectedServiceCategory, services]);

  // Fetch variants when service type is selected
  useEffect(() => {
    if (selectedServiceType) {
      fetchServiceVariants(selectedServiceType.id);
      // Reset variant when service type changes
      setSelectedServiceVariant(null);
    } else {
      setServiceVariants([]);
      setSelectedServiceVariant(null);
    }
  }, [selectedServiceType]);

  const fetchServiceVariants = async (serviceId: string) => {
    try {
      setLoadingVariants(true);
      const response = await adminDataService.getServiceVariants(serviceId);
      if (response.success && response.data) {
        setServiceVariants(response.data);
      } else {
        setServiceVariants([]);
      }
    } catch (error) {
      console.error('Error fetching service variants:', error);
      setServiceVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const getSelectedCategoryTitle = () => {
    const category = SERVICE_CATEGORIES.find(cat => cat.id === selectedServiceCategory);
    return category ? category.title : 'Select Service Category';
  };

  const handleCreateBooking = async () => {
    if (!selectedCustomer) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }
    
    if (!selectedServiceCategory) {
      Alert.alert('Error', 'Please select a service category');
      return;
    }
    
    if (!selectedServiceType) {
      Alert.alert('Error', 'Please select a service type');
      return;
    }
    
    if (!selectedServiceVariant) {
      Alert.alert('Error', 'Please select a service variant');
      return;
    }
    
    if (isWeeklyCleaningService) {
      if (selectedDates.length === 0) {
        Alert.alert('Error', 'Please select at least one service date for weekly cleaning');
        return;
      }
    } else {
      if (!date || !time) {
      Alert.alert('Error', 'Please select service date and time');
      return;
      }
    }

    if (!serviceAddress || serviceAddress.trim() === '') {
      Alert.alert('Error', 'Please enter service address');
      return;
    }

    setIsCreating(true);

    try {
      // Validate that customer ID is a valid UUID before sending
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(selectedCustomer.id)) {
        Alert.alert(
          'Invalid Customer',
          'The selected customer does not have a valid user ID. Please select a different customer or ensure the customer has a valid account.',
        );
        setIsCreating(false);
        return;
      }

      // Build booking data using the same format as shared app
      // This includes all the additional fields like user_inputs, service_variant_data, etc.
      // The buildBookingData function handles all the complex logic including duration parsing
      const sharedAppBookingData = buildBookingData({
        customer: {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          ...(selectedCustomer.phone && { phone: selectedCustomer.phone }),
        },
        service: {
          id: selectedServiceType.id,
          title: selectedServiceType.title,
          category: selectedServiceCategory,
        },
        variant: selectedServiceVariant,
        quantity: variantQuantity,
        measurement: variantMeasurement,
        distance: distance,
        numberOfBoxes: numberOfBoxes,
        date: date,
        time: time,
        selectedDates: selectedDates,
        serviceTime: serviceTime,
        serviceAddress: serviceAddress.trim(),
        ...(notes.trim() && { notes: notes.trim() }),
      });

      // Log the data being sent for debugging
      console.log('Booking Data (Shared App Format):', JSON.stringify(sharedAppBookingData, null, 2));

      // Create booking via API using the same endpoint as shared app
      // This endpoint expects the full booking data format with all fields
      const response = await adminDataService.createBooking(sharedAppBookingData);

      if (response.success) {
        Alert.alert('Success', 'Booking created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // Check if it's an authentication error
        const errorMessage = response.error || 'Failed to create booking';
        console.error('Booking creation failed:', errorMessage);
        
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('token')) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again to continue.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await signOut();
                  navigation.navigate('Login');
                },
              },
            ]
          );
        } else {
          Alert.alert('Error', `Failed to create booking: ${errorMessage}`);
        }
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      console.error('Full error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Check if it's an authentication error
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to create booking';
      const statusCode = error?.response?.status;
      
      if (statusCode === 401 || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('token')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again to continue.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await signOut();
                navigation.navigate('Login');
              },
            },
          ]
        );
      } else {
        // Show detailed error message
        const detailedError = error?.response?.data?.error || error?.response?.data?.message || errorMessage;
        Alert.alert('Error', `Failed to create booking:\n\n${detailedError}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

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
        <Text variant="headlineSmall" style={styles.headerTitle}>Create Booking</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Booking Information
            </Text>
            <Divider style={styles.divider} />
            
            {/* Customer Dropdown with Search */}
            <View style={styles.dropdownContainer}>
              <Text variant="bodyMedium" style={[styles.dropdownLabel, { color: theme.colors.onSurface }]}>
                Customer *
              </Text>
              <Menu
                visible={customerMenuVisible}
                onDismiss={() => {
                  setCustomerMenuVisible(false);
                  setCustomerSearchQuery('');
                }}
                anchor={
                  <Button
              mode="outlined"
                    onPress={() => setCustomerMenuVisible(true)}
                    style={styles.dropdownButton}
                    contentStyle={styles.dropdownButtonContent}
                    loading={loadingCustomers}
                    disabled={loadingCustomers}
                  >
                    {selectedCustomer 
                      ? `${selectedCustomer.name} (${selectedCustomer.email})`
                      : loadingCustomers
                      ? 'Loading customers...'
                      : 'Select Customer'}
                  </Button>
                }
                contentStyle={styles.customerMenuContent}
              >
                <View style={styles.customerSearchContainer}>
                  <Searchbar
                    placeholder="Search by name, email, phone..."
                    onChangeText={setCustomerSearchQuery}
                    value={customerSearchQuery}
                    style={styles.customerSearchBar}
                  />
                </View>
                <ScrollView style={styles.customerListScroll} nestedScrollEnabled>
                  {filteredCustomers.length === 0 ? (
                    <View style={styles.emptyCustomerContainer}>
                      <Text style={[styles.emptyCustomerText, { color: theme.colors.onSurfaceVariant }]}>
                        {customerSearchQuery ? 'No customers found' : 'No customers available'}
                      </Text>
                    </View>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <Menu.Item
                        key={customer.id}
                        onPress={() => {
                          setSelectedCustomer(customer);
                          setCustomerMenuVisible(false);
                          setCustomerSearchQuery('');
                        }}
                        title={`${customer.name}${customer.email ? ` - ${customer.email}` : ''}${customer.phone ? ` (${customer.phone})` : ''}`}
                        titleStyle={styles.customerMenuItemTitle}
                      />
                    ))
                  )}
                </ScrollView>
              </Menu>
            </View>
            
            {/* Service Category Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text variant="bodyMedium" style={[styles.dropdownLabel, { color: theme.colors.onSurface }]}>
                Service Category *
              </Text>
              <Menu
                visible={categoryMenuVisible}
                onDismiss={() => setCategoryMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setCategoryMenuVisible(true)}
                    style={styles.dropdownButton}
                    contentStyle={styles.dropdownButtonContent}
                  >
                    {getSelectedCategoryTitle()}
                  </Button>
                }
              >
                {SERVICE_CATEGORIES.map((category) => (
                  <Menu.Item
                    key={category.id}
                    onPress={() => {
                      setSelectedServiceCategory(category.id);
                      setCategoryMenuVisible(false);
                    }}
                    title={category.title}
                  />
                ))}
              </Menu>
            </View>
            
            {/* Service Type Dropdown */}
            {selectedServiceCategory && (
              <View style={styles.dropdownContainer}>
                <Text variant="bodyMedium" style={[styles.dropdownLabel, { color: theme.colors.onSurface }]}>
                  Service Type *
                </Text>
                <Menu
                  visible={serviceTypeMenuVisible}
                  onDismiss={() => setServiceTypeMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setServiceTypeMenuVisible(true)}
                      style={styles.dropdownButton}
                      contentStyle={styles.dropdownButtonContent}
                      disabled={filteredServices.length === 0}
                    >
                      {selectedServiceType ? selectedServiceType.title : 'Select Service Type'}
                    </Button>
                  }
                >
                  {filteredServices.length === 0 ? (
                    <Menu.Item
                      onPress={() => setServiceTypeMenuVisible(false)}
                      title="No services available"
                      disabled
                    />
                  ) : (
                    filteredServices.map((service) => (
                      <Menu.Item
                        key={service.id}
                        onPress={() => {
                          setSelectedServiceType(service);
                          setServiceTypeMenuVisible(false);
                        }}
                        title={service.title}
                      />
                    ))
                  )}
                </Menu>
              </View>
            )}

            {/* Service Variant Dropdown */}
            {selectedServiceType && (
              <View style={styles.dropdownContainer}>
                <Text variant="bodyMedium" style={[styles.dropdownLabel, { color: theme.colors.onSurface }]}>
                  Service Variant *
                </Text>
                <Menu
                  visible={variantMenuVisible}
                  onDismiss={() => setVariantMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setVariantMenuVisible(true)}
                      style={styles.dropdownButton}
                      contentStyle={styles.dropdownButtonContent}
                      disabled={loadingVariants || serviceVariants.length === 0}
                      loading={loadingVariants}
                    >
                      {loadingVariants
                        ? 'Loading variants...'
                        : selectedServiceVariant
                        ? selectedServiceVariant.title
                        : serviceVariants.length === 0
                        ? 'No variants available'
                        : 'Select Service Variant'}
                    </Button>
                  }
                >
                  {serviceVariants.length === 0 ? (
                    <Menu.Item
                      onPress={() => setVariantMenuVisible(false)}
                      title={loadingVariants ? 'Loading...' : 'No variants available'}
                      disabled
                    />
                  ) : (
                    serviceVariants.map((variant) => (
                      <Menu.Item
                        key={variant.id}
                        onPress={() => {
                          setSelectedServiceVariant(variant);
                          setVariantMenuVisible(false);
                        }}
                        title={variant.title}
                      />
                    ))
                  )}
                </Menu>
              </View>
            )}

            {/* Service Variant Details and Configuration */}
            {selectedServiceVariant && (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface, marginTop: 16 }]}>
                <Card.Content>
                  <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    {selectedServiceVariant.title}
                  </Text>
                  {selectedServiceVariant.description && (
                    <Text variant="bodyMedium" style={[styles.variantDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {selectedServiceVariant.description}
                    </Text>
                  )}
                  <Divider style={styles.divider} />

                  {/* Quantity Input for Fixed Pricing */}
                  {effectivePricingType === 'fixed' && !isHouseMovingService && (
                    <View style={styles.quantityInputContainer}>
                      <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                        Quantity:
                      </Text>
            <TextInput
              mode="outlined"
                        value={variantQuantity}
                        onChangeText={handleQuantityChange}
                        placeholder="Enter quantity"
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={
                          variantQuantity !== '' ? (
                            isNaN(parseFloat(variantQuantity)) ||
                            parseFloat(variantQuantity) <= 0
                          ) : false
                        }
                      />
                    </View>
                  )}

                  {/* Measurement Input for Per-Unit Pricing */}
                  {effectivePricingType === 'per_unit' && (
                    <View style={styles.measurementInputContainer}>
                      <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                        {selectedServiceVariant.unitMeasure || 'Measurement'}:
                      </Text>
            <TextInput
                        mode="outlined"
                        value={variantMeasurement}
                        onChangeText={handleMeasurementChange}
                        placeholder={selectedServiceVariant.measurementPlaceholder || `Enter ${selectedServiceVariant.unitMeasure || 'measurement'}`}
                        keyboardType="decimal-pad"
              style={styles.input}
                        error={
                          variantMeasurement !== '' ? (
                            isNaN(parseFloat(variantMeasurement)) ||
                            parseFloat(variantMeasurement) <= 0 ||
                            (selectedServiceVariant.minMeasurement !== undefined && parseFloat(variantMeasurement) < selectedServiceVariant.minMeasurement) ||
                            (selectedServiceVariant.maxMeasurement !== undefined && parseFloat(variantMeasurement) > selectedServiceVariant.maxMeasurement)
                          ) : false
                        }
                      />
                      <View style={styles.measurementInfoContainer}>
                        {selectedServiceVariant.unitMeasure && (
                          <Text variant="bodySmall" style={[styles.unitMeasureText, { color: theme.colors.onSurfaceVariant }]}>
                            Unit: {selectedServiceVariant.unitMeasure}
                          </Text>
                        )}
                        {selectedServiceVariant.minMeasurement && (
                          <Text variant="bodySmall" style={[styles.minMeasurementText, { color: theme.colors.primary }]}>
                            Minimum: {selectedServiceVariant.minMeasurement} {selectedServiceVariant.unitMeasure || 'units'}
                          </Text>
                        )}
                        {selectedServiceVariant.maxMeasurement && (
                          <Text variant="bodySmall" style={[styles.maxMeasurementText, { color: theme.colors.onSurfaceVariant }]}>
                            Maximum: {selectedServiceVariant.maxMeasurement} {selectedServiceVariant.unitMeasure || 'units'}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Distance and Boxes Input for House Moving Services */}
                  {isHouseMovingService && selectedServiceVariant && (
                    <View style={styles.movingInputContainer}>
                      <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                        Distance (km) *:
                      </Text>
                      <TextInput
              mode="outlined"
                        value={distance}
                        onChangeText={handleDistanceChange}
                        placeholder="Enter distance in kilometers"
                        keyboardType="decimal-pad"
                        style={styles.input}
                        error={distance !== '' && (isNaN(parseFloat(distance)) || parseFloat(distance) <= 0)}
                      />
                      
                      <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface, marginTop: 16 }]}>
                        Number of Boxes (Optional):
              </Text>
                      <TextInput
                        mode="outlined"
                        value={numberOfBoxes}
                        onChangeText={handleBoxesChange}
                        placeholder="Enter number of boxes"
                        keyboardType="number-pad"
                        style={styles.input}
                        error={numberOfBoxes !== '' && (isNaN(parseInt(numberOfBoxes)) || parseInt(numberOfBoxes) < 0)}
              />
            </View>
                  )}

                  {/* Price Calculation Display */}
                  <View style={styles.priceCalculationContainer}>
                    {/* Calculation details for per-unit pricing */}
                    {effectivePricingType === 'per_unit' && variantMeasurement && parseFloat(variantMeasurement) > 0 && (
                      <View style={styles.calculationDetails}>
                        <Text variant="bodyMedium" style={[styles.calculationText, { color: theme.colors.onSurfaceVariant }]}>
                          {variantMeasurement} {selectedServiceVariant.unitMeasure || 'units'} × €{selectedServiceVariant.unitPrice || selectedServiceVariant.price}/{selectedServiceVariant.unitMeasure || 'unit'} = €{calculateTotalPrice().toFixed(2)}
                        </Text>
                      </View>
                    )}

                    {/* Calculation details for fixed pricing with quantity > 1 */}
                    {effectivePricingType === 'fixed' && parseFloat(variantQuantity || '1') > 1 && !isHouseMovingService && (
                      <View style={styles.calculationDetails}>
                        <Text variant="bodyMedium" style={[styles.calculationText, { color: theme.colors.onSurfaceVariant }]}>
                          Quantity: {variantQuantity} × €{selectedServiceVariant.price} = €{calculateTotalPrice().toFixed(2)}
                        </Text>
                      </View>
                    )}

                    {/* Cost breakdown for house moving services */}
                    {isHouseMovingService && distance && parseFloat(distance) > 0 && (
                      <View style={styles.movingCalculationContainer}>
                        {(() => {
                          const area = effectivePricingType === 'per_unit' 
                            ? parseFloat(variantMeasurement || '0')
                            : parseFloat(variantQuantity || '1');
                          const distanceValue = parseFloat(distance);
                          const boxesValue = parseFloat(numberOfBoxes) || 0;
                          const rate = effectivePricingType === 'per_unit' 
                            ? (selectedServiceVariant.unitPrice || selectedServiceVariant.price || 0)
                            : (selectedServiceVariant.price || 0);
                          const movingCost = calculateHouseMovingCost(area, distanceValue, rate, boxesValue);
                          
                          return (
                            <View style={styles.calculationDetails}>
                              <Text variant="titleSmall" style={[styles.calculationTitle, { color: theme.colors.onSurface }]}>
                                Cost Breakdown:
                              </Text>
                              <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                Area: {area} sqm × €{rate.toFixed(2)}/sqm = €{movingCost.areaCost.toFixed(2)}
                              </Text>
                              <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                Distance: {distanceValue}km × €0.5/km = €{movingCost.distanceCost.toFixed(2)}
                              </Text>
                              {boxesValue > 0 && (
                                <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                  Boxes: {boxesValue} × €{movingCost.boxPrice.toFixed(2)} = €{movingCost.boxesCost.toFixed(2)}
                                </Text>
                              )}
                              <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                Subtotal: €{movingCost.areaCost.toFixed(2)} + €{movingCost.distanceCost.toFixed(2)}{boxesValue > 0 ? ` + €${movingCost.boxesCost.toFixed(2)}` : ''} = €{movingCost.subtotal.toFixed(2)}
                              </Text>
                              <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                VAT (19%): €{movingCost.vat.toFixed(2)}
                              </Text>
                            </View>
                          );
                        })()}
                      </View>
                    )}

                    {/* Total Price Display */}
                    <View style={styles.totalPriceContainer}>
                      <Text variant="titleMedium" style={[styles.totalPriceLabel, { color: theme.colors.primary }]}>
                        Total Price: €{calculateTotalPrice().toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

            {/* Date Selection - Only show multi-day selector for weekly cleaning, single date/time for others */}
            {isWeeklyCleaningService ? (
              <>
                {/* Multi-day booking info for weekly cleaning (always enabled) */}
                <View style={styles.multiDayInfoContainer}>
                  <Text variant="bodyMedium" style={[styles.multiDayInfoText, { color: theme.colors.primary }]}>
                    Weekly Cleaning Service - Multiple Days Required
                  </Text>
                </View>
              <MultiDateSelector
                selectedDates={selectedDates}
                onDatesChange={setSelectedDates}
                serviceTime={serviceTime}
                onTimeChange={setServiceTime}
                maxDays={7}
                  t={(key: string) => key}
              />
              </>
            ) : (
              <>
                <View style={styles.dateTimeContainer}>
                  <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                    Service Date *
                  </Text>
                  <Button
                  mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                    style={styles.dateTimeButton}
                    contentStyle={styles.dateTimeButtonContent}
                    icon="calendar"
                  >
                    {date ? formatDisplayDate(selectedDate) : 'Select Date'}
                  </Button>
                </View>
                
                <View style={styles.dateTimeContainer}>
                  <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                    Service Time *
                  </Text>
                  <Button
                  mode="outlined"
                    onPress={() => setShowTimePicker(true)}
                    style={styles.dateTimeButton}
                    contentStyle={styles.dateTimeButtonContent}
                    icon="clock-outline"
                  >
                    {time ? formatDisplayTime(selectedTime) : 'Select Time'}
                  </Button>
                </View>

                {/* Date Picker Modal */}
                {showDatePicker && (
                  <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                    <View style={styles.modalOverlay}>
                      <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.pickerContainer}>
                          <Text variant="titleMedium" style={[styles.pickerTitle, { color: theme.colors.onSurface }]}>
                            Select Date
                          </Text>
                          <DateTimePicker
                            value={selectedDate}
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
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                )}

                {/* Time Picker Modal */}
                {showTimePicker && (
                  <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
                    <View style={styles.modalOverlay}>
                      <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.pickerContainer}>
                          <Text variant="titleMedium" style={[styles.pickerTitle, { color: theme.colors.onSurface }]}>
                            Select Time
                          </Text>
                          <DateTimePicker
                            value={selectedTime}
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
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                )}
              </>
            )}
            
            <TextInput
              label="Service Address *"
              value={serviceAddress}
              onChangeText={setServiceAddress}
              style={styles.input}
              mode="outlined"
              placeholder="Enter service address (e.g., 123 Main St, Berlin, 10115, Germany)"
              multiline
              numberOfLines={2}
            />
            
            <TextInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Card.Content>
        </Card>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleCreateBooking}
            style={styles.actionButton}
            loading={isCreating}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Booking'}
          </Button>
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
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  input: {
    marginBottom: 16,
  },
  multiDayInfoContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  multiDayInfoText: {
    fontWeight: '500',
    textAlign: 'center',
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
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdownButton: {
    width: '100%',
  },
  dropdownButtonContent: {
    justifyContent: 'space-between',
  },
  customerMenuContent: {
    width: '90%',
    maxHeight: 400,
  },
  customerSearchContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  customerSearchBar: {
    elevation: 0,
  },
  customerListScroll: {
    maxHeight: 300,
  },
  emptyCustomerContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyCustomerText: {
    fontSize: 14,
  },
  customerMenuItemTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  variantDescription: {
    marginTop: 8,
    marginBottom: 8,
  },
  quantityInputContainer: {
    marginBottom: 16,
  },
  measurementInputContainer: {
    marginBottom: 16,
  },
  measurementInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  unitMeasureText: {
    fontSize: 12,
  },
  minMeasurementText: {
    fontSize: 12,
    fontWeight: '500',
  },
  maxMeasurementText: {
    fontSize: 12,
  },
  movingInputContainer: {
    marginBottom: 16,
  },
  priceCalculationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  calculationDetails: {
    marginBottom: 12,
  },
  calculationText: {
    fontSize: 14,
  },
  calculationTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  calculationLine: {
    fontSize: 14,
    marginBottom: 4,
  },
  movingCalculationContainer: {
    marginTop: 8,
  },
  totalPriceContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalPriceLabel: {
    fontWeight: '700',
    fontSize: 18,
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateTimeButton: {
    width: '100%',
  },
  dateTimeButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  pickerButton: {
    minWidth: 80,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});