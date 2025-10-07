import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { useLanguage } from '../contexts/LanguageContext';

interface ServiceCardsProps {
  onServicePress: (categoryId: string, categoryTitle: string) => void;
}

const ServiceCards: React.FC<ServiceCardsProps> = ({ onServicePress }) => {
  const theme = useTheme();
  const { t } = useLanguage();

  // Main service categories for navigation
  const mainServiceCategories = [
    {
      id: 'furniture-disassembly',
      title: t('services.furnitureDisassembly'),
      image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f4f4b1?w=400&h=300&fit=crop&q=80'
    },
    {
      id: 'moving',
      title: t('services.moving'),
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80'
    },
    {
      id: 'cleaning',
      title: t('services.cleaning'),
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80'
    },
    {
      id: 'office-setup',
      title: t('services.officeSetup'),
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80'
    },
    {
      id: 'furniture-assembly',
      title: t('services.furnitureAssembly'),
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&q=80'
    },
    {
      id: 'house-painting',
      title: t('services.housePainting'),
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&q=80'
    }
  ];

  const handleServiceCategoryPress = (categoryId: string, categoryTitle: string) => {
    // Map the translated title back to the original English category name
    const categoryMapping: {[key: string]: string} = {
      [t('services.cleaning')]: 'Cleaning',
      [t('services.furnitureAssembly')]: 'Furniture Assembly',
      [t('services.furnitureDisassembly')]: 'Furniture Disassembly',
      [t('services.moving')]: 'Moving',
      [t('services.officeSetup')]: 'Office Setup',
      [t('services.housePainting')]: 'House Painting',
    };
    
    const originalCategoryTitle = categoryMapping[categoryTitle] || categoryTitle;
    onServicePress(categoryId, originalCategoryTitle);
  };

  return (
    <View style={styles.serviceCategoriesSection}>
      <Divider style={{ marginVertical: 16 }} />
      <Text variant="titleMedium" style={[styles.categoriesTitle, { color: theme.colors.onSurface }]}>
        {t('cart.addMoreServices')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollContent}
        style={styles.categoriesScroll}
      >
        {mainServiceCategories.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCategoryCard,
              { backgroundColor: theme.colors.surface }
            ]}
            activeOpacity={0.8}
            onPress={() => handleServiceCategoryPress(service.id, service.title)}
          >
            <View style={styles.categoryImageContainer}>
              <Image 
                source={{ uri: service.image }} 
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
                {service.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ServiceCards;
