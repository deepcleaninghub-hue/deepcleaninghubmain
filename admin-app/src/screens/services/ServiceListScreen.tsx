// Enhanced with new color palette: #F9F7F7, #DBE2EF, #3F72AF, #112D4E
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text, useTheme, TextInput, Button, Divider, Portal, Modal, Card, IconButton, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export function ServiceListScreen({ navigation }: any) {
  const theme = useTheme();
  const { services, refreshServices, loading } = useAdminData();
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantModalVisible, setVariantModalVisible] = useState(false);

  // Main service categories - these are the top-level categories
  const mainServiceCategories = [
    {
      id: 'cleaning',
      title: 'Cleaning',
      image: require('../../../assets/services/cleaning-image.jpeg'),
      category: 'Cleaning',
    },
    {
      id: 'furniture-assembly',
      title: 'Furniture Assembly',
      image: require('../../../assets/services/furniture-image.jpeg'),
      category: 'Furniture Assembly',
    },
    {
      id: 'furniture-disassembly',
      title: 'Furniture Disassembly',
      image: require('../../../assets/services/furniture-image.jpeg'),
      category: 'Furniture Disassembly',
    },
    {
      id: 'moving',
      title: 'Moving',
      image: require('../../../assets/services/moving.jpeg'),
      category: 'Moving',
    },
    {
      id: 'office-setup',
      title: 'Office Setup',
      image: require('../../../assets/services/office-setup-image.jpeg'),
      category: 'Office Setup',
    },
    {
      id: 'house-painting',
      title: 'House Painting',
      image: require('../../../assets/services/paint-image.jpeg'),
      category: 'House Painting',
    },
  ];

  useEffect(() => {
    refreshServices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshServices();
    setRefreshing(false);
  };

  const handleServiceCardPress = (category: typeof mainServiceCategories[0]) => {
    navigation.navigate('ServiceCategory', {
      categoryId: category.id,
      categoryTitle: category.category,
    });
  };

  const handleServicePress = async (service: AdminService) => {
    // Navigate to ServiceVariants screen
    navigation.navigate('ServiceVariants', { serviceId: service.id });
  };

  const handleEditService = (service: AdminService) => {
    navigation.navigate('ServiceEdit', { serviceId: service.id });
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
      console.error('Error fetching variants:', error);
      setVariants([]);
    } finally {
      setVariantsLoading(false);
    }
  };

  const getServiceImage = (service: AdminService) => {
    const imageUrl = (service as any).image_url || (service as any).imageUrl;
    if (imageUrl) {
      return { uri: imageUrl };
    }
    return { uri: 'https://via.placeholder.com/300x200?text=Service' };
  };

  // Filter services by selected category
  const filteredServices = selectedCategory
    ? services.filter(service => service.category === selectedCategory)
    : [];

  // Get unique categories from services
  const serviceCategories = Array.from(new Set(services.map(s => s.category))).filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Services
        </Text>
      </View>
      
      {/* Fixed Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
        <TextInput
          mode="outlined"
          placeholder="Search services..."
          style={[styles.searchInput, { backgroundColor: theme.colors.surface }]}
          left={<TextInput.Icon icon="magnify" color={theme.colors.onSurfaceVariant} />}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.onSurface}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          returnKeyType="done"
          blurOnSubmit={true}
        />
      </View>
        
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Main Service Categories Section */}
        <View style={styles.servicesSection}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Our Services
          </Text>
          
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
                Loading services...
              </Text>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {mainServiceCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}
                  activeOpacity={0.8}
                  onPress={() => handleServiceCardPress(category)}
                >
                  <View style={styles.imageContainer}>
                    {imageLoading[category.id] && (
                      <View style={styles.imageLoader}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      </View>
                    )}
                    <Image 
                      source={category.image}
                      style={styles.serviceImage}
                      onLoadStart={() => setImageLoading(prev => ({ ...prev, [category.id]: true }))}
                      onLoadEnd={() => setImageLoading(prev => ({ ...prev, [category.id]: false }))}
                      onError={() => {
                        setImageLoading(prev => ({ ...prev, [category.id]: false }));
                        setImageError(prev => ({ ...prev, [category.id]: true }));
                      }}
                    />
                    <View style={styles.imageOverlay} />
                    {imageError[category.id] && (
                      <View style={styles.imageErrorContainer}>
                        <Text style={[styles.imageErrorText, { color: theme.colors.onSurface }]}>
                          📷
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.serviceContent}>
                    <Text variant="titleMedium" style={[styles.serviceTitle, { color: theme.colors.onSurface }]}>
                      {category.title}
                    </Text>
                    <View style={styles.buttonContainer}>
                      <Button
                        mode="contained"
                        style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                        contentStyle={styles.viewButtonContent}
                        labelStyle={[styles.viewButtonLabel, { color: theme.colors.onPrimary }]}
                        onPress={() => handleServiceCardPress(category)}
                      >
                        View
                      </Button>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Services in Selected Category */}
        {selectedCategory && filteredServices.length > 0 && (
          <View style={styles.servicesSection}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {selectedCategory}
              </Text>
              <Button
                mode="text"
                onPress={() => setSelectedCategory(null)}
                icon="close"
              >
                Clear
              </Button>
            </View>
            <View style={styles.servicesGrid}>
              {filteredServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}
                  activeOpacity={0.8}
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
                    <View style={styles.imageOverlay} />
                    {imageError[service.id] && (
                      <View style={styles.imageErrorContainer}>
                        <Text style={[styles.imageErrorText, { color: theme.colors.onSurface }]}>
                          📷
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.serviceContent}>
                    <View style={styles.serviceHeader}>
                      <Text variant="titleMedium" style={[styles.serviceTitle, { color: theme.colors.onSurface, flex: 1 }]}>
                        {service.title}
                      </Text>
                      <IconButton
                        icon="pencil"
                        size={20}
                        iconColor={theme.colors.primary}
                        onPress={() => handleEditService(service)}
                        style={styles.editButton}
                      />
                    </View>
                    {service.description && (
                      <Text 
                        variant="bodySmall" 
                        style={[styles.serviceDescription, { color: theme.colors.onSurfaceVariant }]}
                        numberOfLines={2}
                      >
                        {service.description}
                      </Text>
                    )}
                    {service.price !== undefined && (
                      <Text variant="titleSmall" style={[styles.servicePrice, { color: theme.colors.primary }]}>
                        €{service.price.toFixed(2)}
                      </Text>
                    )}
                    <View style={styles.buttonContainer}>
                      <Button
                        mode="contained"
                        style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                        contentStyle={styles.viewButtonContent}
                        labelStyle={[styles.viewButtonLabel, { color: theme.colors.onPrimary }]}
                        onPress={() => handleServicePress(service)}
                      >
                        View Variants
                      </Button>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Service Cards Section (Horizontal Scroll) */}
        <View style={styles.serviceCategoriesSection}>
          <Divider style={{ marginVertical: 16 }} />
          <Text variant="titleMedium" style={[styles.categoriesTitle, { color: theme.colors.onSurface }]}>
            Browse More Services
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
            style={styles.categoriesScroll}
          >
            {mainServiceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.serviceCategoryCard,
                  { backgroundColor: theme.colors.surface }
                ]}
                activeOpacity={0.8}
                onPress={() => handleServiceCardPress(category)}
              >
                <View style={styles.categoryImageContainer}>
                  <Image 
                    source={category.image} 
                    style={styles.categoryImage}
                  />
                  <View style={styles.categoryImageOverlay} />
                </View>
                <View style={styles.categoryContent}>
                  <Text 
                    variant="bodyMedium" 
                    style={[styles.categoryTitle, { color: theme.colors.onSurface }]}
                    numberOfLines={1}
                  >
                    {category.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* FAB for creating new service */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ServiceCreate')}
        label="Add Service"
      />

      {/* Service Variant Modal */}
      <Portal>
        <Modal
          visible={variantModalVisible}
          onDismiss={() => {
            setVariantModalVisible(false);
            setSelectedService(null);
            setVariants([]);
          }}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {selectedService?.title || 'Service Variants'}
            </Text>
            <IconButton
              icon="close"
              iconColor={theme.colors.onSurfaceVariant}
              onPress={() => {
                setVariantModalVisible(false);
                setSelectedService(null);
                setVariants([]);
              }}
            />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {variantsLoading ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.modalLoadingText, { color: theme.colors.onSurface }]}>
                  Loading variants...
                </Text>
              </View>
            ) : variants.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <Text style={[styles.modalEmptyText, { color: theme.colors.onSurfaceVariant }]}>
                  No variants available for this service.
                </Text>
              </View>
            ) : (
              variants.map((variant) => (
                <Card key={variant.id} style={[styles.variantCard, { backgroundColor: theme.colors.surface }]}>
                  <Card.Content>
                    <Text variant="titleMedium" style={[styles.variantTitle, { color: theme.colors.onSurface }]}>
                      {variant.title}
                    </Text>
                    {variant.description && (
                      <Text variant="bodySmall" style={[styles.variantDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {variant.description}
                      </Text>
                    )}
                    <View style={styles.variantInfo}>
                      {variant.price !== undefined && (
                        <Text variant="titleSmall" style={[styles.variantPrice, { color: theme.colors.primary }]}>
                          €{variant.price.toFixed(2)}
                        </Text>
                      )}
                      {variant.duration && (
                        <Text variant="bodySmall" style={[styles.variantDuration, { color: theme.colors.onSurfaceVariant }]}>
                          {variant.duration} min
                        </Text>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBE2EF',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    borderRadius: 16,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  servicesSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (Dimensions.get('window').width - 60) / 2,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: '#F5F5F5',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    zIndex: 1,
  },
  imageErrorText: {
    fontSize: 32,
    opacity: 0.5,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 0,
  },
  serviceContent: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  serviceTitle: {
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  serviceDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  servicePrice: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  viewButton: {
    borderRadius: 25,
    minWidth: 140,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewButtonContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  viewButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  serviceCategoriesSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoriesTitle: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  categoriesScroll: {
    marginHorizontal: -8,
    marginBottom: 16,
  },
  categoriesScrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  serviceCategoryCard: {
    width: 140,
    height: 130,
    borderRadius: 12,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  categoryImageContainer: {
    position: 'relative',
    height: '60%',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  categoryTitle: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  modalContent: {
    padding: 16,
    maxHeight: 400,
  },
  modalLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  modalEmptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalEmptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  variantCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  variantTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  variantDescription: {
    marginBottom: 8,
    lineHeight: 18,
  },
  variantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantPrice: {
    fontWeight: '600',
  },
  variantDuration: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
