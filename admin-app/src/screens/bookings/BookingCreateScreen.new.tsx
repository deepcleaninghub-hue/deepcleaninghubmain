/**
 * Booking Create Screen - New Improved Version
 * Features:
 * - Modern, clean UI design
 * - Better visual hierarchy
 * - Improved user experience
 * - Same functionality as before
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider, Surface, Chip, IconButton } from 'react-native-paper';
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
  const { categories } = useServiceCategories();
  const { } = useCustomers(); // Components now load their own data via cache
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

  const handleBackNavigation = () => {
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
  };

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

  // Progress indicator
  const getProgressSteps = () => {
    const steps = [
      { label: 'Customer', completed: !!selectedCustomer },
      { label: 'Service', completed: !!selectedServiceVariant },
      { label: 'Date & Time', completed: isWeeklyCleaningService ? selectedDates.length > 0 : !!(date && time) },
      { label: 'Address', completed: !!serviceAddress.trim() },
    ];
    return steps;
  };

  const progressSteps = getProgressSteps();
  const completedSteps = progressSteps.filter(s => s.completed).length;
  const progressPercentage = (completedSteps / progressSteps.length) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <Surface style={[styles.header, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={handleBackNavigation}
              iconColor={theme.colors.onSurface}
            />
            <View style={styles.headerTextContainer}>
              <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
                Create Booking
              </Text>
              <Text variant="bodySmall" style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                {completedSteps} of {progressSteps.length} steps completed
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </Surface>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Steps */}
          <View style={styles.progressStepsContainer}>
            {progressSteps.map((step, index) => (
              <View key={step.label} style={styles.progressStep}>
                <Chip
                  icon={step.completed ? 'check-circle' : 'circle-outline'}
                  selected={step.completed}
                  style={[
                    styles.progressChip,
                    step.completed && { backgroundColor: theme.colors.primaryContainer },
                  ]}
                  textStyle={[
                    styles.progressChipText,
                    step.completed && { color: theme.colors.onPrimaryContainer },
                  ]}
                >
                  {step.label}
                </Chip>
                {index < progressSteps.length - 1 && (
                  <View
                    style={[
                      styles.progressConnector,
                      {
                        backgroundColor: step.completed
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Customer Selection Section */}
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Customer Information
                </Text>
                {selectedCustomer && (
                  <Chip icon="check" style={{ backgroundColor: theme.colors.primaryContainer }}>
                    Selected
                  </Chip>
                )}
              </View>
              <Divider style={styles.divider} />
              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
              />
            </Card.Content>
          </Card>

          {/* Service Selection Section */}
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Service Details
                </Text>
                {selectedServiceVariant && (
                  <Chip icon="check" style={{ backgroundColor: theme.colors.primaryContainer }}>
                    Selected
                  </Chip>
                )}
              </View>
              <Divider style={styles.divider} />
              
              <ServiceCategorySelector
                selectedCategoryId={selectedServiceCategory}
                onSelectCategory={setSelectedServiceCategory}
              />
              
              {selectedServiceCategory && categoryName && (
                <ServiceTypeSelector
                  selectedService={selectedServiceType}
                  onSelectService={setSelectedServiceType}
                  categoryName={categoryName}
                />
              )}

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
            </Card.Content>
          </Card>

          {/* Date and Time Section */}
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Schedule
                </Text>
                {(isWeeklyCleaningService ? selectedDates.length > 0 : !!(date && time)) && (
                  <Chip icon="check" style={{ backgroundColor: theme.colors.primaryContainer }}>
                    Selected
                  </Chip>
                )}
              </View>
              <Divider style={styles.divider} />
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
            </Card.Content>
          </Card>

          {/* Address and Notes Section */}
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Additional Information
                </Text>
                {serviceAddress.trim() && (
                  <Chip icon="check" style={{ backgroundColor: theme.colors.primaryContainer }}>
                    Added
                  </Chip>
                )}
              </View>
              <Divider style={styles.divider} />
              
              <TextInput
                label="Service Address *"
                value={serviceAddress}
                onChangeText={setServiceAddress}
                style={styles.input}
                mode="outlined"
                placeholder="Enter service address (e.g., 123 Main St, Berlin, 10115, Germany)"
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="map-marker" />}
              />
              
              <TextInput
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                style={styles.input}
                mode="outlined"
                placeholder="Add any special instructions or notes..."
                multiline
                numberOfLines={4}
                left={<TextInput.Icon icon="note-text" />}
              />
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleBackNavigation}
              style={[styles.actionButton, styles.cancelButton]}
              icon="close"
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateBooking}
              style={[styles.actionButton, styles.createButton]}
              loading={isCreating}
              disabled={isCreating}
              icon="check"
            >
              {isCreating ? 'Creating...' : 'Create Booking'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 22,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  progressBarContainer: {
    height: 4,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  progressStepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
  },
  progressChip: {
    height: 32,
  },
  progressChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressConnector: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    zIndex: -1,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
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
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  createButton: {
    elevation: 2,
  },
});

