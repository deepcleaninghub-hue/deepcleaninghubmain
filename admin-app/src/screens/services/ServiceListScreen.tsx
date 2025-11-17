/**
 * Service List Screen - Refactored
 * Uses hooks and sub-components for better maintainability
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, useTheme, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServiceCategories } from './hooks/useServiceCategories';
import { ServiceCategoryCard } from './components/ServiceCategoryCard';
import { ServiceCreateModal } from './components/ServiceCreateModal';
import { useAdminData } from '@/contexts/AdminDataContext';

export function ServiceListScreen({ navigation }: any) {
  const theme = useTheme();
  const { categories, loading } = useServiceCategories();
  const { refreshServices } = useAdminData();
  const [refreshing, setRefreshing] = useState(false);
  const [serviceCreateModalVisible, setServiceCreateModalVisible] = useState(false);

  const handleCategoryPress = (category: any) => {
    navigation.navigate('ServiceCategory', {
      categoryId: category.id,
      categoryTitle: category.category,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh will be handled by the hook
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddService = () => {
    setServiceCreateModalVisible(true);
  };

  const handleServiceCreated = () => {
    refreshServices();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Services
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.servicesSection}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Our Services
          </Text>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
                Loading services...
              </Text>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {categories.map((category) => (
                <ServiceCategoryCard
                  key={category.id}
                  category={category}
                  onPress={handleCategoryPress}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddService}
        label="Add Service"
      />

      {/* Service Create Modal */}
      <ServiceCreateModal
        visible={serviceCreateModalVisible}
        onDismiss={() => setServiceCreateModalVisible(false)}
        onSuccess={handleServiceCreated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBE2EF',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  servicesSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
    fontWeight: '700',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

