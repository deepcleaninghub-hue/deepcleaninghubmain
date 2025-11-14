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
} from 'react-native';
import { Text, useTheme, TextInput, Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import ServiceCards from '../../components/ServiceCards';
import { useLanguage } from '../../contexts/LanguageContext';
import { ServicesStackScreenProps } from '../../navigation/types';
import { servicesAPI } from '../../services/api';
import { Service } from '../../types';

type Props = ServicesStackScreenProps<'ServicesMain'>;

const ServicesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Main service categories - these are the top-level categories
  const mainServiceCategories = [
    {
      id: 'cleaning',
      title: t('services.cleaning'),
      image: require('../../../assets/services/cleaning-image.jpeg'),
      category: 'Cleaning',
    },
    {
      id: 'furniture-assembly',
      title: t('services.furnitureAssembly'),
      image: require('../../../assets/services/furniture-image.jpeg'),
      category: 'Furniture Assembly',
    },
    {
      id: 'furniture-disassembly',
      title: t('services.furnitureDisassembly'),
      image: require('../../../assets/services/furniture-image.jpeg'),
      category: 'Furniture Disassembly',
    },
    {
      id: 'moving',
      title: t('services.moving'),
      image: require('../../../assets/services/moving.jpeg'),
      category: 'Moving',
    },
    {
      id: 'office-setup',
      title: t('services.officeSetup'),
      image: require('../../../assets/services/office-setup-image.jpeg'),
      category: 'Office Setup',
    },
    {
      id: 'house-painting',
      title: t('services.housePainting'),
      image: require('../../../assets/services/paint-image.jpeg'),
      category: 'House Painting',
    },
  ];

  const handleServiceCardPress = (service: Service) => {
    // Map the translated title back to the original English category name
    const categoryMapping: {[key: string]: string} = {
      [t('services.cleaning')]: 'Cleaning',
      [t('services.furnitureAssembly')]: 'Furniture Assembly',
      [t('services.furnitureDisassembly')]: 'Furniture Disassembly',
      [t('services.moving')]: 'Moving',
      [t('services.officeSetup')]: 'Office Setup',
      [t('services.housePainting')]: 'House Painting',
    };
    
    const originalCategoryTitle = categoryMapping[service.title] || service.title;
    
    navigation.navigate('ServiceCategory', {
      categoryId: service.id,
      categoryTitle: originalCategoryTitle,
    });
  };

  // Set the main service categories - update when language changes
  useEffect(() => {
    // Convert to Service interface format
    const serviceCategories: Service[] = mainServiceCategories.map(category => ({
      id: category.id,
      title: category.title,
      description: `${category.title} services`,
      image: category.image,
      category: category.title,
      pricingType: 'fixed' as const,
      price: 0,
      features: [],
      displayOrder: 0,
      isActive: true,
      serviceVariants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    setServices(serviceCategories);
    setLoading(false);
  }, [t]); // Add t as dependency to re-run when language changes

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('services.title')} />
      
      {/* Fixed Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
          <TextInput
            mode="outlined"
            placeholder={t('services.searchServices')}
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
      >
        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('services.ourServices')}
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
                onPress={() => {
                  setError(null);
                  setLoading(true);
                  // Retry fetching services
                  servicesAPI.getAllServices()
                    .then(setServices)
                    .catch(() => setError('Failed to load services'))
                    .finally(() => setLoading(false));
                }}
                style={{ marginTop: 16 }}
              >
                Retry
              </Button>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceCard, { backgroundColor: theme.colors.surface }]}
                  activeOpacity={0.8}
                  onPress={() => handleServiceCardPress(service)}
                >
                  <View style={styles.imageContainer}>
                    {imageLoading[service.id] && (
                      <View style={styles.imageLoader}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      </View>
                    )}
                    <Image 
                      source={typeof service.image === 'string' ? { uri: service.image } : service.image} 
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
                    <Text variant="titleMedium" style={[styles.serviceTitle, { color: theme.colors.onSurface }]}>
                      {service.title}
                    </Text>
                    <View style={styles.buttonContainer}>
                      <Button
                        mode="contained"
                        style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                        contentStyle={styles.viewButtonContent}
                        labelStyle={[styles.viewButtonLabel, { color: theme.colors.onPrimary }]}
                        onPress={() => handleServiceCardPress(service)}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBE2EF', // Soft blue-gray for filter section
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    backgroundColor: '#F9F7F7',
    borderBottomWidth: 0.5,
    borderBottomColor: '#3F72AF', // Medium blue border for accent
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    textAlign: 'left',
    marginBottom: 2,
    fontWeight: '700',
    fontSize: 16,
  },
  headerMeta: {
    textAlign: 'left',
    lineHeight: 18,
    fontSize: 12,
    opacity: 0.8,
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
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginBottom: 16,
    color: '#1A1A1A',
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
  
  heroBanner: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    opacity: 0.8,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  heroBtn: {
    borderRadius: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  quickActionsRowScroll: {
    paddingHorizontal: 16,
  },
  quickChip: {
    borderRadius: 16,
  },
  quickChipMargin: {
    marginRight: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  badgeChip: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
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
});

export default ServicesScreen;