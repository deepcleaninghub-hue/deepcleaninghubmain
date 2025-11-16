import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, useTheme, Card, Button, IconButton, FAB, Portal, Modal, TextInput, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminData } from '@/contexts/AdminDataContext';
import { adminDataService } from '@/services/adminDataService';

type ServiceVariant = {
  id: string;
  service_id: string;
  title: string;
  description?: string;
  price: number;
  duration?: number;
  is_active?: boolean;
  display_order?: number;
};

export function ServiceVariantsScreen({ route, navigation }: any) {
  const theme = useTheme();
  const { serviceId } = route.params;
  const { refreshServices } = useAdminData();
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ServiceVariant | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadData();
  }, [serviceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [variantsResult, serviceResult] = await Promise.all([
        adminDataService.getServiceVariants(serviceId),
        adminDataService.getService(serviceId),
      ]);

      if (variantsResult.success && variantsResult.data) {
        setVariants(variantsResult.data);
      }
      if (serviceResult.success && serviceResult.data) {
        setService(serviceResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load service variants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setEditingVariant(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setDuration('');
    setDisplayOrder('');
    setIsActive(true);
    setModalVisible(true);
  };

  const handleEditVariant = (variant: ServiceVariant) => {
    setEditingVariant(variant);
    setTitle(variant.title);
    setDescription(variant.description || '');
    setPrice(variant.price.toString());
    setDuration(variant.duration?.toString() || '');
    setDisplayOrder(variant.display_order?.toString() || '');
    setIsActive(variant.is_active !== false);
    setModalVisible(true);
  };

  const handleDeleteVariant = (variant: ServiceVariant) => {
    Alert.alert(
      'Delete Variant',
      `Are you sure you want to delete "${variant.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await adminDataService.deleteServiceVariant(variant.id);
              if (result.success) {
                await loadData();
                Alert.alert('Success', 'Variant deleted successfully');
              } else {
                Alert.alert('Error', result.error || 'Failed to delete variant');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete variant');
            }
          },
        },
      ]
    );
  };

  const handleSaveVariant = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert('Validation Error', 'Please fill in title and price');
      return;
    }

    try {
      setSaving(true);
      const variantData = {
        service_id: serviceId,
        title: title.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        duration: duration ? parseInt(duration) : undefined,
        display_order: displayOrder ? parseInt(displayOrder) : 0,
        is_active: isActive,
      };

      let result;
      if (editingVariant) {
        result = await adminDataService.updateServiceVariant(editingVariant.id, variantData);
      } else {
        result = await adminDataService.createServiceVariant(variantData);
      }

      if (result.success) {
        await loadData();
        setModalVisible(false);
        Alert.alert('Success', editingVariant ? 'Variant updated successfully' : 'Variant created successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to save variant');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving variant');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingVariant(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setDuration('');
    setDisplayOrder('');
    setIsActive(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          icon="arrow-left"
          textColor={theme.colors.primary}
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {service?.title || 'Service Variants'}
        </Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
              Loading variants...
            </Text>
          </View>
        ) : variants.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyContent}>
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                No Variants
              </Text>
              <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                No variants available for this service. Add one to get started.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.variantsList}>
            {variants.map((variant) => (
              <Card
                key={variant.id}
                style={[styles.variantCard, { backgroundColor: theme.colors.surface }]}
              >
                <Card.Content>
                  <View style={styles.variantHeader}>
                    <View style={styles.variantTitleContainer}>
                      <Text variant="titleMedium" style={[styles.variantTitle, { color: theme.colors.onSurface }]}>
                        {variant.title}
                      </Text>
                      {!variant.is_active && (
                        <Text variant="bodySmall" style={[styles.inactiveBadge, { color: theme.colors.error }]}>
                          Inactive
                        </Text>
                      )}
                    </View>
                    <View style={styles.variantActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        iconColor={theme.colors.primary}
                        onPress={() => handleEditVariant(variant)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor={theme.colors.error}
                        onPress={() => handleDeleteVariant(variant)}
                      />
                    </View>
                  </View>
                  {variant.description && (
                    <Text variant="bodySmall" style={[styles.variantDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {variant.description}
                    </Text>
                  )}
                  <View style={styles.variantDetails}>
                    <View style={styles.variantDetailItem}>
                      <Text variant="bodySmall" style={[styles.variantDetailLabel, { color: theme.colors.onSurfaceVariant }]}>
                        Price:
                      </Text>
                      <Text variant="bodyMedium" style={[styles.variantPrice, { color: theme.colors.primary }]}>
                        €{variant.price.toFixed(2)}
                      </Text>
                    </View>
                    {variant.duration && (
                      <View style={styles.variantDetailItem}>
                        <Text variant="bodySmall" style={[styles.variantDetailLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Duration:
                        </Text>
                        <Text variant="bodyMedium" style={[styles.variantDuration, { color: theme.colors.onSurface }]}>
                          {variant.duration} min
                        </Text>
                      </View>
                    )}
                    {variant.display_order !== undefined && (
                      <View style={styles.variantDetailItem}>
                        <Text variant="bodySmall" style={[styles.variantDetailLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Order:
                        </Text>
                        <Text variant="bodyMedium" style={[styles.variantOrder, { color: theme.colors.onSurface }]}>
                          {variant.display_order}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB for adding new variant */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddVariant}
        label="Add Variant"
      />

      {/* Add/Edit Variant Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={handleCloseModal}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <Card style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Title
              title={editingVariant ? 'Edit Variant' : 'Add Variant'}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={handleCloseModal}
                />
              )}
            />
            <Card.Content>
              <ScrollView style={styles.modalScrollView}>
                <TextInput
                  label="Title *"
                  value={title}
                  onChangeText={setTitle}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
                <TextInput
                  label="Price *"
                  value={price}
                  onChangeText={setPrice}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Duration (minutes)"
                  value={duration}
                  onChangeText={setDuration}
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
                  <Text variant="bodyLarge" style={[styles.switchLabel, { color: theme.colors.onSurface }]}>
                    Active
                  </Text>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                  />
                </View>
              </ScrollView>
            </Card.Content>
            <Card.Actions>
              <Button onPress={handleCloseModal}>Cancel</Button>
              <Button
                mode="contained"
                onPress={handleSaveVariant}
                loading={saving}
                disabled={saving}
              >
                {editingVariant ? 'Update' : 'Create'}
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
  },
  emptyCard: {
    marginVertical: 20,
    borderRadius: 12,
    elevation: 2,
  },
  emptyContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  variantsList: {
    gap: 12,
  },
  variantCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  variantTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  variantTitle: {
    fontWeight: 'bold',
  },
  inactiveBadge: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  variantActions: {
    flexDirection: 'row',
  },
  variantDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  variantDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  variantDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  variantDetailLabel: {
    fontSize: 12,
  },
  variantPrice: {
    fontWeight: 'bold',
  },
  variantDuration: {
    fontWeight: '500',
  },
  variantOrder: {
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalCard: {
    borderRadius: 16,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  input: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  switchLabel: {
    fontWeight: '500',
  },
});
