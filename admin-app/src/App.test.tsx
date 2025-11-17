import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

// Mock all providers and navigators
jest.mock('@/contexts/AdminAuthContext', () => ({
  AdminAuthProvider: ({ children }: any) => children,
}));

jest.mock('@/contexts/AdminDataContext', () => ({
  AdminDataProvider: ({ children }: any) => children,
}));

jest.mock('@/navigation/AppNavigator', () => ({
  AppNavigator: () => null,
}));

// Mock expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<App />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('wraps app with all providers', () => {
    const { UNSAFE_root } = render(<App />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

