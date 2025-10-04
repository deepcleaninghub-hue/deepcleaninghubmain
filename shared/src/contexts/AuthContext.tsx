/**
 * Authentication Context
 * 
 * Centralized authentication state management with proper error handling,
 * token refresh, and session management.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpClient } from '../services/httpClient';
import { secureLog, config } from '../config/environment';
import { User, AuthContextType } from '../types';
import { useLanguage } from './LanguageContext';
import { modalService } from '../services/modalService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Load user from storage on app start
  useEffect(() => {
    loadStoredUser();
  }, []);

  // Set up HTTP client logout callback
  useEffect(() => {
    httpClient.setLogoutCallback(() => {
      setUser(null);
      secureLog('info', 'User logged out due to session expiration');
    });
  }, []);

  // Token refresh mechanism
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      const success = await refreshToken();
      if (!success) {
        secureLog('warn', 'Token refresh failed, signing out');
        await signOut();
      }
    }, config.TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Session timeout handling (disabled if SESSION_TIMEOUT is 0)
  useEffect(() => {
    if (!user || config.SESSION_TIMEOUT === 0) return;

    const timeout = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > config.SESSION_TIMEOUT) {
        secureLog('info', 'Session timeout, signing out');
        signOut();
      }
    }, config.SESSION_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [user, lastActivity]);

  // Update last activity on user interaction
  const updateLastActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  const loadStoredUser = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_STORAGE_KEY),
      ]);
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        secureLog('info', 'Loaded user from storage', { email: userData.email });
      } else {
        secureLog('info', 'No stored user or token found');
        await clearStoredAuthData();
      }
    } catch (error) {
      secureLog('error', 'Error loading stored user', { error });
      await clearStoredAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearStoredAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, TOKEN_STORAGE_KEY]);
    } catch (error) {
      secureLog('error', 'Error clearing stored auth data', { error });
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      updateLastActivity();

      secureLog('info', 'Attempting to sign in', { email });

      const response = await httpClient.post<{ success: boolean; data: { user: User; token: string }; error?: string }>(
        '/mobile-auth/signin',
        {
          email: email.toLowerCase().trim(),
          password,
        }
      );

      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        await Promise.all([
          AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData)),
          AsyncStorage.setItem(TOKEN_STORAGE_KEY, token),
        ]);
        
        setUser(userData);
        secureLog('info', 'Sign in successful', { email: userData.email });
        return true;
      } else {
        // Handle specific authentication errors
        const errorMessage = response.error || 'Invalid email or password';
        modalService.showError(
          'Login Failed', 
          errorMessage.includes('Invalid credentials') || errorMessage.includes('Invalid email') || errorMessage.includes('Invalid password')
            ? 'Wrong email or password. Please check your credentials and try again.'
            : errorMessage
        );
        return false;
      }
    } catch (error: any) {
      secureLog('error', 'Sign in error', { error, email });
      
      // Handle network errors
      if (error.message && error.message.includes('Network request failed')) {
        modalService.showError(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else if (error.message && error.message.includes('401')) {
        modalService.showError(
          'Login Failed',
          'Wrong email or password. Please check your credentials and try again.'
        );
      } else {
        modalService.showError(
          'Login Error',
          'Failed to sign in. Please try again.'
        );
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    address: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      updateLastActivity();

      const response = await httpClient.post<{ success: boolean; data: { user: User; token: string }; error?: string }>(
        '/mobile-auth/signup',
        {
          email: email.toLowerCase().trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }
      );

      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        await Promise.all([
          AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData)),
          AsyncStorage.setItem(TOKEN_STORAGE_KEY, token),
        ]);
        
        setUser(userData);
        secureLog('info', 'Sign up successful', { email: userData.email });
        return true;
      } else {
        // Handle specific signup errors
        const errorMessage = response.error || 'Failed to create account';
        modalService.showError(
          'Sign Up Failed', 
          errorMessage.includes('already exists') || errorMessage.includes('User already exists')
            ? 'An account with this email already exists. Please try logging in instead.'
            : errorMessage.includes('Invalid email')
            ? 'Please enter a valid email address.'
            : errorMessage.includes('Password must be')
            ? 'Password must be at least 6 characters long.'
            : errorMessage
        );
        return false;
      }
    } catch (error: any) {
      secureLog('error', 'Sign up error', { error, email });
      
      // Handle network errors
      if (error.message && error.message.includes('Network request failed')) {
        modalService.showError(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else if (error.message && error.message.includes('400')) {
        modalService.showError(
          'Sign Up Failed',
          'Please check your information and try again.'
        );
      } else {
        modalService.showError(
          'Sign Up Error',
          'Failed to create account. Please try again.'
        );
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setUser(null);
      await clearStoredAuthData();
      secureLog('info', 'User signed out successfully');
    } catch (error) {
      secureLog('error', 'Sign out error', { error });
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      updateLastActivity();

      const response = await httpClient.patch<{ success: boolean; data: User; message?: string }>(
        '/profile',
        updates
      );
      
      if (response.success && response.data) {
        const updatedUser = { ...user, ...response.data, updatedAt: new Date().toISOString() };
        setUser(updatedUser);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
        
        modalService.showSuccess(t('common.success'), response.message || t('profile.profileUpdatedSuccess'));
        return true;
      } else {
        modalService.showError(t('common.error'), t('profile.failedToUpdateProfile'));
        return false;
      }
    } catch (error) {
      secureLog('error', 'Update profile error', { error, userId: user.id });
      modalService.showError(t('common.error'), t('profile.failedToUpdateProfile'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await httpClient.post<{ success: boolean; token?: string }>('/auth/refresh', {});
      if (response.success && response.token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.token);
        updateLastActivity();
        return true;
      }
      return false;
    } catch (error) {
      secureLog('error', 'Token refresh failed', { error });
      return false;
    }
  }, [updateLastActivity]);

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const clearAllAuthData = async (): Promise<void> => {
    try {
      setUser(null);
      await clearStoredAuthData();
      secureLog('info', 'All authentication data cleared');
    } catch (error) {
      secureLog('error', 'Error clearing auth data', { error });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateUser,
    clearAllAuthData,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
