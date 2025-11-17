import React from 'react';
import { render } from '@testing-library/react-native';
import { ServiceCreateScreen } from '../ServiceCreateScreen';

// Mock dependencies
jest.mock('@/services/adminDataService', () => ({
  adminDataService: {
    createService: jest.fn().mockResolvedValue({
      success: true,
    }),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe('ServiceCreateScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<ServiceCreateScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

