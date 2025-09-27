/**
 * Service Content Component
 * 
 * Displays service title, description, and pricing information.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Service, BaseComponentProps } from '../../types';

interface ServiceContentProps extends BaseComponentProps {
  service: Service;
  showPricing?: boolean;
}

export const ServiceContent: React.FC<ServiceContentProps> = ({
  service,
  showPricing = true,
  testID = 'service-content',
  accessibilityLabel = 'Service information',
}) => {
  const theme = useTheme();

  const getDisplayPrice = () => {
    if (service.pricingType === 'per_unit' && service.unitPrice) {
      return `€${service.unitPrice.toFixed(2)}/${service.unitMeasure}`;
    }
    if (service.serviceVariants.length > 1) {
      return `From €${(service.price || 0).toFixed(2)}`;
    }
    return `€${(service.price || 0).toFixed(2)}`;
  };

  const getPricingSubtext = () => {
    if (service.pricingType === 'per_unit' && service.unitMeasure) {
      return `Per ${service.unitMeasure}`;
    }
    if (service.serviceVariants.length > 1) {
      return `${service.serviceVariants.length} options available`;
    }
    return null;
  };

  return (
    <View 
      style={styles.container}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <Text 
        variant="titleMedium" 
        style={[styles.title, { color: theme.colors.onSurface }]}
        testID={`${testID}-title`}
        numberOfLines={2}
      >
        {service.title}
      </Text>
      
      <Text 
        variant="bodyMedium" 
        style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        testID={`${testID}-description`}
        numberOfLines={3}
      >
        {service.description}
      </Text>
      
      {showPricing && service.price !== undefined && (
        <View style={styles.pricingContainer}>
          <View style={styles.pricingInfo}>
            <Text 
              variant="titleLarge" 
              style={[styles.price, { color: theme.colors.primary }]}
              testID={`${testID}-price`}
            >
              {getDisplayPrice()}
            </Text>
          </View>
          {service.duration && (
            <Text 
              variant="bodySmall" 
              style={[styles.duration, { color: theme.colors.onSurfaceVariant }]}
              testID={`${testID}-duration`}
            >
              {service.duration}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingInfo: {
    flex: 1,
  },
  price: {
    fontWeight: '700',
  },
  pricingSubtext: {
    marginTop: 2,
  },
  duration: {
    fontStyle: 'italic',
  },
});
