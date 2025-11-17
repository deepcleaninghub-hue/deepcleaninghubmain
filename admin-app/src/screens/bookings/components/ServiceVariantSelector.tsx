/**
 * Service Variant Selector Component
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Menu, useTheme } from 'react-native-paper';

export interface ServiceVariant {
  id: string;
  service_id: string;
  title: string;
  description?: string;
  price?: number;
  unitPrice?: number;
  unitMeasure?: string;
  pricingType?: 'fixed' | 'per_unit' | 'hourly';
  minMeasurement?: number;
  maxMeasurement?: number;
  measurementStep?: number;
  measurementPlaceholder?: string;
  duration?: number;
  is_active?: boolean;
  display_order?: number;
}

interface ServiceVariantSelectorProps {
  variants: ServiceVariant[];
  selectedVariant: ServiceVariant | null;
  onSelectVariant: (variant: ServiceVariant) => void;
  loading?: boolean;
}

export function ServiceVariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
  loading = false,
}: ServiceVariantSelectorProps) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Variant *
      </Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.button}
            contentStyle={styles.buttonContent}
            disabled={loading || variants.length === 0}
            loading={loading}
          >
            {loading
              ? 'Loading variants...'
              : selectedVariant
              ? selectedVariant.title
              : variants.length === 0
              ? 'No variants available'
              : 'Select Service Variant'}
          </Button>
        }
      >
        {variants.length === 0 ? (
          <Menu.Item
            onPress={() => setMenuVisible(false)}
            title={loading ? 'Loading...' : 'No variants available'}
            disabled
          />
        ) : (
          variants.map((variant) => (
            <Menu.Item
              key={variant.id}
              onPress={() => {
                onSelectVariant(variant);
                setMenuVisible(false);
              }}
              title={variant.title}
            />
          ))
        )}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    justifyContent: 'space-between',
  },
});

