import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AdminAuthProvider, useAdminAuth } from '../AdminAuthContext';
import { adminAuthService } from '@/services/adminAuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock services
jest.mock('@/services/adminAuthService');
jest.mock('@/services/httpClient', () => ({
  httpClient: {
    setLogoutCallback: jest.fn(),
    setRefreshTokenCallback: jest.fn(),
  },
}));

const mockAdminAuthService = adminAuthService as jest.Mocked<typeof adminAuthService>;

describe('AdminAuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('provides initial loading state', () => {
    mockAdminAuthService.getCurrentAdmin.mockRejectedValue(new Error('No token'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    );

    const { result } = renderHook(() => useAdminAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('signs in successfully', async () => {
    const mockAdmin = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
    };

    mockAdminAuthService.signIn.mockResolvedValue({
      success: true,
      data: {
        admin: mockAdmin,
        token: 'test-token',
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    );

    const { result } = renderHook(() => useAdminAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const success = await result.current.signIn('admin@example.com', 'password');
      expect(success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.admin).toEqual(mockAdmin);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('admin_token', 'test-token');
  });

  it('handles sign in failure', async () => {
    mockAdminAuthService.signIn.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    );

    const { result } = renderHook(() => useAdminAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const success = await result.current.signIn('admin@example.com', 'wrong');
      expect(success).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.lastError).toBe('Invalid credentials');
  });

  it('signs out successfully', async () => {
    mockAdminAuthService.signOut.mockResolvedValue({
      success: true,
      message: 'Signed out',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    );

    const { result } = renderHook(() => useAdminAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.admin).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('admin_token');
  });

  it('updates profile successfully', async () => {
    const mockAdmin = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
    };

    mockAdminAuthService.updateProfile.mockResolvedValue({
      success: true,
      data: { ...mockAdmin, name: 'Updated Name' },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    );

    const { result } = renderHook(() => useAdminAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.updateProfile({ name: 'Updated Name' });
      expect(success).toBe(true);
    });

    expect(result.current.admin?.name).toBe('Updated Name');
  });

  it('checks permissions correctly', () => {
    const mockAdmin = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const,
      permissions: [
        { id: 'p1', name: 'Manage Services', resource: 'services', action: 'read' },
        { id: 'p2', name: 'Manage Bookings', resource: 'bookings', action: 'read' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
    };

    mockAdminAuthService.getCurrentAdmin.mockResolvedValue(mockAdmin);
    AsyncStorage.getItem.mockResolvedValue('token');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminAuthProvider>{children}</AdminAuthProvider>
    );

    const { result } = renderHook(() => useAdminAuth(), { wrapper });

    waitFor(() => {
      expect(result.current.hasPermission('services', 'read')).toBe(true);
      expect(result.current.hasPermission('bookings', 'read')).toBe(true);
      expect(result.current.hasPermission('services', 'delete')).toBe(false);
    });
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useAdminAuth());
    }).toThrow('useAdminAuth must be used within an AdminAuthProvider');

    console.error = originalError;
  });
});

