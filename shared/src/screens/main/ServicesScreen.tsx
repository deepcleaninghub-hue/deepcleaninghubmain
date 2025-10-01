// Enhanced with new color palette: #F9F7F7, #DBE2EF, #3F72AF, #112D4E
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Linking,
} from 'react-native';
import { Text, Card, Button, Chip, useTheme, ActivityIndicator, TextInput, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import ServiceCard from '../../components/Service/ServiceCard';
import { servicesAPI } from '../../services/api';
import { serviceOptionsAPI } from '../../services/serviceOptionsAPI';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AutoTranslateText from '../../components/AutoTranslateText';
import { ServicesStackScreenProps } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppModal from '../../components/common/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = ServicesStackScreenProps<'ServicesMain'>;

const ServicesScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const { t, translateDynamicText } = useLanguage();
  const { modalConfig, visible, hideModal, showError } = useAppModal();
  const [services, setServices] = useState<any[]>([]);
  const [serviceOptions, setServiceOptions] = useState<any[]>([]);
  const [allServiceOptions, setAllServiceOptions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [translatedCategories, setTranslatedCategories] = useState<{[key: string]: string}>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showServiceOptions, setShowServiceOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Function to translate categories
  const translateCategories = async (categoryTitles: string[]) => {
    const translated: {[key: string]: string} = {};
    for (const title of categoryTitles) {
      try {
        const translatedTitle = await translateDynamicText(title);
        translated[title] = translatedTitle;
      } catch (error) {
        // Fallback to original title if translation fails
        translated[title] = title;
      }
    }
    setTranslatedCategories(translated);
  };

  // Fetch services and categories from API
  useEffect(() => {
    fetchData();
    restoreUIState();
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch main services for categories
      const servicesData = await servicesAPI.getAllServices();
      setServices(servicesData);
      
      // Fetch all service options for default (no category selected)
      const fetchedAllOptions = await serviceOptionsAPI.getAllServiceOptions();
      setServiceOptions(fetchedAllOptions);
      setAllServiceOptions(fetchedAllOptions);
      
      // Use service titles as categories (no explicit "All" chip)
      const serviceTitles = [...servicesData.map(service => service.title)];
      setCategories(serviceTitles);
      
      // Translate categories for display
      await translateCategories(serviceTitles);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError(t('common.error'), t('services.loadingServices'));
    } finally {
      setLoading(false);
    }
  };

  const restoreUIState = async () => {
    try {
      const [storedCategory] = await Promise.all([
        AsyncStorage.getItem('services:selectedCategory'),
      ]);
      if (storedCategory) setSelectedCategory(storedCategory);
    } catch (e) {
      // ignore restore errors
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const servicesData = await servicesAPI.getAllServices();
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      showError(t('common.error'), t('services.failedToLoadServices'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Handle category selection
  const handleCategorySelect = async (category: string) => {
    // Toggle selection: if already selected, clear to default (all)
    if (selectedCategory === category) {
      setSelectedCategory('');
      setServiceOptions(allServiceOptions);
      return;
    }

    setSelectedCategory(category);

    // Find the selected service to get its ID
    const selectedService = services.find(service => service.title === category);
    if (selectedService) {
      try {
        setLoading(true);
        const options = await serviceOptionsAPI.getServiceOptionsByCategory(selectedService.id);
        setServiceOptions(options);
      } catch (error) {
        console.error('Error fetching service options:', error);
        showError(t('common.error'), t('services.failedToLoadServiceOptions'));
        setServiceOptions([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredServices = selectedCategory === '' 
    ? services 
    : services.filter(service => service.title === selectedCategory);

  const filteredServiceOptions = serviceOptions.filter(option => {
    // Filter by category
    const categoryMatch = selectedCategory === '' || option.services?.title === selectedCategory;
    
    // Filter by search query
    const q = (debouncedSearch || '').toLowerCase();
    const searchMatch = q === '' || 
      (option.title ? option.title.toLowerCase().includes(q) : false) ||
      (option.description ? option.description.toLowerCase().includes(q) : false) ||
      (option.services?.title ? option.services.title.toLowerCase().includes(q) : false) ||
      (option.services?.category ? option.services.category.toLowerCase().includes(q) : false);
    
    return categoryMatch && searchMatch;
  });

  const handleBookService = (service: any) => {
    // Navigate to booking screen
    console.log('Book service:', service.title);
  };

  const handleCallNow = () => {
    Linking.openURL('tel:+4916097044182').catch(() => {
      showError(t('common.error'), t('services.couldNotOpenPhoneApp'));
    });
  };

  const handleGetInTouch = () => {
    navigation.navigate('Contact');
  };

  const openWhatsAppSupport = async () => {
    try {
      const adminPhone = '+4916097044182';
      const appUrl = `whatsapp://send?phone=${encodeURIComponent(adminPhone)}`;
      const webUrl = `https://wa.me/${encodeURIComponent(adminPhone.replace(/[^\d]/g, ''))}`;

      const canOpen = await Linking.canOpenURL(appUrl);
      if (canOpen) {
        await Linking.openURL(appUrl);
        return;
      }
      await Linking.openURL(webUrl);
    } catch (e) {
      showError(t('services.support'), t('services.unableToOpenWhatsApp'));
    }
  };

  const clearFilters = async () => {
    setSelectedCategory('');
    setServiceOptions(allServiceOptions);
    try { await AsyncStorage.setItem('services:selectedCategory', ''); } catch {}
  };

  // Simple featured/recommended derivations
  const featured = allServiceOptions.slice(0, 8);
  const recommended = allServiceOptions.slice(0, 8);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Deep Cleaning Hub" />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Header Section */}
        {/* <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <Text variant="titleMedium" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>{t('services.title')}</Text>
          </View>
          <Text
            variant="bodySmall"
            style={[styles.headerMeta, { color: theme.colors.onSurfaceVariant }]}
          >
            {filteredServiceOptions.length} {t('services.options')} • {selectedCategory ? (translatedCategories[selectedCategory] || selectedCategory) : t('services.all')}
          </Text>
        </View> */}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            mode="outlined"
            placeholder={t('services.searchServices')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { backgroundColor: theme.colors.surface }]}
            left={<TextInput.Icon icon="magnify" color={theme.colors.onSurfaceVariant} />}
            right={searchQuery ? (
              <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} color={theme.colors.onSurfaceVariant} />
            ) : undefined}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.onSurface}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            returnKeyType="done"
            blurOnSubmit={true}
          />
        </View>

        {/* Services - compact carousel */}
        <View style={styles.servicesCarouselSection}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>{t('services.serviceOptions')}</Text>
          </View>
          
          {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <Button mode="text" onPress={clearFilters} style={styles.clearFiltersBtn}>{t('services.clear')}</Button>
            {(categories || []).map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <Chip
                key={category}
                mode={isSelected ? 'flat' : 'outlined'}
                selected={isSelected}
                onPress={() => handleCategorySelect(category)}
                style={[
                  styles.categoryChip,
                  isSelected ? { backgroundColor: theme.colors.primary } : { borderColor: theme.colors.primary }
                ]}
                textStyle={{ color: isSelected ? theme.colors.onPrimary : theme.colors.primary }}
                >
                  {translatedCategories[category] || category}
                </Chip>
              );
            })}
          </ScrollView>
        </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
                {t('services.loadingServicesText')}
              </Text>
            </View>
          ) : filteredServiceOptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={theme.colors.outline} />
              <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                {searchQuery ? t('services.noSearchResults') : t('services.noServiceOptionsFound')}
              </Text>
              <Text variant="bodyLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                {searchQuery 
                  ? `${t('services.noServicesFoundForQuery')} "${searchQuery}"`
                  : selectedCategory === t('services.all') 
                  ? t('services.noServiceOptionsAvailable') 
                  : `${t('services.noOptionsAvailableFor')} ${translatedCategories[selectedCategory] || selectedCategory}`
                }
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselList}>
              {filteredServiceOptions.map((option) => (
                <View key={option.id || Math.random().toString()} style={{ width: 260, marginRight: 12 }}>
                  <ServiceCard
                    id={option.id || ''}
                    title={option.title || ''}
                    description={option.description || ''}
                    image={option.services?.image_url || 'https://via.placeholder.com/300x200'}
                    price={option.price}
                    duration={option.duration || ''}
                    category={option.services?.category || ''}
                    pricing_type={option.pricing_type}
                    unit_price={option.unit_price}
                    unit_measure={option.unit_measure}
                    min_measurement={option.min_measurement}
                    max_measurement={option.max_measurement}
                    measurement_step={option.measurement_step}
                    measurement_placeholder={option.measurement_placeholder}
                    service_id={option.service_id}
                    compact
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>
        
        
  

        {/* Recommended */}
        <View style={styles.sectionHeaderRow}>
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>{t('services.recommendedForYou')}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselList}>
          {recommended.map((option) => (
            <View key={`r-${option.id || Math.random().toString()}`} style={{ width: 260, marginRight: 12 }}>
              <ServiceCard
                id={option.id || ''}
                title={option.title || ''}
                description={option.description || ''}
                image={option.services?.image_url || 'https://via.placeholder.com/300x200'}
                price={option.price}
                duration={option.duration || ''}
                category={option.services?.category || ''}
                pricing_type={option.pricing_type}
                unit_price={option.unit_price}
                unit_measure={option.unit_measure}
                min_measurement={option.min_measurement}
                max_measurement={option.max_measurement}
                measurement_step={option.measurement_step}
                measurement_placeholder={option.measurement_placeholder}
                service_id={option.service_id}
                compact
              />
            </View>
          ))}
        </ScrollView>

        {/* Call to Action */}
        <Card style={[styles.ctaCard, { backgroundColor: theme.colors.surfaceVariant }] }>
          <Card.Content style={styles.ctaContent}>
            <View style={styles.ctaBadgeRow}>
              <View style={[styles.ctaIconCircle, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="sparkles" size={16} color={theme.colors.onPrimary} />
              </View>
              <Text style={[styles.ctaBadge, { color: theme.colors.primary }]}>{t('services.customQuotesFast')}</Text>
            </View>
            <Text variant="titleLarge" style={[styles.ctaTitle, { color: theme.colors.onSurface }]}>
              {t('services.needTailoredEstimate')}
            </Text>
            <Text variant="bodyMedium" style={[styles.ctaDescription, { color: theme.colors.onSurfaceVariant }]}>
              {t('services.tellUsRequirements')}
            </Text>
            <View style={styles.ctaButtons}>
              <Button
                mode="contained"
                onPress={handleGetInTouch}
                style={[styles.ctaPrimary, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.ctaPrimaryContent}
                icon={({ size, color }) => (
                  <Ionicons name="chatbubbles" size={size} color={color} />
                )}
              >
                {t('services.getQuote')}
              </Button>
              <Button
                mode="outlined"
                onPress={handleCallNow}
                style={[styles.ctaSecondary, { borderColor: theme.colors.primary }]}
                textColor={theme.colors.primary}
                contentStyle={styles.ctaSecondaryContent}
                icon={({ size, color }) => (
                  <Ionicons name="call" size={size} color={color} />
                )}
              >
                {t('services.call')}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      <FAB
        icon="message"
        label={t('services.help')}
        style={styles.supportFab}
        onPress={openWhatsAppSupport}
      />

      {/* App Modal */}
      <AppModal
        visible={visible}
        onDismiss={hideModal}
        title={modalConfig?.title || ''}
        message={modalConfig?.message || ''}
        type={modalConfig?.type}
        showCancel={modalConfig?.showCancel}
        confirmText={modalConfig?.confirmText}
        cancelText={modalConfig?.cancelText}
        onConfirm={modalConfig?.onConfirm}
        onCancel={modalConfig?.onCancel}
        icon={modalConfig?.icon}
        showCloseButton={modalConfig?.showCloseButton}
      />
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
    marginTop: 12,
    marginBottom: 16,
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
  
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    marginRight: 12,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  clearFiltersBtn: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  servicesCarouselSection: {
    paddingVertical: 8,
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 12,
    gap: 12,
  },
  compactCard: {
    width: 240,
    marginRight: 12,
    borderRadius: 14,
  },
  compactInner: {
    overflow: 'hidden',
    borderRadius: 14,
  },
  compactImage: {
    height: 120,
  },
  compactContent: {
    paddingTop: 8,
  },
  compactButtons: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  compactPrimaryBtn: {
    borderRadius: 10,
    flexGrow: 1,
  },
  compactSecondaryBtn: {
    borderRadius: 10,
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
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  badgeChip: {
    borderRadius: 12,
  },
  supportFab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  ctaCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#112D4E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  ctaContent: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  ctaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  ctaIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBadge: {
    fontWeight: '700',
  },
  ctaTitle: {
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '700',
    fontSize: 16,
  },
  ctaDescription: {
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
    fontSize: 12,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  ctaPrimary: {
    flex: 1,
    borderRadius: 12,
  },
  ctaPrimaryContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctaSecondary: {
    flex: 1,
    borderRadius: 12,
  },
  ctaSecondaryContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});

export default ServicesScreen;