import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, useTheme, Button, Card, Portal, Modal, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdminData } from '@/contexts/AdminDataContext';
import { AdminService } from '@/types';
import { httpClient } from '@/services/httpClient';

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

export function ServiceCategoryScreen({ route, navigation }: any) {
  const theme = useTheme();
  const { categoryId, categoryTitle } = route.params;
  const { services: allServices } = useAdminData();
  const [categoryServices, setCategoryServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantModalVisible, setVariantModalVisible] = useState(false);

  // Service categorization mapping
  const serviceCategoryMapping: {[key: string]: string[]} = {
    'Cleaning': ['Normal Cleaning', 'Deep Cleaning'],
    'Furniture Assembly': [
      'Bed Assembly', 'Bookshelf Assembly', 'Kitchen Assembly', 
      'Table Assembly', 'Wardrobe Assembly', 'Filing Cabinet Assembly'
    ],
    'Furniture Disassembly': [
      'Bed Disassembly', 'Bookshelf Disassembly', 'Kitchen Disassembly', 
      'Table Disassembly', 'Wardrobe Disassembly'
    ],
    'House Painting': [
      'Exterior Painting', 'Interior Painting', 'Ceiling Painting'
    ],
    'Office Setup': [
      'Office Chair Assembly', 'Office Desk Assembly', 
      'Office Equipment Assembly', 'Meeting Table Assembly'
    ],
    'Moving': [
      'House Moving', 'Office Moving'
    ],
  };

  useEffect(() => {
    filterServicesByCategory();
  }, [categoryTitle, allServices]);

  const filterServicesByCategory = () => {
    try {
      setLoading(true);
      
      // Get expected services for this category
      const expectedServices = serviceCategoryMapping[categoryTitle] || [];
      
      const filteredServices = allServices.filter(service => {
        // First try exact category match
        if (service.category === categoryTitle) {
          return true;
        }
        
        // Then try service title matching
        const titleMatch = expectedServices.some(expectedService => 
          service.title.toLowerCase().includes(expectedService.toLowerCase()) ||
          expectedService.toLowerCase().includes(service.title.toLowerCase())
        );
        
        return titleMatch;
      });
      
      setCategoryServices(filteredServices);
    } catch (error) {
      console.error('Error filtering services by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServicePress = async (service: AdminService) => {
    setSelectedService(service);
    setVariantModalVisible(true);
    await fetchServiceVariants(service.id);
  };

  const fetchServiceVariants = async (serviceId: string) => {
    try {
      setVariantsLoading(true);
      const response = await httpClient.get(`/service-variants?service_id=${serviceId}`);
      if (response.data.success && response.data.data) {
        setVariants(response.data.data);
      } else {
        setVariants([]);
      }
    } catch (error) {
      console.error('Error fetching service variants:', error);
      setVariants([]);
    } finally {
      setVariantsLoading(false);
    }
  };

  const handleModalDismiss = () => {
    setVariantModalVisible(false);
    setSelectedService(null);
    setVariants([]);
  };

  const getServiceImage = (service: AdminService) => {
    // Check if service has image property (from API response)
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
        ) : categoryServices.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="folder-outline" size={64} color={theme.colors.onSurfaceVariant} />
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                No services found
              </Text>
              <Text variant="bodyMedium" style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                No services available for this category.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.servicesGrid}>
            {categoryServices.map((service) => (
              <Card
                key={service.id}
                style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleServicePress(service)}
              >
                <View style={styles.imageContainer}>
                  {imageLoading[service.id] && (
                    <View style={styles.imageLoader}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    </View>
                  )}
                  <Image 
                    source={getServiceImage(service)}
                    style={styles.serviceImage}
                    onLoadStart={() => setImageLoading(prev => ({ ...prev, [service.id]: true }))}
                    onLoadEnd={() => setImageLoading(prev => ({ ...prev, [service.id]: false }))}
                    onError={() => {
                      setImageLoading(prev => ({ ...prev, [service.id]: false }));
                      setImageError(prev => ({ ...prev, [service.id]: true }));
                    }}
                  />
                  {imageError[service.id] && (
                    <View style={styles.imageErrorContainer}>
                      <Ionicons name="image-outline" size={32} color={theme.colors.onSurfaceVariant} />
                    </View>
                  )}
                </View>
                <Card.Content>
                  <View style={styles.serviceHeader}>
                    <Text variant="titleMedium" style={[styles.serviceTitle, { color: theme.colors.onSurface, flex: 1 }]}>
                      {service.title}
                    </Text>
                    <IconButton
                      icon="pencil"
                      size={20}
                      iconColor={theme.colors.primary}
                      onPress={() => navigation.navigate('ServiceEdit', { serviceId: service.id })}
                      style={styles.editButton}
                    />
                  </View>
                  {service.description && (
                    <Text variant="bodySmall" style={[styles.serviceDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {service.description}
                    </Text>
                  )}
                  {service.price && (
                    <Text variant="titleSmall" style={[styles.servicePrice, { color: theme.colors.primary }]}>
                      {service.pricingType === 'hourly' ? `€${service.price}/hour` : `€${service.price}`}
                    </Text>
                  )}
                  <Button
                    mode="contained"
                    style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                    contentStyle={styles.viewButtonContent}
                    labelStyle={[styles.viewButtonLabel, { color: theme.colors.onPrimary }]}
                    onPress={() => navigation.navigate('ServiceVariants', { serviceId: service.id })}
                  >
                    View Variants
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Service Variant Modal */}
      <Portal>
        <Modal
          visible={variantModalVisible}
          onDismiss={handleModalDismiss}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          {selectedService && (
            <Card style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Title
                title={selectedService.title}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={handleModalDismiss}
                  />
                )}
              />
              <Card.Content>
                {variantsLoading ? (
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                ) : variants.length === 0 ? (
                  <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                    No variants available for this service.
                  </Text>
                ) : (
                  <ScrollView style={styles.variantsScrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.variantsList}>
                      {variants.map((variant) => (
                        <Card key={variant.id} style={[styles.variantCard, { backgroundColor: theme.colors.background }]}>
                          <Card.Content>
                            <Text variant="titleSmall" style={[styles.variantTitle, { color: theme.colors.onSurface }]}>
                              {variant.title}
                            </Text>
                            {variant.description && (
                              <Text variant="bodySmall" style={[styles.variantDescription, { color: theme.colors.onSurfaceVariant }]}>
                                {variant.description}
                              </Text>
                            )}
                            <View style={styles.variantDetails}>
                              <Text variant="bodyMedium" style={[styles.variantPrice, { color: theme.colors.primary }]}>
                                €{variant.price}
                              </Text>
                              {variant.duration && (
                                <Text variant="bodySmall" style={[styles.variantDuration, { color: theme.colors.onSurfaceVariant }]}>
                                  {variant.duration} min
                                </Text>
                              )}
                            </View>
                          </Card.Content>
                        </Card>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </Card.Content>
            </Card>
          )}
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
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  serviceTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  serviceDescription: {
    marginBottom: 8,
  },
  servicePrice: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  viewButton: {
    borderRadius: 8,
  },
  viewButtonContent: {
    paddingVertical: 4,
  },
  viewButtonLabel: {
    fontSize: 12,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalCard: {
    borderRadius: 16,
  },
  variantsScrollView: {
    maxHeight: 400,
  },
  variantsList: {
    gap: 12,
  },
  variantCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  variantTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  variantDescription: {
    marginBottom: 8,
  },
  variantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantPrice: {
    fontWeight: 'bold',
  },
  variantDuration: {
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  editButton: {
    margin: 0,
  },
});

