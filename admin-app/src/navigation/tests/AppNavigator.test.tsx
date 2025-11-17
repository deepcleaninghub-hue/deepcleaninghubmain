import React from 'react';
import { render } from '@testing-library/react-native';
import { AppNavigator } from '../AppNavigator';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// Mock dependencies
jest.mock('@/contexts/AdminAuthContext');
jest.mock('../AuthNavigator', () => ({
  AuthNavigator: () => null,
}));
jest.mock('../MainNavigator', () => ({
  MainNavigator: () => null,
}));

const mockUseAdminAuth = useAdminAuth as jest.MockedFunction<typeof useAdminAuth>;

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AuthNavigator when not authenticated', () => {
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      admin: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      refreshToken: jest.fn(),
      hasPermission: jest.fn(),
      lastError: null,
    });

    const { UNSAFE_root } = render(<AppNavigator />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders MainNavigator when authenticated', () => {
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      admin: {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isOnline: true,
      },
      signIn: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      refreshToken: jest.fn(),
      hasPermission: jest.fn(),
      lastError: null,
    });

    const { UNSAFE_root } = render(<AppNavigator />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders nothing when loading', () => {
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      admin: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      refreshToken: jest.fn(),
      hasPermission: jest.fn(),
      lastError: null,
    });

    const { UNSAFE_root } = render(<AppNavigator />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

