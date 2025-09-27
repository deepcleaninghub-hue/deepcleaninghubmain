import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { Icon } from './Icon';

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorDisplay({ error, onRetry, retryText = 'Retry' }: ErrorDisplayProps) {
  if (!error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Icon name="error" size={48} color="#F44336" style={styles.icon} />
          <Text variant="headlineSmall" style={styles.title}>
            Something went wrong
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            {error}
          </Text>
          {onRetry && (
            <Button
              mode="contained"
              onPress={onRetry}
              style={styles.retryButton}
              icon="refresh"
            >
              {retryText}
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#212121',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#757575',
  },
  retryButton: {
    marginTop: 8,
  },
});
