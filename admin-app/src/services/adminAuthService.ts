import { AdminUser, AdminApiResponse } from '@/types';
import { httpClient } from './httpClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SignInResponse {
  admin: AdminUser;
  token: string;
}

export const adminAuthService = {
  async signIn(email: string, password: string): Promise<AdminApiResponse<SignInResponse>> {
    try {
      console.log('🔐 Attempting to sign in...');
      const response = await httpClient.post('/auth/login', {
        email,
        password,
      });

      console.log('✅ Sign in response received:', response.data);

      if (response.data.success) {
        const { user, token } = response.data.data;
        const admin: AdminUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          createdAt: user.created_at || new Date().toISOString(),
          updatedAt: user.updated_at || new Date().toISOString(),
          role: user.role,
          permissions: [
            { id: 'p1', name: 'Manage Services', resource: 'services', action: 'read' },
            { id: 'p2', name: 'Manage Bookings', resource: 'bookings', action: 'read' },
            { id: 'p3', name: 'Manage Customers', resource: 'customers', action: 'read' },
            { id: 'p4', name: 'Dashboard', resource: 'dashboard', action: 'read' },
          ],
          lastActive: user.last_login || new Date().toISOString(),
          isOnline: true,
        };

        return {
          success: true,
          data: {
            admin,
            token,
          },
        };
      }

      return {
        success: false,
        error: response.data.error || 'Login failed',
      };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);

      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          success: false,
          error: 'Connection timeout. Please check your internet connection and try again.',
        };
      }

      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }

      // Handle other errors
      const errorMessage = error.response?.data?.error || error.message || 'Failed to sign in. Please try again.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  async signOut(): Promise<AdminApiResponse> {
    try {
      const response = await httpClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if the API call fails, we should still return success
      // because logout is primarily a client-side operation
      return {
        success: true,
        message: 'Signed out successfully',
      };
    }
  },

  async getCurrentAdmin(): Promise<AdminUser> {
    try {
      const response = await httpClient.get('/auth/admin/me');
      if (response.data.success) {
        const user = response.data.data;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          createdAt: user.created_at || new Date().toISOString(),
          updatedAt: user.updated_at || new Date().toISOString(),
          role: user.role,
          permissions: [
            { id: 'p1', name: 'Manage Services', resource: 'services', action: 'read' },
            { id: 'p2', name: 'Manage Bookings', resource: 'bookings', action: 'read' },
            { id: 'p3', name: 'Manage Customers', resource: 'customers', action: 'read' },
            { id: 'p4', name: 'Dashboard', resource: 'dashboard', action: 'read' },
          ],
          lastActive: user.last_login || new Date().toISOString(),
          isOnline: true,
        } as AdminUser;
      }
      throw new Error('Failed to get admin data');
    } catch (error) {
      console.error('Get current admin error:', error);
      throw error;
    }
  },

  async updateProfile(updates: Partial<AdminUser>): Promise<AdminApiResponse<AdminUser>> {
    try {
      const response = await httpClient.put('/auth/admin/me', updates);
      if (response.data.success) {
        const user = response.data.data;
        return {
          success: true,
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            createdAt: user.created_at || new Date().toISOString(),
            updatedAt: user.updated_at || new Date().toISOString(),
            role: user.role,
            permissions: [
              { id: 'p1', name: 'Manage Services', resource: 'services', action: 'read' },
              { id: 'p2', name: 'Manage Bookings', resource: 'bookings', action: 'read' },
              { id: 'p3', name: 'Manage Customers', resource: 'customers', action: 'read' },
              { id: 'p4', name: 'Dashboard', resource: 'dashboard', action: 'read' },
            ],
            lastActive: user.last_login || new Date().toISOString(),
            isOnline: true,
          } as AdminUser,
          message: response.data.message,
        };
      }
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update profile.',
      };
    }
  },

  async refreshToken(): Promise<AdminApiResponse<SignInResponse>> {
    try {
      // Mark this as a refresh request to prevent infinite loops
      const response = await httpClient.post('/auth/refresh', {}, {
        // @ts-ignore - Adding custom flag to prevent refresh loop
        _isRefreshRequest: true,
      } as any);
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Fallback to demo token if present
      const token = await AsyncStorage.getItem('admin_token');
      if (token === 'demo-token') {
        return {
          success: true,
          data: {
            admin: {
              id: 'demo-admin-1',
              name: 'Demo Admin',
              email: 'demo@deepclean.com',
              phone: '+10000000000',
              address: '123 Demo Street',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              role: 'admin',
              permissions: [
                { id: 'p1', name: 'Manage Services', resource: 'services', action: 'read' },
                { id: 'p2', name: 'Manage Bookings', resource: 'bookings', action: 'read' },
                { id: 'p3', name: 'Manage Customers', resource: 'customers', action: 'read' },
                { id: 'p4', name: 'Dashboard', resource: 'dashboard', action: 'read' },
              ],
              lastActive: new Date().toISOString(),
              isOnline: true,
            } as AdminUser,
            token: 'demo-token',
          },
        };
      }
      return { success: false, error: 'Failed to refresh token.' };
    }
  },

  async forgotPassword(email: string): Promise<AdminApiResponse> {
    try {
      const response = await httpClient.post('/admin/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: 'Failed to send password reset email.',
      };
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<AdminApiResponse> {
    try {
      const response = await httpClient.post('/admin/auth/reset-password', {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Failed to reset password.',
      };
    }
  },
};
