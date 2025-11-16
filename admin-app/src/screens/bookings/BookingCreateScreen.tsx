import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider, Switch, Menu, Searchbar, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiDateSelector from '../../../../shared/src/components/MultiDateSelector';
import { BookingDate } from '../../../../shared/src/types';
import { useAdminData } from '@/contexts/AdminDataContext';
import { adminDataService } from '@/services/adminDataService';
import { AdminService, AdminBooking } from '@/types';

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

export function BookingCreateScreen({ navigation }: any) {
  const theme = useTheme();
  const { services } = useAdminData();
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
  const [variantQuantity, setVariantQuantity] = useState(1);
  const [variantMeasurement, setVariantMeasurement] = useState('');
  const [distance, setDistance] = useState('');
  const [numberOfBoxes, setNumberOfBoxes] = useState('');
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  
  // Multi-day booking state
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDates, setSelectedDates] = useState<BookingDate[]>([]);
  const [serviceTime, setServiceTime] = useState(new Date());

  // Check if this is a house moving service
  const isHouseMovingService = selectedServiceType?.title?.toLowerCase().includes('moving') || 
                               selectedServiceType?.title?.toLowerCase().includes('house') ||
                               selectedServiceCategory === 'moving';

  // Reset variant configuration when variant changes
  useEffect(() => {
    if (selectedServiceVariant) {
      setVariantQuantity(1);
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
      const area = selectedServiceVariant.pricingType === 'per_unit' 
        ? parseFloat(variantMeasurement || '0')
        : variantQuantity;
      const distanceValue = parseFloat(distance) || 0;
      const boxesValue = parseFloat(numberOfBoxes) || 0;
      const rate = selectedServiceVariant.pricingType === 'per_unit' 
        ? (selectedServiceVariant.unitPrice || selectedServiceVariant.price || 0)
        : (selectedServiceVariant.price || 0);
      
      const movingCost = calculateHouseMovingCost(area, distanceValue, rate, boxesValue);
      return movingCost.total;
    }

    if (selectedServiceVariant.pricingType === 'per_unit') {
      const measurement = parseFloat(variantMeasurement || '0');
      return measurement * (selectedServiceVariant.unitPrice || selectedServiceVariant.price || 0);
    }
    
    // Fixed pricing - multiply by quantity
    return (selectedServiceVariant.price || 0) * variantQuantity;
  };

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
        const customerId = booking.user_id || booking.customer_email || 'unknown';
        
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
          id,
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
    
    if (isMultiDay && selectedDates.length === 0) {
      Alert.alert('Error', 'Please select at least one service date');
      return;
    }
    
    if (!isMultiDay && (!date || !time)) {
      Alert.alert('Error', 'Please select service date and time');
      return;
    }

    try {
      // In a real app, you would call the API here
      // Use selectedServiceVariant.id as service_variant_id
      Alert.alert('Success', 'Booking created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking');
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
                  {selectedServiceVariant.pricingType === 'fixed' && !isHouseMovingService && (
                    <View style={styles.quantityInputContainer}>
                      <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                        Quantity:
                      </Text>
                      <View style={styles.quantityControls}>
                        <Button
                          mode="outlined"
                          onPress={() => setVariantQuantity(Math.max(1, variantQuantity - 1))}
                          style={styles.quantityButton}
                          compact
                        >
                          -
                        </Button>
                        <Text variant="titleMedium" style={[styles.quantityText, { color: theme.colors.onSurface }]}>
                          {variantQuantity}
                        </Text>
                        <Button
                          mode="outlined"
                          onPress={() => setVariantQuantity(variantQuantity + 1)}
                          style={styles.quantityButton}
                          compact
                        >
                          +
                        </Button>
                      </View>
                    </View>
                  )}

                  {/* Measurement Input for Per-Unit Pricing */}
                  {selectedServiceVariant.pricingType === 'per_unit' && (
                    <View style={styles.measurementInputContainer}>
                      <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                        {selectedServiceVariant.unitMeasure || 'Measurement'}:
                      </Text>
                      <TextInput
                        mode="outlined"
                        value={variantMeasurement}
                        onChangeText={setVariantMeasurement}
                        placeholder={selectedServiceVariant.measurementPlaceholder || `Enter ${selectedServiceVariant.unitMeasure || 'measurement'}`}
                        keyboardType="numeric"
                        style={styles.input}
                        error={
                          variantMeasurement !== '' ? (
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
                        onChangeText={setDistance}
                        placeholder="Enter distance in kilometers"
                        keyboardType="numeric"
                        style={styles.input}
                        error={distance !== '' && parseFloat(distance) <= 0}
                      />
                      
                      <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface, marginTop: 16 }]}>
                        Number of Boxes (Optional):
                      </Text>
                      <TextInput
                        mode="outlined"
                        value={numberOfBoxes}
                        onChangeText={setNumberOfBoxes}
                        placeholder="Enter number of boxes"
                        keyboardType="numeric"
                        style={styles.input}
                        error={numberOfBoxes !== '' && parseFloat(numberOfBoxes) < 0}
                      />
                    </View>
                  )}

                  {/* Price Calculation Display */}
                  <View style={styles.priceCalculationContainer}>
                    {/* Calculation details for per-unit pricing */}
                    {selectedServiceVariant.pricingType === 'per_unit' && variantMeasurement && parseFloat(variantMeasurement) > 0 && (
                      <View style={styles.calculationDetails}>
                        <Text variant="bodyMedium" style={[styles.calculationText, { color: theme.colors.onSurfaceVariant }]}>
                          {variantMeasurement} {selectedServiceVariant.unitMeasure || 'units'} × €{selectedServiceVariant.unitPrice || selectedServiceVariant.price}/{selectedServiceVariant.unitMeasure || 'unit'} = €{calculateTotalPrice().toFixed(2)}
                        </Text>
                      </View>
                    )}

                    {/* Calculation details for fixed pricing with quantity > 1 */}
                    {selectedServiceVariant.pricingType === 'fixed' && variantQuantity > 1 && !isHouseMovingService && (
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
                          const area = selectedServiceVariant.pricingType === 'per_unit' 
                            ? parseFloat(variantMeasurement || '0')
                            : variantQuantity;
                          const distanceValue = parseFloat(distance);
                          const boxesValue = parseFloat(numberOfBoxes) || 0;
                          const rate = selectedServiceVariant.pricingType === 'per_unit' 
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
            
            {/* Multi-day booking toggle */}
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
            
            {isMultiDay ? (
              <MultiDateSelector
                selectedDates={selectedDates}
                onDatesChange={setSelectedDates}
                serviceTime={serviceTime}
                onTimeChange={setServiceTime}
                maxDays={7}
                t={(key: string) => key}
              />
            ) : (
              <>
                <TextInput
                  label="Date (YYYY-MM-DD) *"
                  value={date}
                  onChangeText={setDate}
                  style={styles.input}
                  mode="outlined"
                  placeholder="2024-01-15"
                />
                
                <TextInput
                  label="Time (HH:MM) *"
                  value={time}
                  onChangeText={setTime}
                  style={styles.input}
                  mode="outlined"
                  placeholder="14:30"
                />
              </>
            )}
            
            <TextInput
              label="Priority"
              value={priority}
              onChangeText={setPriority}
              style={styles.input}
              mode="outlined"
              placeholder="low, medium, high, urgent"
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
          >
            Create Booking
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
  multiDayToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
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
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 16,
  },
  quantityButton: {
    minWidth: 50,
  },
  quantityText: {
    minWidth: 40,
    textAlign: 'center',
    fontWeight: '600',
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
});