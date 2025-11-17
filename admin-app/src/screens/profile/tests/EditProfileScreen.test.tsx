import React from 'react';
import { render } from '@testing-library/react-native';
import { EditProfileScreen } from '../EditProfileScreen';

// Mock dependencies
jest.mock('@/contexts/AdminAuthContext', () => ({
  useAdminAuth: () => ({
    admin: {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
    },
    loading: false,
    isAuthenticated: true,
    signIn: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn().mockResolvedValue(true),
    refreshToken: jest.fn(),
    hasPermission: jest.fn(),
    lastError: null,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe('EditProfileScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<EditProfileScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

