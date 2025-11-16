import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { ServiceListScreen } from '@/screens/services/ServiceListScreen';
import { ServiceDetailsScreen } from '@/screens/services/ServiceDetailsScreen';
import { ServiceEditScreen } from '@/screens/services/ServiceEditScreen';
import { ServiceCreateScreen } from '@/screens/services/ServiceCreateScreen';
import { ServiceVariantsScreen } from '@/screens/services/ServiceVariantsScreen';
import { ServiceCategoriesScreen } from '@/screens/services/ServiceCategoriesScreen';
import { ServiceCategoryScreen } from '@/screens/services/ServiceCategoryScreen';
import { AdminServiceStackParamList } from '@/types';

const Stack = createStackNavigator<AdminServiceStackParamList>();

export function ServiceNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ServiceList" 
        component={ServiceListScreen}
        options={{ title: 'Services' }}
      />
      <Stack.Screen 
        name="ServiceDetails" 
        component={ServiceDetailsScreen}
        options={{ title: 'Service Details' }}
      />
      <Stack.Screen 
        name="ServiceEdit" 
        component={ServiceEditScreen}
        options={{ title: 'Edit Service' }}
      />
      <Stack.Screen 
        name="ServiceCreate" 
        component={ServiceCreateScreen}
        options={{ title: 'Add Service' }}
      />
      <Stack.Screen 
        name="ServiceVariants" 
        component={ServiceVariantsScreen}
        options={{ title: 'Service Variants' }}
      />
      <Stack.Screen 
        name="ServiceCategories" 
        component={ServiceCategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen 
        name="ServiceCategory" 
        component={ServiceCategoryScreen}
        options={{ title: 'Category Services' }}
      />
    </Stack.Navigator>
  );
}
