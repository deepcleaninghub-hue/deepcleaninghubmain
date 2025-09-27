/**
 * Environment Configuration
 * 
 * Centralized environment management for the DeepClean Mobile Hub app.
 * Handles development, staging, and production configurations securely.
 */

export interface EnvironmentConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  SENTRY_DSN?: string;
  CRASHLYTICS_ENABLED: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  ENABLE_ANALYTICS: boolean;
  ENABLE_CRASH_REPORTING: boolean;
  CACHE_DURATION: number;
  SESSION_TIMEOUT: number;
  TOKEN_REFRESH_INTERVAL: number;
  MAX_RETRIES: number;
  REQUEST_TIMEOUT: number;
}

// Secure environment variable access
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Use Expo's environment variable system
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[`EXPO_PUBLIC_${key}`];
    if (value) {
      return value;
    }
  }
  return defaultValue;
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key);
  return value === 'true' || value === '1' || defaultValue;
};

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Environment-specific configurations
const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: (() => {
    const envValue = getEnvVar('API_BASE_URL', 'http://13.211.76.43:5001/api');
    console.log('🔍 API_BASE_URL Debug:', {
      envValue,
      processEnv: process.env.EXPO_PUBLIC_API_BASE_URL,
      fallback: 'http://13.211.76.43:5001/api'
    });
    return envValue;
  })(),
  ENVIRONMENT: 'development',
  SENTRY_DSN: getEnvVar('SENTRY_DSN'),
  CRASHLYTICS_ENABLED: getBooleanEnvVar('CRASHLYTICS_ENABLED', false),
  LOG_LEVEL: 'debug',
  ENABLE_ANALYTICS: getBooleanEnvVar('ENABLE_ANALYTICS', false),
  ENABLE_CRASH_REPORTING: getBooleanEnvVar('ENABLE_CRASH_REPORTING', false),
  CACHE_DURATION: getNumberEnvVar('CACHE_DURATION', 5 * 60 * 1000), // 5 minutes
  SESSION_TIMEOUT: getNumberEnvVar('SESSION_TIMEOUT', 30 * 60 * 1000), // 30 minutes
  TOKEN_REFRESH_INTERVAL: getNumberEnvVar('TOKEN_REFRESH_INTERVAL', 25 * 60 * 1000), // 25 minutes
  MAX_RETRIES: getNumberEnvVar('MAX_RETRIES', 3),
  REQUEST_TIMEOUT: getNumberEnvVar('REQUEST_TIMEOUT', 10000), // 10 seconds
};

const stagingConfig: EnvironmentConfig = {
  API_BASE_URL: getEnvVar('API_BASE_URL', 'https://staging-api.deepcleanhub.com/api'),
  ENVIRONMENT: 'staging',
  SENTRY_DSN: getEnvVar('SENTRY_DSN'),
  CRASHLYTICS_ENABLED: getBooleanEnvVar('CRASHLYTICS_ENABLED', true),
  LOG_LEVEL: 'info',
  ENABLE_ANALYTICS: getBooleanEnvVar('ENABLE_ANALYTICS', true),
  ENABLE_CRASH_REPORTING: getBooleanEnvVar('ENABLE_CRASH_REPORTING', true),
  CACHE_DURATION: getNumberEnvVar('CACHE_DURATION', 10 * 60 * 1000), // 10 minutes
  SESSION_TIMEOUT: getNumberEnvVar('SESSION_TIMEOUT', 30 * 60 * 1000), // 30 minutes
  TOKEN_REFRESH_INTERVAL: getNumberEnvVar('TOKEN_REFRESH_INTERVAL', 25 * 60 * 1000), // 25 minutes
  MAX_RETRIES: getNumberEnvVar('MAX_RETRIES', 3),
  REQUEST_TIMEOUT: getNumberEnvVar('REQUEST_TIMEOUT', 15000), // 15 seconds
};

const productionConfig: EnvironmentConfig = {
  API_BASE_URL: getEnvVar('API_BASE_URL', 'https://api.deepcleanhub.com/api'),
  ENVIRONMENT: 'production',
  SENTRY_DSN: getEnvVar('SENTRY_DSN'),
  CRASHLYTICS_ENABLED: getBooleanEnvVar('CRASHLYTICS_ENABLED', true),
  LOG_LEVEL: 'error',
  ENABLE_ANALYTICS: getBooleanEnvVar('ENABLE_ANALYTICS', true),
  ENABLE_CRASH_REPORTING: getBooleanEnvVar('ENABLE_CRASH_REPORTING', true),
  CACHE_DURATION: getNumberEnvVar('CACHE_DURATION', 15 * 60 * 1000), // 15 minutes
  SESSION_TIMEOUT: getNumberEnvVar('SESSION_TIMEOUT', 30 * 60 * 1000), // 30 minutes
  TOKEN_REFRESH_INTERVAL: getNumberEnvVar('TOKEN_REFRESH_INTERVAL', 25 * 60 * 1000), // 25 minutes
  MAX_RETRIES: getNumberEnvVar('MAX_RETRIES', 2),
  REQUEST_TIMEOUT: getNumberEnvVar('REQUEST_TIMEOUT', 20000), // 20 seconds
};

