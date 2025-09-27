import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { BookingListScreen } from '@/screens/bookings/BookingListScreen';
import { BookingDetailsScreen } from '@/screens/bookings/BookingDetailsScreen';
import { BookingEditScreen } from '@/screens/bookings/BookingEditScreen';
import { BookingCreateScreen } from '@/screens/bookings/BookingCreateScreen';
import { AdminBookingStackParamList } from '@/types';

const Stack = createStackNavigator<AdminBookingStackParamList>();

export function BookingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="BookingList" 
        component={BookingListScreen}
        options={{ title: 'Bookings' }}
      />
      <Stack.Screen 
        name="BookingDetails" 
        component={BookingDetailsScreen}
        options={{ title: 'Booking Details' }}
      />
      <Stack.Screen 
        name="BookingEdit" 
        component={BookingEditScreen}
        options={{ title: 'Edit Booking' }}
      />
      <Stack.Screen 
        name="BookingCreate" 
        component={BookingCreateScreen}
        options={{ title: 'Create Booking' }}
      />
    </Stack.Navigator>
  );
}
