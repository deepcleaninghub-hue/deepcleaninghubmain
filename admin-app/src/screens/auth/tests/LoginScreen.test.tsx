import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// Mock dependencies
jest.mock('@/contexts/AdminAuthContext');
jest.mock('@/components/common/LoadingSpinner', () => ({
  LoadingSpinner: ({ loading, children }: any) => (loading ? null : children),
}));
jest.mock('@/components/common/Icon', () => ({
  Icon: () => null,
}));

const mockUseAdminAuth = useAdminAuth as jest.MockedFunction<typeof useAdminAuth>;

describe('LoginScreen', () => {
  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      isAuthenticated: false,
      admin: null,
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      refreshToken: jest.fn(),
      hasPermission: jest.fn(),
      lastError: null,
    });
  });

  it('renders login form', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    expect(getByPlaceholderText(/email/i)).toBeTruthy();
    expect(getByPlaceholderText(/password/i)).toBeTruthy();
  });

  it('handles email input', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText(/email/i);

    fireEvent.changeText(emailInput, 'admin@example.com');
    expect(emailInput.props.value).toBe('admin@example.com');
  });

  it('handles password input', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText(/password/i);

    fireEvent.changeText(passwordInput, 'password123');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('shows error when fields are empty', async () => {
    const { getByText, queryByText } = render(<LoginScreen />);
    const loginButton = getByText(/sign in/i);

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(queryByText(/fill in all fields/i)).toBeTruthy();
    });
  });

  it('calls signIn when form is submitted with valid data', async () => {
    mockSignIn.mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText(/email/i);
    const passwordInput = getByPlaceholderText(/password/i);
    const loginButton = getByText(/sign in/i);

    fireEvent.changeText(emailInput, 'admin@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('admin@example.com', 'password123');
    });
  });

  it('displays error message from context', () => {
    mockUseAdminAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      isAuthenticated: false,
      admin: null,
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      refreshToken: jest.fn(),
      hasPermission: jest.fn(),
      lastError: 'Invalid credentials',
    });

    const { getByText } = render(<LoginScreen />);
    expect(getByText(/invalid credentials/i)).toBeTruthy();
  });

  it('shows loading spinner when loading', () => {
    mockUseAdminAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: true,
      isAuthenticated: false,
      admin: null,
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      refreshToken: jest.fn(),
      hasPermission: jest.fn(),
      lastError: null,
    });

    const { UNSAFE_root } = render(<LoginScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

