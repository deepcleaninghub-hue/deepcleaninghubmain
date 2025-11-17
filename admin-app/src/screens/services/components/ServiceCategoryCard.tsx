/**
 * Service Category Card Component
 * Displays a service category with image and navigation
 */

import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { ServiceCategory } from '../hooks/useServiceCategories';

interface ServiceCategoryCardProps {
  category: ServiceCategory;
  onPress: (category: ServiceCategory) => void;
}

export function ServiceCategoryCard({ category, onPress }: ServiceCategoryCardProps) {
  const theme = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      activeOpacity={0.8}
      onPress={() => onPress(category)}
    >
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
        {category.image && (
          <Image
            source={category.image}
            style={styles.image}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}
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
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          {category.title}
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.viewButtonContent}
            labelStyle={[styles.viewButtonLabel, { color: theme.colors.onPrimary }]}
            onPress={() => onPress(category)}
          >
            View
          </Button>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
  image: {
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
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
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
    shadowOffset: { width: 0, height: 2 },
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
});

