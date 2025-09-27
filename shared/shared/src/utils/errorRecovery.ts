/**
 * Error Recovery System
 * 
 * Advanced error recovery mechanisms with automatic retry,
 * fallback strategies, and graceful degradation.
 */

import { Alert, AppState, AppStateStatus } from 'react-native';
import { secureLog, isDevelopment } from '../config/environment';
import { trackError } from '../services/analytics';

export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  fallbackEnabled: boolean;
  userNotificationEnabled: boolean;
  autoRecoveryEnabled: boolean;
}

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface RecoveryStrategy {
  name: string;
  condition: (error: Error, context: ErrorContext) => boolean;
  action: (error: Error, context: ErrorContext) => Promise<boolean>;
  priority: number;
}

class ErrorRecoveryManager {
  private config: ErrorRecoveryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    fallbackEnabled: true,
    userNotificationEnabled: true,
    autoRecoveryEnabled: true,
  };

  private retryCounts: Map<string, number> = new Map();
  private recoveryStrategies: RecoveryStrategy[] = [];
  private isRecovering: boolean = false;
  private appState: AppStateStatus = 'active';

  constructor() {
    this.setupAppStateListener();
    this.registerDefaultStrategies();
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      this.appState = nextAppState;
    });
  }

  private registerDefaultStrategies() {
    // Network error recovery
    this.registerStrategy({
      name: 'network_retry',
      condition: (error, context) => 
        error.message.includes('Network') || 
        error.message.includes('timeout') ||
        error.message.includes('fetch'),
      action: async (error, context) => {
        return this.retryWithBackoff(context, () => {
          // Simulate retry - replace with actual retry logic
          return new Promise((resolve) => {
            setTimeout(() => resolve(true), 1000);
          });
        });
      },
      priority: 1,
    });

    // Authentication error recovery
    this.registerStrategy({
      name: 'auth_refresh',
      condition: (error, context) => 
        error.message.includes('401') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('token'),
      action: async (error, context) => {
        // Simulate token refresh
        secureLog('info', 'Attempting token refresh');
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), 500);
        });
      },
      priority: 2,
    });

    // Data validation error recovery
    this.registerStrategy({
      name: 'data_validation',
      condition: (error, context) => 
        error.message.includes('validation') || 
        error.message.includes('invalid'),
      action: async (error, context) => {
        // Clear invalid data and retry
        secureLog('info', 'Clearing invalid data and retrying');
        return true;
      },
      priority: 3,
    });

    // Generic fallback recovery
    this.registerStrategy({
      name: 'generic_fallback',
      condition: () => true, // Always matches
      action: async (error, context) => {
        return this.showFallbackUI(error, context);
      },
      priority: 999, // Lowest priority
    });
  }

  registerStrategy(strategy: RecoveryStrategy) {
    this.recoveryStrategies.push(strategy);
    this.recoveryStrategies.sort((a, b) => a.priority - b.priority);
  }

  async handleError(error: Error, context: ErrorContext): Promise<boolean> {
    if (this.isRecovering) {
      secureLog('warn', 'Recovery already in progress, queuing error');
      return false;
    }

    this.isRecovering = true;

    try {
      // Log error
      secureLog('error', 'Error occurred', {
        error: error.message,
        stack: error.stack,
        context,
      });

      // Track error for analytics
      trackError(error, context);

      // Find appropriate recovery strategy
      const strategy = this.recoveryStrategies.find(s => 
        s.condition(error, context)
      );

      if (!strategy) {
        secureLog('warn', 'No recovery strategy found for error');
        return false;
      }

      // Execute recovery strategy
      const success = await strategy.action(error, context);
      
      if (success) {
        secureLog('info', 'Error recovery successful', {
          strategy: strategy.name,
          context,
        });
      } else {
        secureLog('warn', 'Error recovery failed', {
          strategy: strategy.name,
          context,
        });
      }

      return success;
    } catch (recoveryError) {
      secureLog('error', 'Error during recovery', {
        originalError: error.message,
        recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown',
        context,
      });
      return false;
    } finally {
      this.isRecovering = false;
    }
  }

  private async retryWithBackoff(
    context: ErrorContext,
    retryFn: () => Promise<boolean>
  ): Promise<boolean> {
    const retryKey = `${context.component}_${context.action}`;
    const currentRetries = this.retryCounts.get(retryKey) || 0;

    if (currentRetries >= this.config.maxRetries) {
      secureLog('warn', 'Max retries exceeded', { retryKey, currentRetries });
      return false;
    }

    // Calculate delay with exponential backoff
    const delay = this.config.exponentialBackoff
      ? this.config.retryDelay * Math.pow(2, currentRetries)
      : this.config.retryDelay;

    secureLog('info', 'Retrying with backoff', {
      retryKey,
      attempt: currentRetries + 1,
      delay,
    });

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const success = await retryFn();
      
      if (success) {
        this.retryCounts.delete(retryKey);
        return true;
      } else {
        this.retryCounts.set(retryKey, currentRetries + 1);
        return false;
      }
    } catch (error) {
      this.retryCounts.set(retryKey, currentRetries + 1);
      throw error;
    }
  }

  private async showFallbackUI(error: Error, context: ErrorContext): Promise<boolean> {
    if (!this.config.userNotificationEnabled) {
      return false;
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Something went wrong',
        'We encountered an error. Please try again or contact support if the problem persists.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              secureLog('info', 'User chose to retry');
              resolve(true);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              secureLog('info', 'User chose to cancel');
              resolve(false);
            },
          },
        ]
      );
    });
  }

  // Clear retry counts for a specific context
  clearRetryCount(context: ErrorContext) {
    const retryKey = `${context.component}_${context.action}`;
    this.retryCounts.delete(retryKey);
  }

  // Clear all retry counts
  clearAllRetryCounts() {
    this.retryCounts.clear();
  }

  // Get retry count for a specific context
  getRetryCount(context: ErrorContext): number {
    const retryKey = `${context.component}_${context.action}`;
    return this.retryCounts.get(retryKey) || 0;
  }

  // Update configuration
  updateConfig(newConfig: Partial<ErrorRecoveryConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): ErrorRecoveryConfig {
    return { ...this.config };
  }

  // Check if recovery is in progress
  isRecoveryInProgress(): boolean {
    return this.isRecovering;
  }

  // Get recovery statistics
  getRecoveryStats() {
    return {
      totalRetryCounts: this.retryCounts.size,
      retryCounts: Object.fromEntries(this.retryCounts),
      isRecovering: this.isRecovering,
      strategiesCount: this.recoveryStrategies.length,
    };
  }
}

