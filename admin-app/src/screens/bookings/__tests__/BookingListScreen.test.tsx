import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookingListScreen } from '../BookingListScreen';
import { AdminBooking } from '@/types';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock AdminDataContext
jest.mock('@/contexts/AdminDataContext', () => ({
  useAdminData: () => ({
    bookings: [],
    refreshBookings: jest.fn(),
  }),
}));

// Mock adminDataService
jest.mock('@/services/adminDataService', () => ({
  adminDataService: {
    updateBookingStatus: jest.fn(),
  },
}));

describe('BookingListScreen - Filter Removal', () => {
  it('renders without filter button', () => {
    const { queryByText } = render(
      <BookingListScreen navigation={mockNavigation} />
    );

    // Filter button should not exist
    expect(queryByText('Filter')).toBeNull();
    expect(queryByText('Filtered')).toBeNull();
  });

  it('does not show filter modal', () => {
    const { queryByText } = render(
      <BookingListScreen navigation={mockNavigation} />
    );

    // Filter modal content should not exist
    expect(queryByText('Filter Bookings')).toBeNull();
    expect(queryByText('Status')).toBeNull();
    expect(queryByText('Service Type')).toBeNull();
    expect(queryByText('Customer')).toBeNull();
    expect(queryByText('Date Range')).toBeNull();
  });

  it('renders search bar', () => {
    const { getByPlaceholderText } = render(
      <BookingListScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText(/Search by ID, name, email/i)).toBeTruthy();
  });

  it('renders view mode toggle', () => {
    const { getByText } = render(
      <BookingListScreen navigation={mockNavigation} />
    );

    expect(getByText('List')).toBeTruthy();
    expect(getByText('Calendar')).toBeTruthy();
  });

  it('switches between list and calendar view', () => {
    const { getByText } = render(
      <BookingListScreen navigation={mockNavigation} />
    );

    const calendarButton = getByText('Calendar');
    fireEvent.press(calendarButton);

    // Calendar view should be active
    expect(calendarButton).toBeTruthy();
  });
});

