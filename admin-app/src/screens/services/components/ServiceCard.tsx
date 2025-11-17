/**
 * Service Card Component
 * Displays a service with image, details, and actions
 */

import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, IconButton, useTheme } from 'react-native-paper';
import { AdminService } from '@/types';

interface ServiceCardProps {
  service: AdminService;
  onPress: (service: AdminService) => void;
  onEdit?: (service: AdminService) => void;
  getImageSource?: (service: AdminService) => any;
}

export function ServiceCard({ service, onPress, onEdit, getImageSource }: ServiceCardProps) {
  const theme = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const imageSource = getImageSource ? getImageSource(service) : { uri: 'https://via.placeholder.com/300x200?text=Service' };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      activeOpacity={0.8}
      onPress={() => onPress(service)}
    >
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
        <Image
          source={imageSource}
          style={styles.image}
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface, flex: 1 }]}>
            {service.title}
          </Text>
          {onEdit && (
            <IconButton
              icon="pencil"
              size={20}
              iconColor={theme.colors.primary}
              onPress={() => onEdit(service)}
              style={styles.editButton}
            />
          )}
        </View>
        {service.description && (
          <Text
            variant="bodySmall"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {service.description}
          </Text>
        )}
        {service.price !== undefined && (
          <Text variant="titleSmall" style={[styles.price, { color: theme.colors.primary }]}>
            {service.pricingType === 'hourly' ? `€${service.price}/hour` : `€${service.price.toFixed(2)}`}
          </Text>
        )}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.viewButtonContent}
            labelStyle={[styles.viewButtonLabel, { color: theme.colors.onPrimary }]}
            onPress={() => onPress(service)}
          >
            View Variants
          </Button>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  image: {
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
    backgroundColor: '#f0f0f0',
  },
  imageErrorText: {
    fontSize: 32,
    opacity: 0.5,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
    fontSize: 12,
  },
  price: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonContainer: {
    alignItems: 'center',
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
  editButton: {
    margin: 0,
  },
});

