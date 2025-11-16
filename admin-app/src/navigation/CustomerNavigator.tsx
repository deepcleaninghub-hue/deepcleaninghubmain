import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CustomerListScreen } from '@/screens/customers/CustomerListScreen';
import { CustomerDetailsScreen } from '@/screens/customers/CustomerDetailsScreen';
import { AdminCustomerStackParamList } from '@/types';

const Stack = createStackNavigator<AdminCustomerStackParamList>();

export function CustomerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="CustomerList" 
        component={CustomerListScreen}
        options={{ title: 'Customers' }}
      />
      <Stack.Screen 
        name="CustomerDetails" 
        component={CustomerDetailsScreen}
        options={{ title: 'Customer Details' }}
      />
    </Stack.Navigator>
  );
}

