/**
 * Service Variant Create Modal Component
 * Modal for creating a new service variant for a service
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Modal, TextInput, Button, useTheme, Portal, SegmentedButtons } from 'react-native-paper';
import { adminDataService } from '@/services/adminDataService';
import { validateServiceVariantData, buildServiceVariantData, ServiceVariantFormData } from '../utils/serviceOperations';

interface ServiceVariantCreateModalProps {
  visible: boolean;
  serviceId: string;
  serviceTitle: string;
  onDismiss: () => void;
  onSuccess: () => void;
}

export function ServiceVariantCreateModal({
  visible,
  serviceId,
  serviceTitle,
  onDismiss,
  onSuccess,
}: ServiceVariantCreateModalProps) {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ServiceVariantFormData>({
    serviceId: serviceId,
    title: '',
    description: '',
    price: '',
    unitPrice: '',
    unitMeasure: '',
    duration: '',
    pricingType: 'fixed',
    minMeasurement: '',
    maxMeasurement: '',
    measurementStep: '',
    measurementPlaceholder: '',
    displayOrder: '0',
    features: [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  const handleSave = async () => {
    // Validate form data
    const validation = validateServiceVariantData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      // Build variant data
      const variantData = buildServiceVariantData(formData);

      // Create variant
      const response = await adminDataService.createServiceVariant(variantData);

      if (response.success) {
        Alert.alert('Success', 'Service variant created successfully', [
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
        Alert.alert('Error', response.error || 'Failed to create service variant');
      }
    } catch (error: any) {
      console.error('Error creating service variant:', error);
      Alert.alert('Error', error.message || 'Failed to create service variant');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      serviceId: serviceId,
      title: '',
      description: '',
      price: '',
      unitPrice: '',
      unitMeasure: '',
      duration: '',
      pricingType: 'fixed',
      minMeasurement: '',
      maxMeasurement: '',
      measurementStep: '',
      measurementPlaceholder: '',
      displayOrder: '0',
      features: [],
    });
    setNewFeature('');
    setErrors([]);
  };

  const handleDismiss = () => {
    resetForm();
    onDismiss();
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...(formData.features || [])];
    updatedFeatures.splice(index, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.modalHeader}>
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Add Variant to {serviceTitle}
          </Text>
        </View>

        <ScrollView style={styles.modalContent}>
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

          {formData.pricingType === 'fixed' && (
            <TextInput
              label="Price (€)"
              value={formData.price || ''}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
              error={errors.some(e => e.includes('Price'))}
            />
          )}

          {formData.pricingType === 'per_unit' && (
            <>
              <TextInput
                label="Unit Price (€)"
                value={formData.unitPrice || ''}
                onChangeText={(text) => setFormData({ ...formData, unitPrice: text })}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
                error={errors.some(e => e.includes('Unit price'))}
              />
              <TextInput
                label="Unit Measure"
                value={formData.unitMeasure || ''}
                onChangeText={(text) => setFormData({ ...formData, unitMeasure: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., sqm, items"
              />
              <TextInput
                label="Min Measurement"
                value={formData.minMeasurement || ''}
                onChangeText={(text) => setFormData({ ...formData, minMeasurement: text })}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
              />
              <TextInput
                label="Max Measurement"
                value={formData.maxMeasurement || ''}
                onChangeText={(text) => setFormData({ ...formData, maxMeasurement: text })}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
                error={errors.some(e => e.includes('minimum') || e.includes('maximum'))}
              />
              <TextInput
                label="Measurement Step"
                value={formData.measurementStep || ''}
                onChangeText={(text) => setFormData({ ...formData, measurementStep: text })}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
              />
              <TextInput
                label="Measurement Placeholder"
                value={formData.measurementPlaceholder || ''}
                onChangeText={(text) => setFormData({ ...formData, measurementPlaceholder: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Enter area in sqm"
              />
            </>
          )}

          <TextInput
            label="Duration (minutes)"
            value={formData.duration || ''}
            onChangeText={(text) => setFormData({ ...formData, duration: text })}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            error={errors.some(e => e.includes('Duration'))}
          />

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
        </ScrollView>

        <View style={styles.modalActions}>
          <Button mode="outlined" onPress={handleDismiss} style={styles.button} disabled={saving}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            loading={saving}
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Variant'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '85%',
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
    maxHeight: 500,
  },
  input: {
    marginBottom: 16,
  },
  segmentedContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
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
});

