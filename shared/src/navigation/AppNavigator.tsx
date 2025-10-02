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
import { View, Text, StyleSheet } from 'react-native';

import { MainTabParamList, ServicesStackParamList, CartStackParamList, OrdersStackParamList, ProfileStackParamList } from './types';
import { theme } from '../utils/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';

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

// Custom Cart Icon with Badge
const CartIconWithBadge: React.FC<{ focused: boolean; color: string; size: number }> = ({ focused, color, size }) => {
  const { cartSummary } = useCart();
  const itemCount = cartSummary.totalItems;

  return (
    <View style={styles.iconContainer}>
      <Ionicons 
        name={focused ? 'cart' : 'cart-outline'} 
        size={size} 
        color={color} 
      />
      {itemCount > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
          <Text style={[styles.badgeText, { color: theme.colors.onError }]}>
            {itemCount > 99 ? '99+' : itemCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

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
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case 'Services':
              return <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={size} color={color} />;
            case 'Cart':
              return <CartIconWithBadge focused={focused} color={color} size={size} />;
            case 'Orders':
              return <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />;
            case 'Profile':
              return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
            default:
              return <Ionicons name="help-outline" size={size} color={color} />;
          }
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
        options={{ title: t('services.title') }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersStack} 
        options={{ title: t('orders.title') }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartStack} 
        options={{ title: t('cart.title') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={{ title: t('profile.title') }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
