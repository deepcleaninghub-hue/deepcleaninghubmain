import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../config/environment';

// Use environment configuration for proper API URL
const BASE_URL = API_BASE_URL;

class HttpClient {
  private client: AxiosInstance;
  private logoutCallback: (() => void) | null = null;
  private refreshTokenCallback: (() => Promise<boolean>) | null = null;

  constructor() {
    // Increase timeout for production environments (30 seconds)
    // Development can use shorter timeout (10 seconds)
    const isProduction = BASE_URL.includes('deepcleaninghub.com') ||
      BASE_URL.includes('54.252.116.156') ||
      BASE_URL.startsWith('https://'); // HTTPS URLs are typically production
    const timeout = isProduction ? 30000 : 10000;

    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`🔧 HTTP Client configured: ${BASE_URL}, timeout: ${timeout}ms`);
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
      console.log('🔐 Admin logged out due to session expiration');

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
      async (config: InternalAxiosRequestConfig) => {
        try {
          const token = await AsyncStorage.getItem('admin_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
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
            console.log('JWT signature error detected, triggering admin logout...');
            await this.triggerLogout();
            return Promise.reject(error);
          }

          // Try to refresh token for expired tokens
          if (this.refreshTokenCallback) {
            try {
              console.log('Token expired, attempting to refresh...');
              const refreshSuccess = await this.refreshTokenCallback();

              if (refreshSuccess) {
                // Retry the original request with new token
                const newToken = await AsyncStorage.getItem('admin_token');
                if (newToken && originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  return this.client(originalRequest);
                }
              } else {
                console.log('Token refresh failed, but not logging out automatically');
                // Don't logout automatically - let user continue using the app
                // They will be prompted to login when they try to use a protected feature
              }
            } catch (refreshError) {
              console.error('Token refresh error:', refreshError);
              // Don't logout automatically on refresh error
            }
          } else {
            console.log('No refresh token callback set, skipping token refresh');
          }
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
