import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AdminUser, AdminAuthContextType } from '@/types';
import { adminAuthService } from '@/services/adminAuthService';
import { httpClient } from '@/services/httpClient';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!admin;

  useEffect(() => {
    checkAuthState();
  }, []);

  // Set up HTTP client logout callback
  useEffect(() => {
    httpClient.setLogoutCallback(() => {
      setAdmin(null);
      console.log('Admin logged out due to session expiration');
    });
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('admin_token');
      if (token) {
        try {
          const adminData = await adminAuthService.getCurrentAdmin();
          setAdmin(adminData);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid token and reset auth state
          await AsyncStorage.removeItem('admin_token');
          await AsyncStorage.removeItem('admin_refresh_token');
          setAdmin(null);
        }
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
      await AsyncStorage.removeItem('admin_token');
      await AsyncStorage.removeItem('admin_refresh_token');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await adminAuthService.signIn(email, password);
      if (result.success && result.data) {
        setAdmin(result.data.admin);
        await AsyncStorage.setItem('admin_token', result.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await adminAuthService.signOut();
      setAdmin(null);
      await AsyncStorage.removeItem('admin_token');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const updateProfile = async (updates: Partial<AdminUser>): Promise<boolean> => {
    try {
      const result = await adminAuthService.updateProfile(updates);
      if (result.success && result.data) {
        setAdmin(result.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const result = await adminAuthService.refreshToken();
      if (result.success && result.data) {
        setAdmin(result.data.admin);
        await AsyncStorage.setItem('admin_token', result.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await signOut();
      return false;
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!admin) return false;
    
    return admin.permissions.some(
      permission => 
        permission.resource === resource && 
        permission.action === action
    );
  };

  const value: AdminAuthContextType = {
    admin,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    updateProfile,
    refreshToken,
    hasPermission,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
