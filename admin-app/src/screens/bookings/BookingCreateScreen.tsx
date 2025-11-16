import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider, Switch, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiDateSelector from '../../../../shared/src/components/MultiDateSelector';
import { BookingDate } from '../../../../shared/src/types';
import { useAdminData } from '@/contexts/AdminDataContext';
import { adminDataService } from '@/services/adminDataService';
import { AdminService } from '@/types';

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
  duration?: number;
  is_active?: boolean;
  display_order?: number;
};

export function BookingCreateScreen({ navigation }: any) {
  const theme = useTheme();
  const { services } = useAdminData();
  const [customerId, setCustomerId] = useState('');
  
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
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  
  // Multi-day booking state
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDates, setSelectedDates] = useState<BookingDate[]>([]);
  const [serviceTime, setServiceTime] = useState(new Date());

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
    if (!customerId) {
      Alert.alert('Error', 'Please enter customer ID');
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
            
            <TextInput
              label="Customer ID *"
              value={customerId}
              onChangeText={setCustomerId}
              style={styles.input}
              mode="outlined"
            />
            
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
});