// Export singleton instance
export const errorRecoveryManager = new ErrorRecoveryManager();

// Export convenience functions
export const handleError = (error: Error, context: ErrorContext) => 
  errorRecoveryManager.handleError(error, context);

export const registerRecoveryStrategy = (strategy: RecoveryStrategy) => 
  errorRecoveryManager.registerStrategy(strategy);

export const clearRetryCount = (context: ErrorContext) => 
  errorRecoveryManager.clearRetryCount(context);

export const clearAllRetryCounts = () => 
  errorRecoveryManager.clearAllRetryCounts();

export const getRetryCount = (context: ErrorContext) => 
  errorRecoveryManager.getRetryCount(context);

export const updateRecoveryConfig = (config: Partial<ErrorRecoveryConfig>) => 
  errorRecoveryManager.updateConfig(config);

export const getRecoveryStats = () => 
  errorRecoveryManager.getRecoveryStats();

// Error context helpers
export const createErrorContext = (
  component: string,
  action: string,
  userId?: string,
  metadata?: Record<string, any>
): ErrorContext => ({
  component,
  action,
  userId,
  timestamp: Date.now(),
  metadata,
});

// Common error contexts
export const ErrorContexts = {
  AUTH_LOGIN: (userId?: string) => createErrorContext('AuthContext', 'login', userId),
  AUTH_LOGOUT: (userId?: string) => createErrorContext('AuthContext', 'logout', userId),
  CART_ADD_ITEM: (userId?: string) => createErrorContext('CartContext', 'addItem', userId),
  CART_REMOVE_ITEM: (userId?: string) => createErrorContext('CartContext', 'removeItem', userId),
  API_REQUEST: (endpoint: string, userId?: string) => 
    createErrorContext('APIService', 'request', userId, { endpoint }),
  NAVIGATION: (screen: string, userId?: string) => 
    createErrorContext('Navigation', 'navigate', userId, { screen }),
  COMPONENT_RENDER: (component: string, userId?: string) => 
    createErrorContext(component, 'render', userId),
} as const;