// Determine current environment
const getCurrentEnvironment = (): 'development' | 'staging' | 'production' => {
  const env = getEnvVar('ENVIRONMENT', 'development');
  if (env === 'staging' || env === 'production') {
    return env;
  }
  return 'development';
};

// Get configuration based on current environment
const getConfig = (): EnvironmentConfig => {
  const currentEnv = getCurrentEnvironment();
  
  // Force recreation of development config to pick up latest env vars
  if (currentEnv === 'development') {
    return {
      API_BASE_URL: getEnvVar('API_BASE_URL', 'http://13.211.76.43:5001/api'),
      ENVIRONMENT: 'development',
      SENTRY_DSN: getEnvVar('SENTRY_DSN'),
      CRASHLYTICS_ENABLED: getBooleanEnvVar('CRASHLYTICS_ENABLED', false),
      LOG_LEVEL: 'debug',
      ENABLE_ANALYTICS: getBooleanEnvVar('ENABLE_ANALYTICS', false),
      ENABLE_CRASH_REPORTING: getBooleanEnvVar('ENABLE_CRASH_REPORTING', false),
      CACHE_DURATION: getNumberEnvVar('CACHE_DURATION', 5 * 60 * 1000), // 5 minutes
      SESSION_TIMEOUT: getNumberEnvVar('SESSION_TIMEOUT', 30 * 60 * 1000), // 30 minutes
      TOKEN_REFRESH_INTERVAL: getNumberEnvVar('TOKEN_REFRESH_INTERVAL', 25 * 60 * 1000), // 25 minutes
      MAX_RETRIES: getNumberEnvVar('MAX_RETRIES', 3),
      REQUEST_TIMEOUT: getNumberEnvVar('REQUEST_TIMEOUT', 10000), // 10 seconds
    };
  }
  
  switch (currentEnv) {
    case 'staging':
      return stagingConfig;
    case 'production':
      return productionConfig;
    default:
      return developmentConfig;
  }
};

// Export the configuration
export const config = getConfig();

// Export individual config values for convenience
export const {
  API_BASE_URL,
  ENVIRONMENT,
  SENTRY_DSN,
  CRASHLYTICS_ENABLED,
  LOG_LEVEL,
  ENABLE_ANALYTICS,
  ENABLE_CRASH_REPORTING,
  CACHE_DURATION,
  SESSION_TIMEOUT,
  TOKEN_REFRESH_INTERVAL,
  MAX_RETRIES,
  REQUEST_TIMEOUT,
} = config;

// Utility functions
export const isDevelopment = (): boolean => ENVIRONMENT === 'development';
export const isStaging = (): boolean => ENVIRONMENT === 'staging';
export const isProduction = (): boolean => ENVIRONMENT === 'production';

export const shouldLog = (level: 'debug' | 'info' | 'warn' | 'error'): boolean => {
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(LOG_LEVEL);
  const requestedLevelIndex = levels.indexOf(level);
  return requestedLevelIndex >= currentLevelIndex;
};

// Secure logging utility
export const secureLog = (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) => {
  if (!shouldLog(level)) return;
  
  const sanitizedData = data ? sanitizeLogData(data) : undefined;
  
  switch (level) {
    case 'debug':
      console.log(`[DEBUG] ${message}`, sanitizedData);
      break;
    case 'info':
      console.info(`[INFO] ${message}`, sanitizedData);
      break;
    case 'warn':
      console.warn(`[WARN] ${message}`, sanitizedData);
      break;
    case 'error':
      console.error(`[ERROR] ${message}`, sanitizedData);
      break;
  }
};

// Sanitize sensitive data from logs
const sanitizeLogData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = ['password', 'token', 'authorization', 'auth', 'secret', 'key'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });
  
  return sanitized;
};

// Log configuration on startup (only in development)
if (isDevelopment()) {
  console.log('🔧 Environment Variables Debug:', {
    'EXPO_PUBLIC_API_BASE_URL': process.env.EXPO_PUBLIC_API_BASE_URL,
    'EXPO_PUBLIC_ENVIRONMENT': process.env.EXPO_PUBLIC_ENVIRONMENT,
    'All EXPO_PUBLIC_ vars': Object.keys(process.env || {}).filter(key => key.startsWith('EXPO_PUBLIC_'))
  });
  
  secureLog('info', '🔧 Environment Configuration:', {
    environment: ENVIRONMENT,
    apiBaseUrl: API_BASE_URL,
    logLevel: LOG_LEVEL,
    analyticsEnabled: ENABLE_ANALYTICS,
    crashReportingEnabled: ENABLE_CRASH_REPORTING,
  });
}
