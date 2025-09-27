/**
 * Service Image Component
 * 
 * Handles service image display with loading states and fallbacks.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { BaseComponentProps } from '../../types';

interface ServiceImageProps extends BaseComponentProps {
  imageUri?: string;
  fallbackImage?: any;
  height?: number;
  borderRadius?: number;
}

export const ServiceImage: React.FC<ServiceImageProps> = ({
  imageUri,
  fallbackImage,
  height = 200,
  borderRadius = 12,
  testID = 'service-image',
  accessibilityLabel = 'Service image',
  accessibilityRole = 'image',
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const imageSource = error || !imageUri ? fallbackImage : { uri: imageUri };

  return (
    <View 
      style={[
        styles.container, 
        { 
          height, 
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant 
        }
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary}
            testID={`${testID}-loading`}
          />
        </View>
      )}
      
      <Image
        source={imageSource}
        style={[
          styles.image,
          { borderRadius }
        ]}
        resizeMode="cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        testID={`${testID}-img`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
