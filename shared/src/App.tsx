/**
 * Main App Component
 * 
 * The root component of the DeepClean Mobile Hub app with proper
 * provider setup and error boundary.
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { theme } from './utils/theme';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/Base/ErrorBoundary';
import { MainNavigator } from './navigation/MainNavigator';
import { NotificationProvider } from './components/NotificationProvider';
import { config } from './config/environment';

export default function App() {
  // Log API URL when app starts
  useEffect(() => {
    console.log('🚀 DeepClean Mobile Hub started');
    console.log('🌐 API Base URL:', config.API_BASE_URL);
    console.log('🔧 Environment:', config.ENVIRONMENT);
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <AuthProvider>
              <CartProvider>
                <NotificationProvider>
                  <NavigationContainer>
                    <StatusBar style="auto" />
                    <MainNavigator />
                  </NavigationContainer>
                </NotificationProvider>
              </CartProvider>
            </AuthProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
