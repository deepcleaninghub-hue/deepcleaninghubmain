import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BASE_URL = 'http://192.168.29.65:5001/api'; // Use local backend

class HttpClient {
  private client: AxiosInstance;
  private logoutCallback: (() => void) | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // Method to set logout callback
  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
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

          // Check if it's a JWT signature error
          const errorData = error.response?.data as any;
          if (errorData?.error && errorData.error.includes('Token verification failed')) {
            console.log('JWT signature error detected, triggering admin logout...');
            await this.triggerLogout();
          } else {
            // Regular 401 - just clear tokens
            try {
              await AsyncStorage.multiRemove(['admin_token', 'admin_refresh_token', 'admin_user']);
              console.log('Authentication failed, please login again');
            } catch (refreshError) {
              console.error('Token cleanup failed:', refreshError);
            }
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
