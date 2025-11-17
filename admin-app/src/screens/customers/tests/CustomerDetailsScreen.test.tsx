import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomerDetailsScreen } from '../CustomerDetailsScreen';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { customerId: '1' },
  }),
}));

describe('CustomerDetailsScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<CustomerDetailsScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

