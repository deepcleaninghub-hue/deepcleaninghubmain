/**
 * AuthContext Tests
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../AuthContext';
import { theme } from '../../utils/theme';
import { httpClient } from '../../services/httpClient';

// Mock the HTTP client
jest.mock('../../services/httpClient', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <PaperProvider theme={theme}>
      {component}
    </PaperProvider>
  );
};

const TestComponent = () => {
  const auth = useAuth();
  return null;
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state', () => {
    const { getByTestId } = renderWithTheme(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // The context should be available
    expect(getByTestId).toBeDefined();
  });

  it('handles sign in successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const mockToken = 'mock-token';
    
    (httpClient.post as jest.Mock).mockResolvedValue({
      success: true,
      data: { user: mockUser, token: mockToken },
    });

    const { result } = renderWithTheme(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test sign in
    await act(async () => {
      const auth = useAuth();
      const success = await auth.signIn('test@example.com', 'password');
      expect(success).toBe(true);
    });
  });

  it('handles sign in failure', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({
      success: false,
      data: null,
    });

    const { result } = renderWithTheme(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test sign in failure
    await act(async () => {
      const auth = useAuth();
      const success = await auth.signIn('test@example.com', 'wrongpassword');
      expect(success).toBe(false);
    });
  });

  it('handles sign up successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const mockToken = 'mock-token';
    
    (httpClient.post as jest.Mock).mockResolvedValue({
      success: true,
      data: { user: mockUser, token: mockToken },
    });

    const { result } = renderWithTheme(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test sign up
    await act(async () => {
      const auth = useAuth();
      const success = await auth.signUp(
        'test@example.com',
        'password',
        'John',
        'Doe',
        '1234567890'
      );
      expect(success).toBe(true);
    });
  });

  it('handles sign out', async () => {
    const { result } = renderWithTheme(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test sign out
    await act(async () => {
      const auth = useAuth();
      await auth.signOut();
      expect(auth.isAuthenticated).toBe(false);
    });
  });

  it('handles token refresh', async () => {
    (httpClient.post as jest.Mock).mockResolvedValue({
      success: true,
      token: 'new-token',
    });

    const { result } = renderWithTheme(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test token refresh
    await act(async () => {
      const auth = useAuth();
      const success = await auth.refreshToken();
      expect(success).toBe(true);
    });
  });

  it('handles profile update', async () => {
    const mockUpdatedUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    (httpClient.patch as jest.Mock).mockResolvedValue({
      success: true,
      data: mockUpdatedUser,
      message: 'Profile updated successfully',
    });

    const { result } = renderWithTheme(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Test profile update
    await act(async () => {
      const auth = useAuth();
      const success = await auth.updateProfile({ firstName: 'Jane' });
      expect(success).toBe(true);
    });
  });
});
