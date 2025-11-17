/**
 * Service Create Modal Component
 * Modal for creating a new service with category and service type dropdowns
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Modal, TextInput, Button, useTheme, Portal, Menu, SegmentedButtons } from 'react-native-paper';
import { adminDataService } from '@/services/adminDataService';
import { validateServiceData, buildServiceData, ServiceFormData } from '../utils/serviceOperations';
import { useServiceCategories } from '../hooks/useServiceCategories';
import { useServices } from '../hooks/useServices';
import { useServiceVariants } from '../hooks/useServiceVariants';
import { ServiceVariantCreateModal } from './ServiceVariantCreateModal';
import { AdminService } from '@/types';

interface ServiceCreateModalProps {
  visible: boolean;
  category?: string;
  onDismiss: () => void;
  onSuccess: () => void;
}

const CREATE_NEW_SERVICE_OPTION = 'CREATE_NEW_SERVICE';
const ADD_NEW_VARIANT_OPTION = 'ADD_NEW_VARIANT';

export function ServiceCreateModal({ visible, category: initialCategory, onDismiss, onSuccess }: ServiceCreateModalProps) {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [serviceTypeMenuVisible, setServiceTypeMenuVisible] = useState(false);
  const [variantMenuVisible, setVariantMenuVisible] = useState(false);
  const [variantCreateModalVisible, setVariantCreateModalVisible] = useState(false);
  
  const { categories, loading: categoriesLoading } = useServiceCategories();
  
  // Find the category ID from the initial category name
  const initialCategoryObj = categories.find(
    c => c.category === initialCategory || c.id === initialCategory || c.title === initialCategory
  );
  const categoryNameForServices = initialCategoryObj?.category || 
    (selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.category : undefined);
  
  const { services, loading: servicesLoading } = useServices(categoryNameForServices);
  
  // Fetch variants when an existing service is selected (not CREATE_NEW_SERVICE_OPTION)
  const selectedServiceForVariants = selectedServiceId && selectedServiceId !== CREATE_NEW_SERVICE_OPTION 
    ? selectedServiceId 
    : null;
  const { variants, loading: variantsLoading, refreshVariants } = useServiceVariants(selectedServiceForVariants);

  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    pricingType: 'fixed',
    price: '',
    unitMeasure: '',
    displayOrder: '0',
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Update formData.category when selectedCategoryId changes
  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category) {
        setFormData(prev => ({ ...prev, category: category.category }));
      }
    }
  }, [selectedCategoryId, categories]);

  // Set initial category if provided
  useEffect(() => {
    if (initialCategory && categories.length > 0) {
      const category = categories.find(
        c => c.category === initialCategory || c.id === initialCategory || c.title === initialCategory
      );
      if (category) {
        // Only update if not already set to avoid infinite loops
        if (selectedCategoryId !== category.id) {
          setSelectedCategoryId(category.id);
          setFormData(prev => ({ ...prev, category: category.category }));
        }
      }
    } else if (!initialCategory && selectedCategoryId) {
      // Reset if initialCategory is removed
      setSelectedCategoryId('');
      setFormData(prev => ({ ...prev, category: '' }));
    }
  }, [initialCategory, categories.length]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedServiceId(null); // Reset service selection when category changes
    setCategoryMenuVisible(false);
  };

  const handleServiceTypeSelect = (serviceId: string) => {
    if (serviceId === CREATE_NEW_SERVICE_OPTION) {
      setSelectedServiceId(CREATE_NEW_SERVICE_OPTION);
      setSelectedVariantId(null); // Reset variant when switching to create new service
    } else {
      setSelectedServiceId(serviceId);
      setSelectedVariantId(null); // Reset variant when service changes
    }
    setServiceTypeMenuVisible(false);
  };

  const handleVariantSelect = (variantId: string) => {
    if (variantId === ADD_NEW_VARIANT_OPTION) {
      setVariantCreateModalVisible(true);
    } else {
      setSelectedVariantId(variantId);
      // Could show variant details or allow editing here
    }
    setVariantMenuVisible(false);
  };

  const handleVariantCreated = () => {
    refreshVariants();
    setVariantCreateModalVisible(false);
    onSuccess(); // Refresh the parent component
  };

  const handleSave = async () => {
    // Only allow saving if "Create New Service" is selected
    if (selectedServiceId !== CREATE_NEW_SERVICE_OPTION) {
      Alert.alert('Info', 'Please select "Create New Service" to create a new service');
      return;
    }

    // Validate form data
    const validation = validateServiceData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      // Build service data
      const serviceData = buildServiceData(formData);

      // Create service
      const response = await adminDataService.createService(serviceData);

      if (response.success) {
        Alert.alert('Success', 'Service created successfully', [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              onSuccess();
              onDismiss();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to create service');
      }
    } catch (error: any) {
      console.error('Error creating service:', error);
      Alert.alert('Error', error.message || 'Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    // Reset to initial state
    const initialCategoryObj = categories.find(
      c => c.category === initialCategory || c.id === initialCategory || c.title === initialCategory
    );
    
    setFormData({
      title: '',
      description: '',
      category: initialCategoryObj?.category || '',
      imageUrl: '',
      pricingType: 'fixed',
      unitMeasure: '',
      displayOrder: '0',
    });
    setSelectedCategoryId(initialCategoryObj?.id || '');
    setSelectedServiceId(null);
    setSelectedVariantId(null);
    setErrors([]);
    setCategoryMenuVisible(false);
    setServiceTypeMenuVisible(false);
    setVariantMenuVisible(false);
    setVariantCreateModalVisible(false);
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  // Auto-select "Create New Service" if no services exist for the category
  useEffect(() => {
    if (selectedCategoryId && services.length === 0 && !selectedServiceId) {
      setSelectedServiceId(CREATE_NEW_SERVICE_OPTION);
    }
  }, [selectedCategoryId, services.length, selectedServiceId]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  const showCreateForm = selectedServiceId === CREATE_NEW_SERVICE_OPTION;
  const showVariantDropdown = selectedServiceId && selectedServiceId !== CREATE_NEW_SERVICE_OPTION;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.modalHeader}>
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            {selectedService && selectedServiceId !== CREATE_NEW_SERVICE_OPTION
              ? `Edit Service: ${selectedService.title}`
              : 'Create New Service'}
          </Text>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Category Dropdown - First Option */}
          <View style={styles.dropdownContainer}>
            <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
              Service Category *
            </Text>
            {categoriesLoading ? (
              <Button mode="outlined" disabled style={styles.dropdownButton} contentStyle={styles.dropdownButtonContent}>
                Loading categories...
              </Button>
            ) : categories.length === 0 ? (
              <Button mode="outlined" disabled style={styles.dropdownButton} contentStyle={styles.dropdownButtonContent}>
                No categories available
              </Button>
            ) : (
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
                    {selectedCategory ? selectedCategory.title : 'Select Service Category'}
                  </Button>
                }
              >
                {categories.map((category) => (
                  <Menu.Item
                    key={category.id}
                    onPress={() => handleCategorySelect(category.id)}
                    title={category.title}
                  />
                ))}
              </Menu>
            )}
          </View>

          {/* Service Type Dropdown - Second Option */}
          <View style={styles.dropdownContainer}>
            <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
              Service Type *
            </Text>
            {!selectedCategoryId ? (
              <Button 
                mode="outlined" 
                disabled 
                style={styles.dropdownButton} 
                contentStyle={styles.dropdownButtonContent}
              >
                Select a category first
              </Button>
            ) : servicesLoading ? (
              <Button mode="outlined" disabled style={styles.dropdownButton} contentStyle={styles.dropdownButtonContent}>
                Loading services...
              </Button>
            ) : (
              <Menu
                visible={serviceTypeMenuVisible}
                onDismiss={() => setServiceTypeMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setServiceTypeMenuVisible(true)}
                    style={styles.dropdownButton}
                    contentStyle={styles.dropdownButtonContent}
                    disabled={!selectedCategoryId}
                  >
                    {selectedServiceId === CREATE_NEW_SERVICE_OPTION
                      ? 'Create New Service'
                      : selectedService
                      ? selectedService.title
                      : services.length === 0
                      ? 'No services available'
                      : 'Select Service Type'}
                  </Button>
                }
              >
                {services.length === 0 ? (
                  <Menu.Item
                    onPress={() => handleServiceTypeSelect(CREATE_NEW_SERVICE_OPTION)}
                    title="Create New Service"
                  />
                ) : (
                  <>
                    {services.map((service) => (
                      <Menu.Item
                        key={service.id}
                        onPress={() => handleServiceTypeSelect(service.id)}
                        title={service.title}
                      />
                    ))}
                    <Menu.Item
                      onPress={() => handleServiceTypeSelect(CREATE_NEW_SERVICE_OPTION)}
                      title="➕ Create New Service"
                      titleStyle={styles.createNewOption}
                    />
                  </>
                )}
              </Menu>
            )}
          </View>

          {/* Service Variant Dropdown - Third Option (only when existing service is selected) */}
          {showVariantDropdown && (
            <View style={styles.dropdownContainer}>
              <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                Service Variant *
              </Text>
              {variantsLoading ? (
                <Button mode="outlined" disabled style={styles.dropdownButton} contentStyle={styles.dropdownButtonContent}>
                  Loading variants...
                </Button>
              ) : (
                <Menu
                  visible={variantMenuVisible}
                  onDismiss={() => setVariantMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setVariantMenuVisible(true)}
                      style={styles.dropdownButton}
                      contentStyle={styles.dropdownButtonContent}
                      disabled={!selectedServiceId || selectedServiceId === CREATE_NEW_SERVICE_OPTION}
                    >
                      {selectedVariant
                        ? selectedVariant.title
                        : variants.length === 0
                        ? 'No variants available'
                        : 'Select Service Variant'}
                    </Button>
                  }
                >
                  {variants.length === 0 ? (
                    <Menu.Item
                      onPress={() => handleVariantSelect(ADD_NEW_VARIANT_OPTION)}
                      title="➕ Add New Variant"
                      titleStyle={styles.createNewOption}
                    />
                  ) : (
                    <>
                      {variants.map((variant) => (
                        <Menu.Item
                          key={variant.id}
                          onPress={() => handleVariantSelect(variant.id)}
                          title={variant.title}
                        />
                      ))}
                      <Menu.Item
                        onPress={() => handleVariantSelect(ADD_NEW_VARIANT_OPTION)}
                        title="➕ Add New Variant"
                        titleStyle={styles.createNewOption}
                      />
                    </>
                  )}
                </Menu>
              )}
            </View>
          )}

          {/* Form Fields - Show when "Create New Service" is selected */}
          {showCreateForm && (
            <>
              <TextInput
                label="Title *"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                mode="outlined"
                style={styles.input}
                error={errors.some(e => e.includes('Title'))}
              />

              <TextInput
                label="Description"
                value={formData.description || ''}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <TextInput
                label="Image URL"
                value={formData.imageUrl || ''}
                onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                mode="outlined"
                style={styles.input}
                placeholder="https://example.com/image.jpg"
              />

              {/* Pricing Type Toggle */}
              <View style={styles.segmentedContainer}>
                <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
                  Pricing Type
                </Text>
                <SegmentedButtons
                  value={formData.pricingType || 'fixed'}
                  onValueChange={(value) => setFormData({ ...formData, pricingType: value as 'fixed' | 'per_unit' })}
                  buttons={[
                    { value: 'fixed', label: 'Fixed', style: styles.segmentedButton },
                    { value: 'per_unit', label: 'Per Unit', style: styles.segmentedButton },
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>

              {/* Price Input - Fixed Pricing */}
              {formData.pricingType === 'fixed' && (
                <TextInput
                  label="Price (€) *"
                  value={formData.price || ''}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  error={errors.some(e => e.includes('Price'))}
                  placeholder="0.00"
                />
              )}

              {/* Price Input - Per Unit Pricing */}
              {formData.pricingType === 'per_unit' && (
                <>
                  <TextInput
                    label="Unit Price (€) *"
                    value={formData.price || ''}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    style={styles.input}
                    error={errors.some(e => e.includes('Price'))}
                    placeholder="0.00"
                  />
                  <TextInput
                    label="Unit Measure *"
                    value={formData.unitMeasure || ''}
                    onChangeText={(text) => setFormData({ ...formData, unitMeasure: text })}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., sqm, items, hours"
                    error={errors.some(e => e.includes('Unit'))}
                  />
                </>
              )}

              <TextInput
                label="Display Order"
                value={formData.displayOrder || '0'}
                onChangeText={(text) => setFormData({ ...formData, displayOrder: text })}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
                placeholder="0"
              />

              {errors.length > 0 && (
                <View style={styles.errorContainer}>
                  {errors.map((error, index) => (
                    <Text key={index} variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                      {error}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.modalActions}>
          <Button mode="outlined" onPress={handleDismiss} style={styles.button} disabled={saving}>
            Cancel
          </Button>
          {showCreateForm && (
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              loading={saving}
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Service'}
            </Button>
          )}
        </View>
      </Modal>

      {/* Service Variant Create Modal */}
      {selectedService && selectedServiceId !== CREATE_NEW_SERVICE_OPTION && (
        <ServiceVariantCreateModal
          visible={variantCreateModalVisible}
          serviceId={selectedService.id}
          serviceTitle={selectedService.title}
          onDismiss={() => setVariantCreateModalVisible(false)}
          onSuccess={handleVariantCreated}
        />
      )}
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
    maxHeight: 400,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdownButton: {
    width: '100%',
  },
  dropdownButtonContent: {
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 16,
  },
  errorContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
  createNewOption: {
    fontWeight: '600',
    color: '#3F72AF',
  },
  segmentedContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    width: '100%',
  },
  segmentedButton: {
    flex: 1,
    minWidth: 100,
  },
});
