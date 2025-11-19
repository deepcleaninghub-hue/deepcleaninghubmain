/**
 * Service Type Selector Component - Version 4
 * Uses react-native-dropdown-picker
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { dataCache } from '@/services/dataCache';
import { AdminService } from '@/types';

interface ServiceTypeSelectorProps {
  selectedService: AdminService | null;
  onSelectService: (service: AdminService) => void;
  categoryName: string;
}

export function ServiceTypeSelector({
  selectedService,
  onSelectService,
  categoryName,
}: ServiceTypeSelectorProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load services from cache when category changes
  useEffect(() => {
    let mounted = true;
    
    const loadServices = async () => {
      if (!categoryName) {
        if (mounted) {
          setServices([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const cachedServices = await dataCache.getServicesByCategory(categoryName);
        if (mounted) {
          setServices(cachedServices);
        }
      } catch (err: any) {
        console.error('Error loading services:', err);
        if (mounted) {
          setError(err.message || 'Failed to load services');
          setServices([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      mounted = false;
    };
  }, [categoryName]);

  const items = useMemo(() => {
    return services.map(service => ({
      label: service.title,
      value: service.id,
      service: service, // Store full service object
    }));
  }, [services]);

  const selectedValue = selectedService?.id || null;

  const handleValueChange = (value: string | null) => {
    if (value) {
      const service = services.find(s => s.id === value);
      if (service) {
        onSelectService(service);
      }
    }
  };

  if (!categoryName) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Type *
        </Text>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <ActivityIndicator size="small" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant, marginLeft: 8 }]}>
            Loading services...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Type *
        </Text>
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (services.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Service Type *
        </Text>
        <View style={styles.warningContainer}>
          <Text variant="bodySmall" style={[styles.warningText, { color: theme.colors.error }]}>
            No services found for this category. Please ensure services exist in the database with
            category "{categoryName}".
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Type *
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
        placeholder="Select Service Type"
        loading={loading}
        disabled={loading || services.length === 0}
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
        zIndex={2000}
        zIndexInverse={1000}
        listMode="MODAL"
        modalProps={{
          animationType: 'fade',
        }}
        modalTitle="Select Service Type"
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
  warningContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  warningText: {
    marginBottom: 8,
    fontSize: 12,
  },
});

