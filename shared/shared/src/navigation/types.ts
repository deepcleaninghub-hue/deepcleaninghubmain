/**
 * Navigation Types
 * 
 * Centralized navigation type definitions for the DeepClean Mobile Hub app.
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Services: NavigatorScreenParams<ServicesStackParamList>;
  Cart: NavigatorScreenParams<CartStackParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Home Stack
// Removed Home stack; Services is now main

// Services Stack
export type ServicesStackParamList = {
  ServicesMain: undefined;
  ServiceDetails: { serviceId: string };
  ServiceOptions: { serviceId: string };
  Contact: undefined;
};

// Cart Stack
export type CartStackParamList = {
  CartMain: undefined;
  ServiceOptions: { serviceId: string };
  Checkout: undefined;
  OrderConfirmation: { 
    bookingId: string;
    orderData?: {
      service_date: string;
      service_time: string;
      total_amount: number;
      items: any[];
      address: any;
      bookings?: any[];
    };
  };
};

// Orders Stack
export type OrdersStackParamList = {
  OrdersMain: undefined;
  OrderDetails: { orderId: string };
  Booking: { serviceId?: string };
  ServiceOptions: { serviceId: string };
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>;

export type ServicesStackScreenProps<T extends keyof ServicesStackParamList> = StackScreenProps<ServicesStackParamList, T>;

export type CartStackScreenProps<T extends keyof CartStackParamList> = StackScreenProps<CartStackParamList, T>;

export type OrdersStackScreenProps<T extends keyof OrdersStackParamList> = StackScreenProps<OrdersStackParamList, T>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = StackScreenProps<ProfileStackParamList, T>;

// Navigation Props Helper
export type NavigationProps<T extends keyof RootStackParamList> = RootStackScreenProps<T>['navigation'];
export type RouteProps<T extends keyof RootStackParamList> = RootStackScreenProps<T>['route'];
