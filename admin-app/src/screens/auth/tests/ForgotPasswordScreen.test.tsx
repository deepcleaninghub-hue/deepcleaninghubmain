import React from 'react';
import { render } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../ForgotPasswordScreen';

// Mock dependencies
jest.mock('@/components/common/LoadingSpinner', () => ({
  LoadingSpinner: ({ children }: any) => children,
}));
jest.mock('@/components/common/Icon', () => ({
  Icon: () => null,
}));

describe('ForgotPasswordScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<ForgotPasswordScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders email input field', () => {
    const { getByPlaceholderText } = render(<ForgotPasswordScreen />);
    expect(getByPlaceholderText(/email/i)).toBeTruthy();
  });
});

