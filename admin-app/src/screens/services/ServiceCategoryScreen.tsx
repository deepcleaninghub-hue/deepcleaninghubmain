/**
 * Service Category Screen - Refactored
 * Displays services for a category with ability to add services and variants
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, Card, useTheme, FAB, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useServices } from './hooks/useServices';
import { ServiceCard } from './components/ServiceCard';
import { ServiceCreateModal } from './components/ServiceCreateModal';
import { ServiceVariantCreateModal } from './components/ServiceVariantCreateModal';
import { AdminService } from '@/types';

export function ServiceCategoryScreen({ route, navigation }: any) {
  const theme = useTheme();
  const { categoryId, categoryTitle } = route.params;
  const { services, loading, refreshServices } = useServices(categoryTitle);
  const [serviceCreateModalVisible, setServiceCreateModalVisible] = useState(false);
  const [variantCreateModalVisible, setVariantCreateModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);

  const handleServicePress = (service: AdminService) => {
    navigation.navigate('ServiceVariants', { serviceId: service.id });
  };

  const handleEditService = (service: AdminService) => {
    navigation.navigate('ServiceEdit', { serviceId: service.id });
  };

  const handleAddService = () => {
    setServiceCreateModalVisible(true);
  };

  const handleAddVariant = (service: AdminService) => {
    setSelectedService(service);
    setVariantCreateModalVisible(true);
  };

  const handleServiceCreated = () => {
    refreshServices();
  };

  const handleVariantCreated = () => {
    refreshServices();
  };

  const getServiceImage = (service: AdminService) => {
    const serviceImage = (service as any).image || (service as any).image_url;
    if (serviceImage) {
      return { uri: serviceImage };
    }
    // Return placeholder based on category
    const categoryImages: {[key: string]: any} = {
      'Cleaning': require('../../../assets/services/cleaning-image.jpeg'),
      'Furniture Assembly': require('../../../assets/services/furniture-image.jpeg'),
      'Furniture Disassembly': require('../../../assets/services/furniture-image.jpeg'),
      'Moving': require('../../../assets/services/moving.jpeg'),
      'Office Setup': require('../../../assets/services/office-setup-image.jpeg'),
      'House Painting': require('../../../assets/services/paint-image.jpeg'),
    };
    return categoryImages[categoryTitle] || require('../../../assets/services/cleaning-image.jpeg');
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
          {categoryTitle}
        </Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
              Loading services...
            </Text>
          </View>
        ) : services.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="folder-outline" size={64} color={theme.colors.onSurfaceVariant} />
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                No services found
              </Text>
              <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                No services available for this category.
              </Text>
              <Button
                mode="contained"
                onPress={handleAddService}
                style={styles.addButton}
              >
                Add First Service
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <View key={service.id} style={styles.serviceCardWrapper}>
                <ServiceCard
                  service={service}
                  onPress={handleServicePress}
                  onEdit={handleEditService}
                  getImageSource={getServiceImage}
                />
                <IconButton
                  icon="plus-circle"
                  size={24}
                  iconColor={theme.colors.primary}
                  onPress={() => handleAddVariant(service)}
                  style={styles.addVariantButton}
                />
                <Text variant="bodySmall" style={[styles.addVariantLabel, { color: theme.colors.primary }]}>
                  Add Variant
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddService}
        label="Add Service"
      />

      {/* Service Create Modal */}
      <ServiceCreateModal
        visible={serviceCreateModalVisible}
        category={categoryTitle}
        onDismiss={() => setServiceCreateModalVisible(false)}
        onSuccess={handleServiceCreated}
      />

      {/* Service Variant Create Modal */}
      {selectedService && (
        <ServiceVariantCreateModal
          visible={variantCreateModalVisible}
          serviceId={selectedService.id}
          serviceTitle={selectedService.title}
          onDismiss={() => {
            setVariantCreateModalVisible(false);
            setSelectedService(null);
          }}
          onSuccess={handleVariantCreated}
        />
      )}
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
    paddingBottom: 20,
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
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCardWrapper: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  addVariantButton: {
    marginTop: 8,
    marginBottom: 4,
  },
  addVariantLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

