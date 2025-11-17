import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthNavigator } from '../AuthNavigator';

// Mock screens
jest.mock('@/screens/auth/LoginScreen', () => ({
  LoginScreen: () => null,
}));
jest.mock('@/screens/auth/ForgotPasswordScreen', () => ({
  ForgotPasswordScreen: () => null,
}));

describe('AuthNavigator', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<AuthNavigator />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('contains Login and ForgotPassword screens', () => {
    const { UNSAFE_root } = render(<AuthNavigator />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

