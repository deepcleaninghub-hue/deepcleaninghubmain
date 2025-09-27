import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, TextInput, Button, Chip, Switch, SegmentedButtons } from 'react-native-paper';
import { useAdminData } from '@/contexts/AdminDataContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { adminDataService } from '@/services/adminDataService';
import { AdminService } from '@/types';

export function ServiceEditScreen({ route, navigation }: any) {
  const { serviceId } = route.params;
  const { refreshServices } = useAdminData();
  const [service, setService] = useState<AdminService | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [pricingType, setPricingType] = useState<'fixed' | 'per_unit' | 'hourly'>('fixed');
  const [price, setPrice] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('');
  const [minMeasurement, setMinMeasurement] = useState('');
  const [maxMeasurement, setMaxMeasurement] = useState('');
  const [duration, setDuration] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    loadServiceDetails();
  }, [serviceId]);

  const loadServiceDetails = async () => {
    try {
      setLoading(true);
      const result = await adminDataService.getService(serviceId);
      if (result.success && result.data) {
        const serviceData = result.data;
        setService(serviceData);
        setTitle(serviceData.title);
        setDescription(serviceData.description);
        setCategory(serviceData.category);
        setPricingType(serviceData.pricingType);
        setPrice(serviceData.price?.toString() || '');
        setUnitPrice(serviceData.unitPrice?.toString() || '');
        setUnitMeasure(serviceData.unitMeasure || '');
        setMinMeasurement(serviceData.minMeasurement?.toString() || '');
        setMaxMeasurement(serviceData.maxMeasurement?.toString() || '');
        setDuration(serviceData.duration || '');
        setDifficultyLevel(serviceData.difficultyLevel);
        setEstimatedDuration(serviceData.estimatedDuration.toString());
        setDisplayOrder(serviceData.displayOrder.toString());
        setIsActive(serviceData.isActive);
        setFeatures(serviceData.features);
      } else {
        setError(result.error || 'Failed to load service details');
      }
    } catch (err) {
      setError('An error occurred while loading service details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!service) return;

    // Validate required fields
    if (!title || !description || !category) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const updatedService = {
        ...service,
        title,
        description,
        category,
        pricingType,
        price: price ? parseFloat(price) : undefined,
        unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
        unitMeasure: unitMeasure || undefined,
        minMeasurement: minMeasurement ? parseFloat(minMeasurement) : undefined,
        maxMeasurement: maxMeasurement ? parseFloat(maxMeasurement) : undefined,
        duration: duration || undefined,
        difficultyLevel,
        estimatedDuration: parseInt(estimatedDuration) || 0,
        displayOrder: parseInt(displayOrder) || 0,
        isActive,
        features,
      };

      const result = await adminDataService.updateService(serviceId, updatedService);
      if (result.success) {
        await refreshServices();
        Alert.alert('Success', 'Service updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.error || 'Failed to update service');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while updating service');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setFeatures(features.filter(feature => feature !== featureToRemove));
  };

  if (loading) {
    return <LoadingSpinner loading={true} message="Loading service details..." />;
  }

  if (error || !service) {
    return (
      <ErrorDisplay 
        error={error || 'Service not found'} 
        onRetry={loadServiceDetails}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Basic Information
            </Text>
            
            <TextInput
              label="Service Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Description *"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            
            <TextInput
              label="Category *"
              value={category}
              onChangeText={setCategory}
              mode="outlined"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Pricing Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Pricing Information
            </Text>
            
            <Text variant="bodyLarge" style={styles.subsectionTitle}>
              Pricing Type
            </Text>
            <SegmentedButtons
              value={pricingType}
              onValueChange={(value) => setPricingType(value as any)}
              buttons={[
                { value: 'fixed', label: 'Fixed' },
                { value: 'per_unit', label: 'Per Unit' },
                { value: 'hourly', label: 'Hourly' },
              ]}
              style={styles.segmentedButtons}
            />
            
            <TextInput
              label={pricingType === 'hourly' ? 'Price per Hour' : 'Price'}
              value={price}
              onChangeText={setPrice}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            
            {pricingType === 'per_unit' && (
              <>
                <TextInput
                  label="Unit Price"
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
                
                <TextInput
                  label="Unit Measure"
                  value={unitMeasure}
                  onChangeText={setUnitMeasure}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., sq ft, hours, items"
                />
                
                <View style={styles.measurementRow}>
                  <TextInput
                    label="Min Measurement"
                    value={minMeasurement}
                    onChangeText={setMinMeasurement}
                    mode="outlined"
                    keyboardType="numeric"
                    style={[styles.input, styles.halfInput]}
                  />
                  
                  <TextInput
                    label="Max Measurement"
                    value={maxMeasurement}
                    onChangeText={setMaxMeasurement}
                    mode="outlined"
                    keyboardType="numeric"
                    style={[styles.input, styles.halfInput]}
                  />
                </View>
              </>
            )}
            
            <TextInput
              label="Duration"
              value={duration}
              onChangeText={setDuration}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., 2 hours, 1 day"
            />
          </Card.Content>
        </Card>

        {/* Service Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Service Details
            </Text>
            
            <Text variant="bodyLarge" style={styles.subsectionTitle}>
              Difficulty Level
            </Text>
            <SegmentedButtons
              value={difficultyLevel}
              onValueChange={(value) => setDifficultyLevel(value as any)}
              buttons={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
                { value: 'expert', label: 'Expert' },
              ]}
              style={styles.segmentedButtons}
            />
            
            <TextInput
              label="Estimated Duration (minutes)"
              value={estimatedDuration}
              onChangeText={setEstimatedDuration}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Display Order"
              value={displayOrder}
              onChangeText={setDisplayOrder}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            
            <View style={styles.switchRow}>
              <Text variant="bodyLarge" style={styles.switchLabel}>
                Active Service
              </Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Features */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Features
            </Text>
            
            <View style={styles.featureInputRow}>
              <TextInput
                label="Add Feature"
                value={newFeature}
                onChangeText={setNewFeature}
                mode="outlined"
                style={[styles.input, styles.featureInput]}
                placeholder="Enter feature name"
              />
              <Button
                mode="outlined"
                onPress={handleAddFeature}
                style={styles.addFeatureButton}
                disabled={!newFeature.trim()}
              >
                Add
              </Button>
            </View>
            
            {features.length > 0 && (
              <View style={styles.featuresContainer}>
                {features.map((feature, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    onClose={() => handleRemoveFeature(feature)}
                    style={styles.featureChip}
                  >
                    {feature}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Read-only Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Service Statistics
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>Total Bookings</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {service.totalBookings}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>Total Revenue</Text>
                <Text variant="titleMedium" style={[styles.statValue, { color: '#4CAF50' }]}>
                  ${service.totalRevenue.toFixed(0)}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>Average Rating</Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {service.averageRating.toFixed(1)}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>Popularity Score</Text>
                <Text variant="titleMedium" style={[styles.statValue, { color: '#2196F3' }]}>
                  {service.popularityScore}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
        
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Save Changes
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  measurementRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    color: '#212121',
  },
  featureInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  featureInput: {
    flex: 1,
  },
  addFeatureButton: {
    alignSelf: 'flex-end',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    marginBottom: 16,
  },
  statLabel: {
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#212121',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});
