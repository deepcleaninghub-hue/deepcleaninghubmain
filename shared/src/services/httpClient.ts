/**
 * Simple HTTP Client for React Native
 * 
 * A simple, reliable HTTP client that matches the working original apps.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/environment';
import { modalService } from './modalService';

// Use environment configuration for proper API URL
const BASE_URL = API_BASE_URL;

interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

class SimpleHttpClient {
  private logoutCallback: (() => void) | null = null;
  private refreshTokenCallback: (() => Promise<boolean>) | null = null;

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
      await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
      console.log('🔐 User logged out due to session expiration');

      // Show session expired modal - will be translated in the component
      modalService.showError(
        'Session Expired', // Will be translated in component
        'Your session has expired. Please log in again.' // Will be translated in component
      );

      // Trigger the logout callback if set
      setTimeout(() => {
        if (this.logoutCallback) {
          this.logoutCallback();
        }
      }, 2000); // Give user time to read the message
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  private async request<T>(endpoint: string, options: HttpOptions = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    // Get auth token from storage
    const token = await AsyncStorage.getItem('auth_token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    // HTTP request debug - silent in production

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body && options.method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Response debug - silent

      if (!response.ok) {
        const errorData = await response.json();
        console.error('HTTP error response:', errorData);

        // Handle 401 errors - try token refresh first
        if (response.status === 401) {
          const isJWTError = errorData.error && (
            errorData.error.includes('Token verification failed') ||
            errorData.error.includes('jwt malformed') ||
            errorData.error.includes('invalid token')
          );

          if (isJWTError) {
            // Invalid token structure - cannot refresh, must logout
            console.log('JWT signature error detected, triggering logout...');
            await this.triggerLogout();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          // Try to refresh token for expired tokens
          if (this.refreshTokenCallback) {
            try {
              console.log('Token expired, attempting to refresh...');
              const refreshSuccess = await this.refreshTokenCallback();

              if (refreshSuccess) {
                // Retry the request with new token
                const newToken = await AsyncStorage.getItem('auth_token');
                if (newToken) {
                  const retryHeaders = {
                    ...headers,
                    'Authorization': `Bearer ${newToken}`,
                  };
                  const retryConfig: RequestInit = {
                    ...config,
                    headers: retryHeaders,
                  };
                  const retryResponse = await fetch(url, retryConfig);
                  if (retryResponse.ok) {
                    if (retryResponse.status === 204) {
                      return {} as T;
                    }
                    return await retryResponse.json();
                  }
                }
              } else {
                console.log('Token refresh failed, but not logging out automatically');
                // Don't logout automatically - let user continue using the app
              }
            } catch (refreshError) {
              console.error('Token refresh error:', refreshError);
              // Don't logout automatically on refresh error
            }
          }
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      if (response.status === 204) {
        // No content response - silent
        return {} as T; // No content
      }

      const responseData = await response.json();
      // Response data - silent
      return responseData;
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  // Generic methods
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = endpoint;
    if (params) {
      // Convert Supabase-style filters to proper query parameters
      const queryParams: string[] = [];
      Object.entries(params).forEach(([key, value]) => {
        if (value.startsWith('eq.')) {
          // Properly encode the value after 'eq.'
          const filterValue = value.substring(3);
          queryParams.push(`${key}=eq.${encodeURIComponent(filterValue)}`);
        } else if (value.startsWith('order.')) {
          queryParams.push(`order=${encodeURIComponent(value.substring(6))}`);
        } else {
          queryParams.push(`${key}=${encodeURIComponent(value)}`);
        }
      });
      url += `?${queryParams.join('&')}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  async patch<T>(endpoint: string, data: any, id?: string): Promise<T> {
    const url = id ? `${endpoint}?id=eq.${id}` : endpoint;
    return this.request<T>(url, { method: 'PATCH', body: data });
  }

  async update<T>(endpoint: string, data: any, id: string): Promise<T> {
    const url = `${endpoint}?id=eq.${id}`;
    return this.request<T>(url, { method: 'PATCH', body: data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const httpClient = new SimpleHttpClient();