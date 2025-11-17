import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomerListScreen } from '../CustomerListScreen';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('CustomerListScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<CustomerListScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

