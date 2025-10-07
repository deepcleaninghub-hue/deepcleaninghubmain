import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text, useTheme, Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import ServiceCards from '../../components/ServiceCards';
import ServiceVariantModal from '../../components/ServiceVariantModal';
import AutoTranslateText from '../../components/AutoTranslateText';
import { useLanguage } from '../../contexts/LanguageContext';
import { ServicesStackScreenProps } from '../../navigation/types';
import { servicesAPI } from '../../services/api';
import { Service } from '../../types';

type Props = ServicesStackScreenProps<'ServiceCategory'>;

const ServiceCategoryScreen = ({ route, navigation }: Props) => {
  const theme = useTheme();
  const { t, translateDynamicText, currentLanguage } = useLanguage();
  const { categoryId, categoryTitle } = route.params;
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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

  // Fetch services for the selected category
  useEffect(() => {
    const fetchServicesByCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all services from database
        const allServices = await servicesAPI.getAllServices();
        
        // Filter services based on the category mapping
        const expectedServices = serviceCategoryMapping[categoryTitle] || [];
        
        console.log('Category:', categoryTitle);
        console.log('Expected services:', expectedServices);
        console.log('All services:', allServices.length);
        console.log('Sample service titles:', allServices.slice(0, 3).map(s => s.title));
        
        const filteredServices = allServices.filter(service => {
          // First try exact category match
          if (service.category === categoryTitle) {
            console.log('Found by category match:', service.title);
            return true;
          }
          
          // Then try service title matching
          const titleMatch = expectedServices.some(expectedService => 
            service.title.toLowerCase().includes(expectedService.toLowerCase()) ||
            expectedService.toLowerCase().includes(service.title.toLowerCase())
          );
          
          if (titleMatch) {
            console.log('Found by title match:', service.title);
          }
          
          return titleMatch;
        });
        
        console.log('Filtered services count:', filteredServices.length);
        console.log('Filtered service titles:', filteredServices.map(s => s.title));
        
        setServices(filteredServices);
      } catch (err) {
        console.error('Error fetching services by category:', err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServicesByCategory();
  }, [categoryTitle]);

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const handleModalDismiss = () => {
    setModalVisible(false);
    setSelectedService(null);
  };



  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title={categoryTitle} 
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.servicesSection}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('services.availableServices')}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
                Loading services...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
              <Button 
                mode="contained" 
                onPress={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    const allServices = await servicesAPI.getAllServices();
                    const expectedServices = serviceCategoryMapping[categoryTitle] || [];
                    const filteredServices = allServices.filter(service => {
                      // First try exact category match
                      if (service.category === categoryTitle) {
                        return true;
                      }
                      
                      // Then try service title matching
                      return expectedServices.some(expectedService => 
                        service.title.toLowerCase().includes(expectedService.toLowerCase()) ||
                        expectedService.toLowerCase().includes(service.title.toLowerCase())
                      );
                    });
                    setServices(filteredServices);
                  } catch (err) {
                    setError('Failed to load services');
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{ marginTop: 16 }}
              >
                Retry
              </Button>
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No services available for this category.
              </Text>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {services.map((service) => (
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
                      source={{ uri: service.image || 'https://images.unsplash.com/photo-1581578731548-c6a0c3f4f4b1?w=400&h=300&fit=crop&q=80' }} 
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
                    <AutoTranslateText 
                      style={[styles.serviceTitle, { color: theme.colors.onSurface }]}
                      showLoading={true}
                      loadingText={t('autoTranslate.translating')}
                      t={t}
                      translateDynamicText={translateDynamicText}
                      currentLanguage={currentLanguage}
                    >
                      {service.title}
                    </AutoTranslateText>
                    <AutoTranslateText 
                      style={[styles.serviceDescription, { color: theme.colors.onSurfaceVariant }]}
                      showLoading={true}
                      loadingText={t('autoTranslate.translating')}
                      t={t}
                      translateDynamicText={translateDynamicText}
                      currentLanguage={currentLanguage}
                    >
                      {service.description}
                    </AutoTranslateText>
                    {service.price && (
                      <Text variant="titleSmall" style={[styles.servicePrice, { color: theme.colors.primary }]}>
                        {service.pricingType === 'hourly' ? `€${service.price}/hour` : `€${service.price}`}
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
                        {t('common.order')}
                      </Button>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Service Cards Section */}
        <ServiceCards 
          onServicePress={(categoryId, categoryTitle) => {
            navigation.navigate('ServiceCategory', {
              categoryId,
              categoryTitle,
            });
          }}
        />
      </ScrollView>

      {/* Service Variant Modal */}
      {selectedService && (
        <ServiceVariantModal
          visible={modalVisible}
          onDismiss={handleModalDismiss}
          serviceTitle={selectedService.title}
          serviceId={selectedService.id}
          t={t}
          translateDynamicText={translateDynamicText}
          currentLanguage={currentLanguage}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (Dimensions.get('window').width - 60) / 2, // 2 cards per row with margins
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
    marginBottom: 8,
    color: '#1A1A1A',
  },
  serviceDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  servicePrice: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  viewButton: {
    borderRadius: 25,
    minWidth: 120,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ServiceCategoryScreen;
