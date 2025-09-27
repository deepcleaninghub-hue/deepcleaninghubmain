import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

interface LoadingSpinnerProps {
  loading: boolean;
  message?: string;
  children?: React.ReactNode;
}

export function LoadingSpinner({ loading, message = 'Loading...', children }: LoadingSpinnerProps) {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
});
