/**
 * Customer Selector Component
 * Handles customer selection with search functionality
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Menu, Searchbar, useTheme } from 'react-native-paper';
import { Customer } from '../hooks/useCustomers';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  loading?: boolean;
}

export function CustomerSelector({
  customers,
  selectedCustomer,
  onSelectCustomer,
  loading = false,
}: CustomerSelectorProps) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }

    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.id.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Customer *
      </Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => {
          setMenuVisible(false);
          setSearchQuery('');
        }}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.button}
            contentStyle={styles.buttonContent}
            loading={loading}
            disabled={loading}
          >
            {selectedCustomer
              ? `${selectedCustomer.name} (${selectedCustomer.email})`
              : loading
              ? 'Loading customers...'
              : 'Select Customer'}
          </Button>
        }
        contentStyle={styles.menuContent}
      >
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search by name, email, phone..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>
        <ScrollView style={styles.listScroll} nestedScrollEnabled>
          {filteredCustomers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                {searchQuery ? 'No customers found' : 'No customers available'}
              </Text>
            </View>
          ) : (
            filteredCustomers.map((customer) => (
              <Menu.Item
                key={customer.id}
                onPress={() => {
                  onSelectCustomer(customer);
                  setMenuVisible(false);
                  setSearchQuery('');
                }}
                title={`${customer.name}${customer.email ? ` - ${customer.email}` : ''}${customer.phone ? ` (${customer.phone})` : ''}`}
                titleStyle={styles.menuItemTitle}
              />
            ))
          )}
        </ScrollView>
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
  menuContent: {
    width: '90%',
    maxHeight: 400,
  },
  searchContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    elevation: 0,
  },
  listScroll: {
    maxHeight: 300,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
});

