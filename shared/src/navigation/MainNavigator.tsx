/**
 * Main Navigator
 * 
 * Handles authentication state and routes between auth and main app.
 * Now allows guest browsing of services without authentication.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { RootNavigator } from './RootNavigator';
import { LoadingSpinner } from '../components/Base/LoadingSpinner';

export const MainNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner 
          message="Loading DeepClean Hub..."
          testID="app-loading"
        />
      </View>
    );
  }

  return <RootNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
