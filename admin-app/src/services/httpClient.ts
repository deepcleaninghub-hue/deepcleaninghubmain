// Import URL polyfill for React Native compatibility
import 'react-native-url-polyfill/auto';

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { API_BASE_URL } from '../config/environment';

// Use environment configuration for proper API URL
const BASE_URL = API_BASE_URL;

class HttpClient {
  private client: AxiosInstance;
  private logoutCallback: (() => void) | null = null;
  private refreshTokenCallback: (() => Promise<boolean>) | null = null;
  private isRefreshing = false;
  private timeout: number;

  constructor() {
    // Increase timeout for production environments (30 seconds)
    // Development can use shorter timeout (10 seconds)
    const isProduction = BASE_URL.includes('deepcleaninghub.com') ||
      BASE_URL.includes('54.252.116.156') ||
      BASE_URL.startsWith('https://'); // HTTPS URLs are typically production
    this.timeout = isProduction ? 30000 : 10000;

    // Log base URL for debugging
    if (__DEV__) {
      console.log('🌐 HTTP Client initialized:', {
        baseURL: BASE_URL,
        timeout: this.timeout,
        isProduction,
        platform: Platform.OS,
      });
    }

    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Use default adapter (React Native uses XMLHttpRequest automatically)
      // Don't specify adapter - let axios choose the right one for the platform
    });

    // Log network configuration on iOS for debugging
    if (__DEV__ && Platform.OS === 'ios') {
      console.log('📱 iOS Network Configuration:', {
        baseURL: BASE_URL,
        timeout: this.timeout,
        platform: Platform.OS,
        version: Platform.Version,
      });
    }

    this.setupInterceptors();
  }

  // Method to set logout callback
  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  // Method to set token refresh callback
  setRefreshTokenCallback(callback: () => Promise<boolean>) {
    this.refreshTokenCallback = callback;
  }

  // Method to trigger logout
  private async triggerLogout() {
    try {
      // Clear all stored tokens
      await AsyncStorage.multiRemove(['admin_token', 'admin_refresh_token', 'admin_user']);

      // Show session expired alert
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Trigger the logout callback if set
              if (this.logoutCallback) {
                this.logoutCallback();
              }
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error during admin logout:', error);
    }
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig & { _isRefreshRequest?: boolean }) => {
        try {
          const token = await AsyncStorage.getItem('admin_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          // Log request details in development
          if (__DEV__) {
            console.log('📤 Request:', {
              method: config.method?.toUpperCase(),
              url: config.url,
              baseURL: config.baseURL,
              fullURL: `${config.baseURL}${config.url}`,
              headers: config.headers,
            });
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _isRefreshRequest?: boolean };

        // Don't retry if this is already a refresh token request or if we're already refreshing
        const isRefreshRequest = originalRequest.url?.includes('/auth/refresh') || originalRequest._isRefreshRequest;

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !this.isRefreshing) {
          originalRequest._retry = true;

          // Check if it's a JWT signature error (invalid token structure)
          const errorData = error.response?.data as any;
          const isJWTError = errorData?.error && (
            errorData.error.includes('Token verification failed') ||
            errorData.error.includes('jwt malformed') ||
            errorData.error.includes('invalid token')
          );

          if (isJWTError) {
            // Invalid token structure - cannot refresh, must logout
            await this.triggerLogout();
            return Promise.reject(error);
          }

          // Try to refresh token for expired tokens
          if (this.refreshTokenCallback) {
            try {
              this.isRefreshing = true;
              const refreshSuccess = await this.refreshTokenCallback();

              if (refreshSuccess) {
                // Retry the original request with new token
                const newToken = await AsyncStorage.getItem('admin_token');
                if (newToken && originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  // Reset retry flag for the retry attempt
                  originalRequest._retry = false;
                  return this.client(originalRequest);
                }
              }
            } catch (refreshError) {
              console.error('Token refresh error:', refreshError);
              // Don't logout automatically on refresh error
            } finally {
              this.isRefreshing = false;
            }
          }
        } else if (isRefreshRequest && error.response?.status === 401) {
          // If refresh token request itself fails with 401, logout
          await this.triggerLogout();
        }

        // Enhanced error logging for network issues
        const errorDetails = {
          url: originalRequest?.url,
          baseURL: BASE_URL,
          fullURL: originalRequest ? `${BASE_URL}${originalRequest.url}` : 'unknown',
          method: originalRequest?.method?.toUpperCase(),
          platform: Platform.OS,
          timeout: this.timeout,
          message: error.message,
          code: error.code,
          name: error.name,
          response: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          } : null,
          request: originalRequest ? {
            headers: originalRequest.headers,
            params: originalRequest.params,
          } : null,
        };

        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          console.error('⏱️ Network timeout:', errorDetails);
        } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('Network request failed')) {
          console.error('🚫 Network error (connection failed):', errorDetails);
          console.error('💡 Troubleshooting tips:');
          console.error('   1. Check if device is on the same network as server');
          console.error('   2. Verify server is running at:', BASE_URL);
          console.error('   3. Check iOS Info.plist NSAppTransportSecurity settings');
          console.error('   4. Try accessing URL in Safari on iOS device');
        } else if (error.response) {
          // Server responded with error status
          console.error('⚠️ API error (server responded):', errorDetails);
        } else if (error.request) {
          // Request was made but no response received
          console.error('📡 Request sent but no response:', errorDetails);
        } else {
          // Request setup failed
          console.error('❌ Request setup error:', errorDetails);
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }
}

export const httpClient = new HttpClient();
