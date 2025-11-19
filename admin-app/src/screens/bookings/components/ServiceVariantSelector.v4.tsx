/**
 * Service Variant Selector Component - Version 4
 * Uses react-native-dropdown-picker
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
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
  const [open, setOpen] = useState(false);
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const items = useMemo(() => {
    return variants.map(variant => ({
      label: variant.title,
      value: variant.id,
      variant: variant, // Store full variant object
    }));
  }, [variants]);

  const selectedValue = selectedVariant?.id || null;

  const handleValueChange = (value: string | null) => {
    if (value) {
      const variant = variants.find(v => v.id === value);
      if (variant) {
        onSelectVariant(variant);
      }
    }
  };

  if (!serviceId) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Variant *
        </Text>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <ActivityIndicator size="small" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant, marginLeft: 8 }]}>
            Loading variants...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Variant *
        </Text>
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (variants.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Variant *
        </Text>
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            No variants available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Variant *
      </Text>
      <DropDownPicker
        open={open}
        value={selectedValue}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => {
          const newValue = typeof callback === 'function' ? callback(selectedValue) : callback;
          handleValueChange(newValue);
        }}
        placeholder="Select Service Variant"
        loading={loading}
        disabled={loading || variants.length === 0}
        style={[
          styles.dropdown,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
        dropDownContainerStyle={[
          styles.dropdownContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
        textStyle={{
          color: theme.colors.onSurface,
          fontSize: 14,
        }}
        placeholderStyle={{
          color: theme.colors.onSurfaceVariant,
        }}
        listItemLabelStyle={{
          color: theme.colors.onSurface,
        }}
        selectedItemLabelStyle={{
          color: theme.colors.primary,
          fontWeight: '600',
        }}
        zIndex={1000}
        zIndexInverse={1000}
        listMode="MODAL"
        modalProps={{
          animationType: 'fade',
        }}
        modalTitle="Select Service Variant"
        modalAnimationType="fade"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 4,
    minHeight: 56,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 4,
    maxHeight: 300,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 4,
    minHeight: 56,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 4,
    minHeight: 56,
  },
  errorText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 16,
    borderRadius: 4,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

