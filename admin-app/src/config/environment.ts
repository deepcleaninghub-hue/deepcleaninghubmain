/**
 * Environment Configuration for Admin App
 * 
 * Centralized environment management for the Deep Cleaning Hub admin app.
 */

// Determine environment
const getEnvironment = (): 'development' | 'production' => {
  return process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'production' : 'development';
};

// Get API URL based on environment
const getApiBaseUrl = (): string => {
  const environment = getEnvironment();

  if (environment === 'production') {
    return process.env.EXPO_PUBLIC_API_BASE_URL || 'https://app.deepcleaninghub.com/api';
  } else {
    return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.29.112:5001/api';
  }
};

export const API_BASE_URL = getApiBaseUrl();
export const ENVIRONMENT = getEnvironment();

// Log configuration for debugging
if (__DEV__) {
  console.log('🔧 Admin App Environment Configuration:', {
    environment: ENVIRONMENT,
    apiBaseUrl: API_BASE_URL,
    envVar: process.env.EXPO_PUBLIC_API_BASE_URL,
  });
}
