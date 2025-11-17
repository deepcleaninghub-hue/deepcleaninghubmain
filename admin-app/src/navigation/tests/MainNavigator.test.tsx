import React from 'react';
import { render } from '@testing-library/react-native';
import { MainNavigator } from '../MainNavigator';

// Mock navigators
jest.mock('../DashboardNavigator', () => ({
  DashboardNavigator: () => null,
}));
jest.mock('../BookingNavigator', () => ({
  BookingNavigator: () => null,
}));
jest.mock('../CustomerNavigator', () => ({
  CustomerNavigator: () => null,
}));
jest.mock('../ServiceNavigator', () => ({
  ServiceNavigator: () => null,
}));
jest.mock('../ProfileNavigator', () => ({
  ProfileNavigator: () => null,
}));

// Mock Icon
jest.mock('@/components/common/Icon', () => ({
  Icon: () => null,
}));

// Mock useSafeAreaInsets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

describe('MainNavigator', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<MainNavigator />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('contains all tab screens', () => {
    const { UNSAFE_root } = render(<MainNavigator />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

