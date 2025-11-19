/**
 * Customer Selector Component - New Improved Version
 * Features:
 * - Uses data cache to avoid repeated DB calls
 * - Robust menu state management
 * - Better error handling
 * - Improved performance
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Menu, Searchbar, useTheme, ActivityIndicator } from 'react-native-paper';
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const menuClosingRef = useRef(false);

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

  // Memoize display text
  const displayText = useMemo(() => {
    if (selectedCustomer) {
      const parts = [selectedCustomer.name];
      if (selectedCustomer.email) {
        parts.push(`(${selectedCustomer.email})`);
      }
      return parts.join(' ');
    }
    return loading ? 'Loading customers...' : 'Select Customer';
  }, [selectedCustomer, loading]);

  // Handle menu opening
  const handleOpenMenu = useCallback(() => {
    // Prevent opening if loading or no customers
    if (loading || customers.length === 0) {
      return;
    }
    
    // Use functional update to ensure we have latest state
    setMenuVisible((prevVisible) => {
      // If already visible, don't change (Menu will handle closing via onDismiss)
      // If not visible, open it
      return prevVisible ? prevVisible : true;
    });
  }, [loading, customers.length]);

  const handleCloseMenu = useCallback(() => {
    // Immediately close and reset
    setMenuVisible(false);
    setSearchQuery('');
    menuClosingRef.current = false;
  }, []);

  const handleSelectCustomer = useCallback((customer: Customer) => {
    if (!customer) return;
    
    try {
      setSearchQuery('');
      setMenuVisible(false);
      menuClosingRef.current = false;
      onSelectCustomer(customer);
    } catch (error) {
      console.error('Error selecting customer:', error);
    }
  }, [onSelectCustomer]);

  // Optimized filtering with memoization
  const filteredCustomers = useMemo(() => {
    if (!customers || customers.length === 0) {
      return [];
    }

    if (!searchQuery.trim()) {
      return customers;
    }

    const query = searchQuery.toLowerCase().trim();
    return customers.filter((customer) => {
      const nameMatch = customer.name?.toLowerCase().includes(query);
      const emailMatch = customer.email?.toLowerCase().includes(query);
      const phoneMatch = customer.phone?.toLowerCase().includes(query);
      const idMatch = customer.id?.toLowerCase().includes(query);
      
      return nameMatch || emailMatch || phoneMatch || idMatch;
    });
  }, [customers, searchQuery]);

  return (
    <View style={styles.container} testID="customer-selector">
      <Text 
        variant="bodyMedium" 
        style={[styles.label, { color: theme.colors.onSurface }]}
        accessibilityRole="text"
      >
        Customer *
      </Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => {
          // Ensure menu closes immediately
          setMenuVisible(false);
          setSearchQuery('');
          menuClosingRef.current = false;
        }}
        anchor={
          <Button
            mode="outlined"
            onPress={() => {
              // Use functional update to ensure we have latest state
              setMenuVisible((prev) => !prev);
            }}
            style={styles.button}
            contentStyle={styles.buttonContent}
            loading={loading}
            disabled={loading || customers.length === 0}
            accessibilityLabel={displayText}
            accessibilityHint="Opens customer selection menu"
            testID="customer-selector-button"
          >
            {displayText}
          </Button>
        }
        contentStyle={styles.menuContent}
        testID="customer-selector-menu"
      >
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search by name, email, phone..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            accessibilityLabel="Search customers"
            testID="customer-search-bar"
          />
        </View>
        <ScrollView 
          style={styles.listScroll} 
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          testID="customer-list-scroll"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
              <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
                Loading customers...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer} testID="customer-error-state">
              <Text 
                style={[styles.emptyText, { color: theme.colors.error }]}
                accessibilityRole="text"
              >
                {error}
              </Text>
            </View>
          ) : filteredCustomers.length === 0 ? (
            <View style={styles.emptyContainer} testID="customer-empty-state">
              <Text 
                style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
                accessibilityRole="text"
              >
                {searchQuery ? 'No customers found' : 'No customers available'}
              </Text>
            </View>
          ) : (
            filteredCustomers.map((customer) => {
              const customerDisplayText = [
                customer.name,
                customer.email ? `- ${customer.email}` : '',
                customer.phone ? `(${customer.phone})` : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <Menu.Item
                  key={customer.id}
                  onPress={() => handleSelectCustomer(customer)}
                  title={customerDisplayText}
                  titleStyle={styles.menuItemTitle}
                  accessibilityLabel={`Select customer ${customer.name}`}
                  testID={`customer-item-${customer.id}`}
                />
              );
            })
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
    width: '95%',
    maxWidth: 500,
    maxHeight: 400,
    marginLeft: 0,
    marginRight: 0,
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
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
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

