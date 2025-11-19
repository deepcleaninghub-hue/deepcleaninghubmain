/**
 * Service Variant Selector Component - New Improved Version
 * Features:
 * - Uses data cache
 * - Robust menu state management
 * - Better error handling
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Menu, useTheme, ActivityIndicator } from 'react-native-paper';
import { dataCache, ServiceVariant } from '@/services/dataCache';

interface ServiceVariantSelectorProps {
  selectedVariant: ServiceVariant | null;
  onSelectVariant: (variant: ServiceVariant) => void;
  serviceId: string;
}

export function ServiceVariantSelector({
  selectedVariant,
  onSelectVariant,
  serviceId,
}: ServiceVariantSelectorProps) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuClosingRef = useRef(false);

  // Load variants from cache when service changes
  useEffect(() => {
    let mounted = true;
    
    const loadVariants = async () => {
      if (!serviceId) {
        if (mounted) {
          setVariants([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const cachedVariants = await dataCache.getServiceVariants(serviceId);
        if (mounted) {
          setVariants(cachedVariants);
        }
      } catch (err: any) {
        console.error('Error loading variants:', err);
        if (mounted) {
          setError(err.message || 'Failed to load variants');
          setVariants([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadVariants();

    return () => {
      mounted = false;
    };
  }, [serviceId]);

  const displayText = useMemo(() => {
    if (loading) return 'Loading variants...';
    if (error) return 'Error loading variants';
    if (selectedVariant) return selectedVariant.title;
    if (variants.length === 0) return 'No variants available';
    return 'Select Service Variant';
  }, [loading, error, selectedVariant, variants.length]);

  const handleOpenMenu = useCallback(() => {
    if (loading || variants.length === 0) {
      return;
    }
    // Use functional update to ensure we have latest state
    setMenuVisible((prevVisible) => {
      return prevVisible ? prevVisible : true;
    });
  }, [loading, variants.length]);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
    menuClosingRef.current = false;
  }, []);

  const handleSelectVariant = useCallback((variant: ServiceVariant) => {
    setMenuVisible(false);
    menuClosingRef.current = false;
    onSelectVariant(variant);
  }, [onSelectVariant]);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Variant *
      </Text>
      {loading ? (
        <Button mode="outlined" disabled style={styles.button} contentStyle={styles.buttonContent}>
          <ActivityIndicator size="small" />
          <Text style={{ marginLeft: 8 }}>Loading variants...</Text>
        </Button>
      ) : error ? (
        <Button mode="outlined" disabled style={styles.button} contentStyle={styles.buttonContent}>
          Error loading variants
        </Button>
      ) : (
        <Menu
          visible={menuVisible}
          onDismiss={() => {
            setMenuVisible(false);
            menuClosingRef.current = false;
          }}
          anchor={
            <Button
              mode="outlined"
              onPress={() => {
                setMenuVisible((prev) => !prev);
              }}
              style={styles.button}
              contentStyle={styles.buttonContent}
              disabled={variants.length === 0}
            >
              {displayText}
            </Button>
          }
        >
          {variants.length === 0 ? (
            <Menu.Item
              onPress={handleCloseMenu}
              title="No variants available"
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
      )}
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

