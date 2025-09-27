/**
 * Error Boundary Component
 * 
 * A robust error boundary with proper error reporting and recovery options.
 */

import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { secureLog, isDevelopment } from '../../config/environment';
import { BaseComponentProps } from '../../types';

interface Props extends BaseComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    secureLog('error', 'Error caught by boundary', { 
      error: error.message, 
      stack: error.stack,
      componentStack: errorInfo.componentStack 
    });
    
    // In production, send to crash reporting service
    if (!isDevelopment()) {
      // Example: crashlytics().recordError(error);
    }
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback onRetry={this.handleRetry} error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onRetry: () => void;
  error?: Error;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ onRetry, error }) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.cardContent}>
            <Ionicons 
              name="alert-circle" 
              size={64} 
              color={theme.colors.error}
              style={styles.icon}
            />
            
            <Text 
              variant="headlineSmall" 
              style={[styles.title, { color: theme.colors.error }]}
            >
              Oops! Something went wrong
            </Text>
            
            <Text 
              variant="bodyLarge" 
              style={[styles.message, { color: theme.colors.onSurface }]}
            >
              We're sorry, but something unexpected happened. Please try again.
            </Text>

            {isDevelopment() && error && (
              <View style={[styles.errorDetails, { backgroundColor: theme.colors.errorContainer }]}>
                <Text 
                  variant="labelMedium" 
                  style={[styles.errorTitle, { color: theme.colors.onErrorContainer }]}
                >
                  Error Details (Development Only):
                </Text>
                <Text 
                  variant="bodySmall" 
                  style={[styles.errorText, { color: theme.colors.onErrorContainer }]}
                >
                  {error.message}
                </Text>
                {error.stack && (
                  <Text 
                    variant="bodySmall" 
                    style={[styles.errorText, { color: theme.colors.onErrorContainer }]}
                  >
                    {error.stack}
                  </Text>
                )}
              </View>
            )}

            <Button
              mode="contained"
              onPress={onRetry}
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
              icon={({ size, color }) => (
                <Ionicons name="refresh" size={size} color={color} />
              )}
            >
              Try Again
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  cardContent: {
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
});

export default ErrorBoundary;
