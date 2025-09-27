/**
 * Main App Navigator
 * 
 * Handles the main app navigation with bottom tabs and stack navigators.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MainTabParamList, ServicesStackParamList, CartStackParamList, OrdersStackParamList, ProfileStackParamList } from './types';
import { theme } from '../utils/theme';

// Import screens (we'll create these next)
import ServicesScreen from '../screens/main/ServicesScreen';
import { CartScreen } from '../screens/main/CartScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import OrderConfirmationScreen from '../screens/main/OrderConfirmationScreen';
import { OrdersScreen } from '../screens/main/OrdersScreen';
import OrderDetailsScreen from '../screens/main/OrderDetailsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ContactScreen from '../screens/main/ContactScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ServicesStackNavigator = createStackNavigator<ServicesStackParamList>();
const CartStackNavigator = createStackNavigator<CartStackParamList>();
const OrdersStackNavigator = createStackNavigator<OrdersStackParamList>();
const ProfileStackNavigator = createStackNavigator<ProfileStackParamList>();

// Services Stack
const ServicesStack = () => {
  return (
    <ServicesStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <ServicesStackNavigator.Screen name="ServicesMain" component={ServicesScreen} />
      <ServicesStackNavigator.Screen name="Contact" component={ContactScreen} />
    </ServicesStackNavigator.Navigator>
  );
};

// Cart Stack
const CartStack = () => {
  return (
    <CartStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <CartStackNavigator.Screen name="CartMain" component={CartScreen} />
      <CartStackNavigator.Screen name="Checkout" component={CheckoutScreen} />
      <CartStackNavigator.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    </CartStackNavigator.Navigator>
  );
};

// Orders Stack
const OrdersStack = () => {
  return (
    <OrdersStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStackNavigator.Screen name="OrdersMain" component={OrdersScreen} />
      <OrdersStackNavigator.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </OrdersStackNavigator.Navigator>
  );
};

// Profile Stack
const ProfileStack = () => {
  return (
    <ProfileStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNavigator.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStackNavigator.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStackNavigator.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Services':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 5,
          height: 60 + Math.max(insets.bottom, 8),
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Services" 
        component={ServicesStack} 
        options={{ title: 'Our Services' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersStack} 
        options={{ title: 'My Orders' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartStack} 
        options={{ title: 'Cart' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
