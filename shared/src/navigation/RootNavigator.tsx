/**
 * Root Navigator
 * 
 * Handles the top-level navigation between main app and authentication flows.
 * Allows guest browsing while providing access to authentication when needed.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={AppNavigator}
        options={{
          title: 'Deep Cleaning Hub',
        }}
      />
      <Stack.Screen 
        name="Auth" 
        component={AuthNavigator}
        options={{
          title: 'Authentication',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};
