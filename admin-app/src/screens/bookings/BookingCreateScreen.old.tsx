/**
 * Booking Create Screen - Refactored
 * Uses hooks and sub-components for better maintainability and testability
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminDataService } from '@/services/adminDataService';
import { buildBookingData } from './utils/bookingDataBuilder';
import { useServiceCategories } from './hooks/useServiceCategories';
import { useCustomers } from './hooks/useCustomers';
import { useBookingForm } from './hooks/useBookingForm';
import { CustomerSelector } from './components/CustomerSelector.new';
import { ServiceCategorySelector } from './components/ServiceCategorySelector.new';
import { ServiceTypeSelector } from './components/ServiceTypeSelector.new';
import { ServiceVariantSelector } from './components/ServiceVariantSelector.new';
import { ServiceVariant } from '@/services/dataCache';
import { VariantConfiguration } from './components/VariantConfiguration';
import { DateTimeSelector } from './components/DateTimeSelector';
import { validateServiceAddress } from './utils/validations';

export function BookingCreateScreen({ navigation }: any) {
  const theme = useTheme();
  const { signOut } = useAdminAuth();
  const nav = useNavigation<any>();
  const [isCreating, setIsCreating] = useState(false);
  
  // Track if we came from Dashboard
  const [cameFromDashboard, setCameFromDashboard] = useState(false);
  
  useEffect(() => {
    // Check navigation state to see if we came from Dashboard
    const state = nav.getState();
    const routes = state?.routes || [];
    const bookingsRouteIndex = routes.findIndex((r: any) => r.name === 'Bookings');
    
    if (bookingsRouteIndex >= 0) {
      const bookingsRoute = routes[bookingsRouteIndex];
      const bookingsState = bookingsRoute?.state;
      const bookingsRoutes = bookingsState?.routes || [];
      
      // If BookingCreate is the only route in Bookings stack (meaning we came from outside like Dashboard), mark it
      if (bookingsRoutes.length === 1 && bookingsRoutes[0]?.name === 'BookingCreate') {
        setCameFromDashboard(true);
    }
    }
  }, [nav]);

  // Hooks
  const { categories, loading: loadingCategories } = useServiceCategories();
  const { customers, loading: loadingCustomers, loadCustomers } = useCustomers();
  const {
    selectedCustomer,
    setSelectedCustomer,
    selectedServiceCategory,
    setSelectedServiceCategory,
    selectedServiceType,
    setSelectedServiceType,
    selectedServiceVariant,
    setSelectedServiceVariant,
    variantQuantity,
    setVariantQuantity,
    variantMeasurement,
    setVariantMeasurement,
    distance,
    setDistance,
    numberOfBoxes,
    setNumberOfBoxes,
    selectedDate,
    selectedTime,
    date,
    time,
    selectedDates,
    setSelectedDates,
    serviceTime,
    setServiceTime,
    handleDateChange,
    handleTimeChange,
    serviceAddress,
    setServiceAddress,
    notes,
    setNotes,
    isHouseMovingService,
    isWeeklyCleaningService,
  } = useBookingForm();

  // Get category name for display
  const selectedCategory = categories.find((cat) => cat.id === selectedServiceCategory);
  const categoryName = selectedCategory?.category;

  // Reset selections when category changes (services/variants are now loaded by components)
  React.useEffect(() => {
    if (selectedServiceCategory) {
      setSelectedServiceType(null);
      setSelectedServiceVariant(null);
    }
  }, [selectedServiceCategory, setSelectedServiceType, setSelectedServiceVariant]);

  const handleCreateBooking = async () => {
    // Validation
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

    const addressValidation = validateServiceAddress(serviceAddress);
    if (!addressValidation.isValid) {
      Alert.alert('Error', addressValidation.error || 'Please enter service address');
      return;
    }

    setIsCreating(true);

    try {
      // Validate customer ID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(selectedCustomer.id)) {
        Alert.alert(
          'Invalid Customer',
          'The selected customer does not have a valid user ID. Please select a different customer or ensure the customer has a valid account.'
        );
        setIsCreating(false);
        return;
      }

      // Build booking data
      const bookingData = buildBookingData({
        customer: {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          ...(selectedCustomer.phone && { phone: selectedCustomer.phone }),
        },
        service: {
          id: selectedServiceType.id,
          title: selectedServiceType.title,
          category: selectedCategory?.category || selectedServiceCategory,
        },
        variant: selectedServiceVariant as ServiceVariant,
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

      console.log('Booking Data:', JSON.stringify(bookingData, null, 2));

      // Create booking
      const response = await adminDataService.createBooking(bookingData);

      if (response.success) {
        Alert.alert('Success', 'Booking created successfully', [
          {
            text: 'OK',
            onPress: () => {
              if (cameFromDashboard) {
                // If we came from Dashboard, reset the Bookings stack to BookingList
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Bookings',
                        state: {
                          routes: [{ name: 'BookingList' }],
                          index: 0,
                        },
                      },
                    ],
                  })
                );
                // Navigate back to Dashboard
                navigation.navigate('Dashboard');
        } else {
                navigation.goBack();
              }
            },
          },
        ]);
      } else {
        const errorMessage = response.error || 'Failed to create booking';
        handleBookingError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create booking';
      handleBookingError(errorMessage, error?.response?.status);
    } finally {
      setIsCreating(false);
    }
  };

  const handleBookingError = (errorMessage: string, statusCode?: number) => {
      if (statusCode === 401 || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('token')) {
      Alert.alert('Session Expired', 'Your session has expired. Please log in again to continue.', [
            {
              text: 'OK',
              onPress: async () => {
                await signOut();
                navigation.navigate('Login');
              },
            },
      ]);
      } else {
      Alert.alert('Error', `Failed to create booking:\n\n${errorMessage}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => {
            if (cameFromDashboard) {
              // If we came from Dashboard, reset the Bookings stack to BookingList and navigate to Bookings tab
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Bookings',
                      state: {
                        routes: [{ name: 'BookingList' }],
                        index: 0,
                      },
                    },
                  ],
                })
              );
              // Navigate to Bookings tab
              navigation.navigate('Bookings', { screen: 'BookingList' });
            } else {
              navigation.goBack();
            }
          }} 
          icon="arrow-left"
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Create Booking
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Booking Information
            </Text>
            <Divider style={styles.divider} />
            
            {/* Customer Selection */}
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
            />

            {/* Service Category Selection */}
            <ServiceCategorySelector
              selectedCategoryId={selectedServiceCategory}
              onSelectCategory={setSelectedServiceCategory}
            />
            
            {/* Service Type Selection */}
            {selectedServiceCategory && categoryName && (
              <ServiceTypeSelector
                selectedService={selectedServiceType}
                onSelectService={setSelectedServiceType}
                categoryName={categoryName}
              />
            )}

            {/* Service Variant Selection */}
            {selectedServiceType && (
              <ServiceVariantSelector
                selectedVariant={selectedServiceVariant}
                onSelectVariant={setSelectedServiceVariant}
                serviceId={selectedServiceType.id}
              />
            )}

            {/* Variant Configuration */}
            {selectedServiceVariant && (
              <VariantConfiguration
                variant={selectedServiceVariant}
                quantity={variantQuantity}
                measurement={variantMeasurement}
                distance={distance}
                numberOfBoxes={numberOfBoxes}
                onQuantityChange={setVariantQuantity}
                onMeasurementChange={setVariantMeasurement}
                onDistanceChange={setDistance}
                onBoxesChange={setNumberOfBoxes}
                isHouseMoving={isHouseMovingService}
              />
                    )}

            {/* Date and Time Selection */}
            <DateTimeSelector
              date={date}
              time={time}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
                selectedDates={selectedDates}
                serviceTime={serviceTime}
              isWeeklyCleaning={isWeeklyCleaningService}
              onDateChange={handleDateChange}
              onTimeChange={handleTimeChange}
              onDatesChange={setSelectedDates}
              onServiceTimeChange={setServiceTime}
            />

            {/* Service Address */}
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
            
            {/* Notes */}
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => {
              if (cameFromDashboard) {
                // If we came from Dashboard, reset the Bookings stack to BookingList
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Bookings',
                        state: {
                          routes: [{ name: 'BookingList' }],
                          index: 0,
                        },
                      },
                    ],
                  })
                );
                // Navigate back to Dashboard
                navigation.navigate('Dashboard');
              } else {
                navigation.goBack();
              }
            }} 
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
});

