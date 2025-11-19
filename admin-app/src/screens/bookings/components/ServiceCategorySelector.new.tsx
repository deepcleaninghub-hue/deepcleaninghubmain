/**
 * Service Category Selector Component - New Improved Version
 * Features:
 * - Uses data cache
 * - Robust menu state management
 * - Better error handling
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Menu, useTheme, ActivityIndicator } from 'react-native-paper';
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const menuClosingRef = useRef(false);

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

  const selectedCategory = useMemo(() => {
    return categories.find((cat) => cat.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const displayText = useMemo(() => {
    if (loading) return 'Loading categories...';
    if (error) return 'Error loading categories';
    return selectedCategory ? selectedCategory.title : 'Select Service Category';
  }, [loading, error, selectedCategory]);

  const handleOpenMenu = useCallback(() => {
    if (loading || categories.length === 0) {
      return;
    }
    // Use functional update to ensure we have latest state
    setMenuVisible((prevVisible) => {
      return prevVisible ? prevVisible : true;
    });
  }, [loading, categories.length]);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
    menuClosingRef.current = false;
  }, []);

  const handleSelectCategory = useCallback((categoryId: string) => {
    setMenuVisible(false);
    menuClosingRef.current = false;
    onSelectCategory(categoryId);
  }, [onSelectCategory]);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Category *
      </Text>
      {loading ? (
        <Button mode="outlined" disabled style={styles.button} contentStyle={styles.buttonContent}>
          <ActivityIndicator size="small" />
          <Text style={{ marginLeft: 8 }}>Loading categories...</Text>
        </Button>
      ) : error ? (
        <Button mode="outlined" disabled style={styles.button} contentStyle={styles.buttonContent}>
          Error loading categories
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
              disabled={categories.length === 0}
            >
              {displayText}
            </Button>
          }
        >
          {categories.length === 0 ? (
            <Menu.Item disabled title="No categories available" />
          ) : (
            categories.map((category) => (
              <Menu.Item
                key={category.id}
                onPress={() => handleSelectCategory(category.id)}
                title={category.title}
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

