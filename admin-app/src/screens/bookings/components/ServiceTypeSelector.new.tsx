/**
 * Service Type Selector Component - New Improved Version
 * Features:
 * - Uses data cache
 * - Robust menu state management
 * - Better error handling
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Menu, useTheme, ActivityIndicator } from 'react-native-paper';
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const menuClosingRef = useRef(false);

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

  const displayText = useMemo(() => {
    if (loading) return 'Loading services...';
    if (error) return 'Error loading services';
    if (selectedService) return selectedService.title;
    if (services.length === 0) return 'No services available';
    return 'Select Service Type';
  }, [loading, error, selectedService, services.length]);

  const handleOpenMenu = useCallback(() => {
    if (loading || services.length === 0) {
      return;
    }
    // Use functional update to ensure we have latest state
    setMenuVisible((prevVisible) => {
      return prevVisible ? prevVisible : true;
    });
  }, [loading, services.length]);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
    menuClosingRef.current = false;
  }, []);

  const handleSelectService = useCallback((service: AdminService) => {
    setMenuVisible(false);
    menuClosingRef.current = false;
    onSelectService(service);
  }, [onSelectService]);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Type *
      </Text>
      {services.length === 0 && categoryName && !loading && (
        <View style={styles.warningContainer}>
          <Text variant="bodySmall" style={[styles.warningText, { color: theme.colors.error }]}>
            No services found for this category. Please ensure services exist in the database with
            category "{categoryName}".
          </Text>
        </View>
      )}
      {loading ? (
        <Button mode="outlined" disabled style={styles.button} contentStyle={styles.buttonContent}>
          <ActivityIndicator size="small" />
          <Text style={{ marginLeft: 8 }}>Loading services...</Text>
        </Button>
      ) : error ? (
        <Button mode="outlined" disabled style={styles.button} contentStyle={styles.buttonContent}>
          Error loading services
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
              disabled={services.length === 0}
            >
              {displayText}
            </Button>
          }
        >
          {services.length === 0 ? (
            <Menu.Item onPress={handleCloseMenu} title="No services available" disabled />
          ) : (
            services.map((service) => (
              <Menu.Item
                key={service.id}
                onPress={() => handleSelectService(service)}
                title={service.title}
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

