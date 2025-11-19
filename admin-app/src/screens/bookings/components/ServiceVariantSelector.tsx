/**
 * Service Variant Selector Component - DEPRECATED
 * Use ServiceVariantSelector.new.tsx instead
 * @deprecated
 */

import React, { useState, useCallback, useEffect } from 'react';
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

  const handleOpenMenu = useCallback(() => {
    // Don't open if already visible or loading
    if (menuVisible || loading) {
      return;
    }
    // Use setTimeout to ensure state update happens after render
    setTimeout(() => {
      setMenuVisible(true);
    }, 0);
  }, [menuVisible, loading]);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleSelectVariant = useCallback((variant: ServiceVariant) => {
    onSelectVariant(variant);
    setMenuVisible(false);
  }, [onSelectVariant]);

  // Ensure menu closes when loading changes or variants become empty
  useEffect(() => {
    if ((loading || variants.length === 0) && menuVisible) {
      setMenuVisible(false);
    }
  }, [loading, variants.length, menuVisible]);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Variant *
      </Text>
      <Menu
        visible={menuVisible}
        onDismiss={handleCloseMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={() => {
              if (!loading && variants.length > 0) {
                handleOpenMenu();
              }
            }}
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
            onPress={handleCloseMenu}
            title={loading ? 'Loading...' : 'No variants available'}
            disabled
          />
        ) : (
          variants.map((variant) => (
            <Menu.Item
              key={variant.id}
              onPress={() => handleSelectVariant(variant)}
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

