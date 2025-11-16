import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { AdminDashboardStackParamList } from '@/types';

const Stack = createStackNavigator<AdminDashboardStackParamList>();

export function DashboardNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="DashboardMain" 
        component={DashboardScreen}
      />
    </Stack.Navigator>
  );
}

