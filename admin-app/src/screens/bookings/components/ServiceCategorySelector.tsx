/**
 * Service Category Selector Component - DEPRECATED
 * Use ServiceCategorySelector.new.tsx instead
 * @deprecated
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Menu, useTheme } from 'react-native-paper';
import { ServiceCategory } from '../hooks/useServiceCategories';

interface ServiceCategorySelectorProps {
  categories: ServiceCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  loading?: boolean;
}

export function ServiceCategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
  loading = false,
}: ServiceCategorySelectorProps) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const displayText = selectedCategory ? selectedCategory.title : 'Select Service Category';

  const handleOpenMenu = useCallback(() => {
    // Don't open if already visible
    if (menuVisible) {
      return;
    }
    // Use setTimeout to ensure state update happens after render
    setTimeout(() => {
      setMenuVisible(true);
    }, 0);
  }, [menuVisible]);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleSelectCategory = useCallback((categoryId: string) => {
    onSelectCategory(categoryId);
    setMenuVisible(false);
  }, [onSelectCategory]);

  // Ensure menu closes when loading changes
  useEffect(() => {
    if (loading && menuVisible) {
      setMenuVisible(false);
    }
  }, [loading, menuVisible]);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Category *
      </Text>
      {loading ? (
        <Button mode="outlined" disabled style={styles.button} contentStyle={styles.buttonContent}>
          Loading categories...
        </Button>
      ) : (
        <Menu
          visible={menuVisible}
          onDismiss={handleCloseMenu}
          anchor={
            <Button
              mode="outlined"
              onPress={handleOpenMenu}
              style={styles.button}
              contentStyle={styles.buttonContent}
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

