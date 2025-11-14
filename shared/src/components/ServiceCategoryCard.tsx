import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ServiceCategoryCardProps {
  id: string;
  title: string;
  image: string | ImageSourcePropType;
  onPress: () => void;
  compact?: boolean; // For horizontal scroll in cart
  showButton?: boolean; // Whether to show the order button
}

const { width: screenWidth } = Dimensions.get('window');

const ServiceCategoryCard: React.FC<ServiceCategoryCardProps> = ({
  id,
  title,
  image,
  onPress,
  compact = false,
  showButton = true,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cardWidth = compact ? 160 : screenWidth * 0.45;
  const cardHeight = compact ? 120 : 180;

  return (
    <TouchableOpacity
      style={[
        styles.serviceCard,
        {
          backgroundColor: theme.colors.surface,
          width: cardWidth,
          height: cardHeight,
        },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
        <Image 
          source={typeof image === 'string' ? { uri: image } : image} 
          style={styles.serviceImage}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
        <View style={styles.imageOverlay} />
        {imageError && (
          <View style={styles.imageErrorContainer}>
            <Text style={[styles.imageErrorText, { color: theme.colors.onSurface }]}>
              📷
            </Text>
          </View>
        )}
      </View>
      <View style={styles.serviceContent}>
        <Text 
          variant={compact ? "bodyMedium" : "titleMedium"} 
          style={[
            styles.serviceTitle, 
            { color: theme.colors.onSurface },
            !showButton && styles.serviceTitleNoButton
          ]}
          numberOfLines={compact ? 1 : 2}
        >
          {title}
        </Text>
        {showButton && (
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              compact={compact}
              style={[
                styles.viewButton,
                { borderColor: '#3F72AF' },
                compact && styles.compactButton
              ]}
              contentStyle={compact ? styles.compactButtonContent : styles.buttonContent}
              labelStyle={[
                styles.buttonLabel,
                { color: '#3F72AF' },
                compact && styles.compactButtonLabel
              ]}
              onPress={onPress}
              icon="check"
            >
              {t('common.order')}
            </Button>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  serviceCard: {
    borderRadius: 12,
    marginHorizontal: 8,
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
  imageContainer: {
    position: 'relative',
    height: '60%',
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
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  imageErrorText: {
    fontSize: 24,
  },
  serviceContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  serviceTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  serviceTitleNoButton: {
    marginBottom: 0,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  viewButton: {
    borderRadius: 8,
    minWidth: 120,
    borderWidth: 1.5,
    borderColor: '#3F72AF',
    backgroundColor: 'transparent',
  },
  compactButton: {
    minWidth: 100,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#3F72AF',
    backgroundColor: 'transparent',
  },
  buttonContent: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  compactButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3F72AF',
    textAlign: 'center',
  },
  compactButtonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3F72AF',
    textAlign: 'center',
  },
});

export default ServiceCategoryCard;
