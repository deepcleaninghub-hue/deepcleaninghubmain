/**
 * Customer Selector Component - Version 4
 * Uses react-native-dropdown-picker for reliable dropdown functionality
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { dataCache, Customer } from '@/services/dataCache';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
}

export function CustomerSelector({
  selectedCustomer,
  onSelectCustomer,
}: CustomerSelectorProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load customers from cache on mount
  useEffect(() => {
    let mounted = true;
    
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const cachedCustomers = await dataCache.getCustomers();
        if (mounted) {
          setCustomers(cachedCustomers);
        }
      } catch (err: any) {
        console.error('Error loading customers:', err);
        if (mounted) {
          setError(err.message || 'Failed to load customers');
          setCustomers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      mounted = false;
    };
  }, []);

  // Convert customers to dropdown items
  const items = useMemo(() => {
    return customers.map(customer => ({
      label: [
        customer.name,
        customer.email ? `(${customer.email})` : '',
        customer.phone ? `- ${customer.phone}` : '',
      ]
        .filter(Boolean)
        .join(' '),
      value: customer.id,
      customer: customer, // Store full customer object
    }));
  }, [customers]);

  const selectedValue = selectedCustomer?.id || null;

  const handleValueChange = (value: string | null) => {
    if (value) {
      const customer = customers.find(c => c.id === value);
      if (customer) {
        onSelectCustomer(customer);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Customer *
        </Text>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <ActivityIndicator size="small" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant, marginLeft: 8 }]}>
            Loading customers...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
          Customer *
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
        Customer *
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
        placeholder="Select Customer"
        searchable={true}
        searchPlaceholder="Search by name, email, phone..."
        loading={loading}
        disabled={loading || customers.length === 0}
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
        searchTextInputStyle={{
          color: theme.colors.onSurface,
          borderColor: theme.colors.outline,
        }}
        listItemLabelStyle={{
          color: theme.colors.onSurface,
        }}
        selectedItemLabelStyle={{
          color: theme.colors.primary,
          fontWeight: '600',
        }}
        zIndex={4000}
        zIndexInverse={1000}
        listMode="MODAL"
        modalProps={{
          animationType: 'fade',
        }}
        modalTitle="Select Customer"
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

