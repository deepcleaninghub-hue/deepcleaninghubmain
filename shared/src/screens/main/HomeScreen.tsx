/**
 * Home Screen
 * 
 * Main home screen of the DeepClean Mobile Hub app.
 * This will be the first screen users see after authentication.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { ImageCarousel } from '../../components/ImageCarousel';
import { EnhancedLanguageSelector } from '../../components/EnhancedLanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import { HomeStackScreenProps } from '../../navigation/types';

type Props = HomeStackScreenProps<'HomeMain'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { t, languageChangeKey } = useLanguage();
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);

  const handleChangeLanguage = () => {
    setLanguageSelectorVisible(true);
  };

  // Carousel images data - real cleaning service images
  const carouselImages = [
    {
      id: '1',
      uri: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f4f4b1?w=800&h=400&fit=crop',
      title: t('home.welcome'),
      description: t('home.subtitle'),
    },
    {
      id: '2',
      uri: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f4f4b1?w=800&h=400&fit=crop',
      title: t('home.carousel.professional'),
      description: t('home.carousel.professionalDesc'),
    },
    {
      id: '3',
      uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
      title: t('home.carousel.deepCleaning'),
      description: t('home.carousel.deepCleaningDesc'),
    },
    {
      id: '4',
      uri: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f4f4b1?w=800&h=400&fit=crop',
      title: t('home.carousel.reliable'),
      description: t('home.carousel.reliableDesc'),
    },
    {
      id: '5',
      uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
      title: t('home.carousel.quality'),
      description: t('home.carousel.qualityDesc'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader
          title={t('app.title')}
          showBack={false}
          showLogo={true}
        />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Welcome & Features Section */}
          <Card style={[styles.welcomeCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.welcomeContent}>
              {/* Welcome Header */}
              <View style={styles.welcomeHeader}>
                <View style={styles.welcomeTextContainer}>
                  <Text 
                    variant="headlineSmall" 
                    style={[styles.welcomeTitle, { color: theme.colors.onSurface }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    {t('home.welcome')}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.welcomeSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                    {t('home.subtitle')}
                  </Text>
                </View>
              </View>

              {/* Language Change Button */}
              <View style={styles.welcomeLanguageContainer}>
                <Button
                  mode="outlined"
                  onPress={handleChangeLanguage}
                  style={[styles.welcomeLanguageButton, { borderColor: theme.colors.primary }]}
                  contentStyle={styles.welcomeLanguageButtonContent}
                  labelStyle={[styles.welcomeLanguageButtonLabel, { color: theme.colors.primary }]}
                  icon={() => <Ionicons name="globe" size={16} color={theme.colors.primary} />}
                  compact
                >
                  {t('common.changeLanguage')}
                </Button>
              </View>

            </Card.Content>
          </Card>

          {/* Image Carousel with Overlay Button */}
          <View style={styles.carouselContainer}>
            <ImageCarousel 
              images={carouselImages}
              height={350}
              autoPlay={true}
              autoPlayInterval={4000}
              showText={true}
            />
            {/* Overlay Button */}
            <View style={styles.overlayButtonContainer}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Services' as any)}
                style={styles.overlayButton}
                contentStyle={styles.overlayButtonContent}
                labelStyle={styles.overlayButtonLabel}
                icon={() => <Ionicons name="briefcase" size={16} color="white" />}
                compact
              >
                {t('home.ourServices')}
              </Button>
            </View>
          </View>

          {/* CTA Section */}
          <View style={[styles.ctaContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <View style={styles.ctaContent}>
              <View style={styles.ctaHeader}>
                <Ionicons name="phone-portrait" size={32} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={[styles.ctaTitle, { color: theme.colors.onPrimaryContainer }]}>
                  {t('home.cta.title')}
                </Text>
              </View>
              <Text variant="bodyMedium" style={[styles.ctaSubtitle, { color: theme.colors.onPrimaryContainer }]}>
                {t('home.cta.subtitle')}
              </Text>
              
              <View style={styles.ctaButtonsContainer}>
                <Button
                  mode="contained"
                  onPress={() => {
                    // Handle call action
                    console.log('Call button pressed');
                  }}
                  style={[styles.ctaButton, styles.callButton, { backgroundColor: theme.colors.primary }]}
                  contentStyle={styles.ctaButtonContent}
                  labelStyle={[styles.ctaButtonLabel, { color: theme.colors.onPrimary }]}
                  icon={() => <Ionicons name="call" size={18} color={theme.colors.onPrimary} />}
                  >
                    {t('home.cta.callNow')}
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => {
                      // Handle WhatsApp action
                      console.log('WhatsApp button pressed');
                    }}
                    style={[styles.ctaButton, styles.whatsappButton, { backgroundColor: '#25D366' }]}
                    contentStyle={styles.ctaButtonContent}
                    labelStyle={[styles.ctaButtonLabel, { color: 'white' }]}
                    icon={() => <Ionicons name="logo-whatsapp" size={18} color="white" />}
                  >
                    {t('home.cta.whatsapp')}
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => {
                      // Handle inquire action
                      console.log('Inquire button pressed');
                    }}
                    style={[styles.ctaButton, styles.inquireButton, { backgroundColor: theme.colors.secondary }]}
                    contentStyle={styles.ctaButtonContent}
                    labelStyle={[styles.ctaButtonLabel, { color: theme.colors.onSecondary }]}
                    icon={() => <Ionicons name="mail" size={18} color={theme.colors.onSecondary} />}
                  >
                    {t('home.cta.inquire')}
                  </Button>
              </View>
            </View>
          </View>

          {/* Features Section */}
          <Card style={[styles.featuresCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.featuresContent}>
              <Text variant="headlineSmall" style={[styles.featuresTitle, { color: theme.colors.onSurface }]}>
                {t('home.features.title')}
              </Text>
              <View style={styles.featuresGrid}>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onPrimaryContainer }]}>
                    {t('home.features.trusted')}
                  </Text>
                </View>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.secondaryContainer }]}>
                  <Ionicons name="star" size={20} color={theme.colors.secondary} />
                  <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onSecondaryContainer }]}>
                    {t('home.features.quality')}
                  </Text>
                </View>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.tertiaryContainer }]}>
                  <Ionicons name="time" size={20} color={theme.colors.tertiary} />
                  <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onTertiaryContainer }]}>
                    {t('home.features.onTime')}
                  </Text>
                </View>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.errorContainer }]}>
                  <Ionicons name="heart" size={20} color={theme.colors.error} />
                  <Text variant="bodySmall" style={[styles.featureText, { color: theme.colors.onErrorContainer }]}>
                    {t('home.features.customerFirst')}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <EnhancedLanguageSelector
        key={`language-selector-${languageChangeKey}`}
        visible={languageSelectorVisible}
        onDismiss={() => setLanguageSelectorVisible(false)}
      />
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
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  welcomeCard: {
    elevation: 3,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  welcomeContent: {
    padding: 12,
  },
  welcomeHeader: {
    marginBottom: 8,
    alignItems: 'center',
  },
  welcomeTextContainer: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    lineHeight: 22,
    opacity: 0.8,
    textAlign: 'center',
  },
  welcomeLanguageContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  welcomeLanguageButton: {
    borderRadius: 8,
    borderWidth: 1.5,
  },
  welcomeLanguageButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  welcomeLanguageButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaContainer: {
    marginHorizontal: 0,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  ctaTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  ctaSubtitle: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  ctaButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  ctaButton: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  callButton: {
    // Primary color already set
  },
  whatsappButton: {
    // WhatsApp color already set
  },
  inquireButton: {
    // Secondary color already set
  },
  ctaButtonContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  ctaButtonLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  featuresCard: {
    elevation: 3,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  featuresContent: {
    padding: 24,
  },
  featuresTitle: {
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    elevation: 1,
  },
  featureText: {
    fontWeight: '600',
    fontSize: 12,
    flex: 1,
  },
  carouselContainer: {
    position: 'relative',
    marginHorizontal: 0,
  },
  overlayButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayButton: {
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  overlayButtonContent: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  overlayButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  placeholderCard: {
    elevation: 1,
    borderRadius: 12,
    flex: 1,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderIcon: {
    marginBottom: 16,
  },
  placeholderText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeScreen;
