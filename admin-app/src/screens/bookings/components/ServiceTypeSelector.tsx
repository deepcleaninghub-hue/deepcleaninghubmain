/**
 * Service Type Selector Component
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Menu, useTheme } from 'react-native-paper';
import { AdminService } from '@/types';

interface ServiceTypeSelectorProps {
  services: AdminService[];
  selectedService: AdminService | null;
  onSelectService: (service: AdminService) => void;
  categoryName?: string | undefined;
}

export function ServiceTypeSelector({
  services,
  selectedService,
  onSelectService,
  categoryName,
}: ServiceTypeSelectorProps) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurface }]}>
        Service Type *
      </Text>
      {services.length === 0 && categoryName && (
        <View style={styles.warningContainer}>
          <Text variant="bodySmall" style={[styles.warningText, { color: theme.colors.error }]}>
            No services found for this category. Please ensure services exist in the database with
            category "{categoryName}".
          </Text>
        </View>
      )}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.button}
            contentStyle={styles.buttonContent}
            disabled={services.length === 0}
          >
            {selectedService ? selectedService.title : services.length === 0 ? 'No services available' : 'Select Service Type'}
          </Button>
        }
      >
        {services.length === 0 ? (
          <Menu.Item onPress={() => setMenuVisible(false)} title="No services available" disabled />
        ) : (
          services.map((service) => (
            <Menu.Item
              key={service.id}
              onPress={() => {
                onSelectService(service);
                setMenuVisible(false);
              }}
              title={service.title}
            />
          ))
        )}
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

