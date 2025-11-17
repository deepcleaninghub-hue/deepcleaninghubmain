import React from 'react';
import { render } from '@testing-library/react-native';
import { ServiceEditScreen } from '../ServiceEditScreen';

// Mock dependencies
jest.mock('@/services/adminDataService', () => ({
  adminDataService: {
    getService: jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: '1',
        title: 'Cleaning Service',
        description: 'Test',
        category: 'Cleaning',
        isActive: true,
        pricingType: 'fixed',
      },
    }),
    updateService: jest.fn().mockResolvedValue({
      success: true,
    }),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { serviceId: '1' },
  }),
}));

describe('ServiceEditScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<ServiceEditScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

