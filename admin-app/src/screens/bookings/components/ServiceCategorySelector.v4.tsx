/**
 * Service Category Selector Component - Version 4
 * Uses react-native-dropdown-picker
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { dataCache, ServiceCategory } from '@/services/dataCache';

interface ServiceCategorySelectorProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export function ServiceCategorySelector({
  selectedCategoryId,
  onSelectCategory,
}: ServiceCategorySelectorProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories from cache on mount
  useEffect(() => {
    let mounted = true;
    
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const cachedCategories = await dataCache.getServiceCategories();
        if (mounted) {
          setCategories(cachedCategories);
        }
      } catch (err: any) {
        console.error('Error loading categories:', err);
        if (mounted) {
          setError(err.message || 'Failed to load categories');
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const items = useMemo(() => {
    return categories.map(category => ({
      label: category.title,
      value: category.id,
    }));
  }, [categories]);

  const handleValueChange = (value: string | null) => {
    if (value) {
      onSelectCategory(value);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Category *
        </Text>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <ActivityIndicator size="small" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant, marginLeft: 8 }]}>
            Loading categories...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Category *
        </Text>
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Category *
      </Text>
      <DropDownPicker
        open={open}
        value={selectedCategoryId || null}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => {
          const newValue = typeof callback === 'function' ? callback(selectedCategoryId || null) : callback;
          handleValueChange(newValue);
        }}
        placeholder="Select Service Category"
        loading={loading}
        disabled={loading || categories.length === 0}
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
        zIndex={3000}
        zIndexInverse={1000}
        listMode="MODAL"
        modalProps={{
          animationType: 'fade',
        }}
        modalTitle="Select Service Category"
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
});

