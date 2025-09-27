import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AdminRootStackParamList } from '@/types';

const Stack = createStackNavigator<AdminRootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return null; // Loading screen will be handled by context
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
