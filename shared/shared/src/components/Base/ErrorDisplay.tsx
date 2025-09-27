/**
 * Error Display Component
 * 
 * A reusable error display component with consistent styling
 * and retry functionality.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { BaseComponentProps } from '../../types';

interface ErrorDisplayProps extends BaseComponentProps {
  error: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
  variant?: 'card' | 'inline';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  retryText = 'Try Again',
  showIcon = true,
  variant = 'card',
  testID = 'error-display',
  accessibilityLabel = 'Error message',
  accessibilityRole = 'alert',
}) => {
  const theme = useTheme();

  const content = (
    <View style={styles.content}>
      {showIcon && (
        <Ionicons 
          name="alert-circle" 
          size={48} 
          color={theme.colors.error}
          style={styles.icon}
        />
      )}
      <Text 
        variant="bodyLarge" 
        style={[styles.message, { color: theme.colors.onSurface }]}
        testID={`${testID}-message`}
      >
        {error}
      </Text>
      {onRetry && (
        <Button
          mode="contained"
          onPress={onRetry}
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          testID={`${testID}-retry-button`}
        >
          {retryText}
        </Button>
      )}
    </View>
  );

  if (variant === 'inline') {
    return (
      <View 
        style={styles.inlineContainer}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
      >
        {content}
      </View>
    );
  }

  return (
    <Card 
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      <Card.Content style={styles.cardContent}>
        {content}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 12,
  },
  cardContent: {
    padding: 24,
  },
  inlineContainer: {
    padding: 16,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
});
