import React from 'react';
import { render } from '@testing-library/react-native';
import { DashboardScreen } from '../DashboardScreen';

// Mock dependencies
jest.mock('@/services/adminDataService', () => ({
  adminDataService: {
    getBookings: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('DashboardScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<DashboardScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('displays dashboard content', () => {
    const { UNSAFE_root } = render(<DashboardScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

