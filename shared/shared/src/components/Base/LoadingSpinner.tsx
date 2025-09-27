/**
 * Loading Spinner Component
 * 
 * A reusable loading spinner component with consistent styling
 * and accessibility support.
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { BaseComponentProps } from '../../types';

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'small' | 'large';
  message?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message,
  color,
  testID = 'loading-spinner',
  accessibilityLabel = 'Loading',
  accessibilityRole = 'progressbar',
}) => {
  const theme = useTheme();
  const spinnerColor = color || theme.colors.primary;

  return (
    <View 
      style={styles.container}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      <ActivityIndicator 
        size={size} 
        color={spinnerColor}
        testID={`${testID}-indicator`}
      />
      {message && (
        <Text 
          variant="bodyMedium" 
          style={[styles.message, { color: theme.colors.onSurface }]}
          testID={`${testID}-message`}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
});
