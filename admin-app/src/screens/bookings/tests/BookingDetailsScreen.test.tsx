import React from 'react';
import { render } from '@testing-library/react-native';
import { BookingDetailsScreen } from '../BookingDetailsScreen';

// Mock dependencies
jest.mock('@/services/adminDataService', () => ({
  adminDataService: {
    getBooking: jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: '1',
        serviceId: 's1',
        customerId: 'c1',
        date: '2024-01-15',
        time: '10:00',
        status: 'pending',
      },
    }),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { bookingId: '1' },
  }),
}));

describe('BookingDetailsScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = render(<BookingDetailsScreen />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

