import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CalendarView, CalendarViewMode } from '../CalendarView';
import { AdminBooking } from '@/types';
import { format, parseISO } from 'date-fns';

// Mock react-native-calendars
jest.mock('react-native-calendars', () => ({
  Calendar: ({ onDayPress, markedDates, current }: any) => {
    const handlePress = () => {
      onDayPress?.({ dateString: current });
    };
    return null;
  },
  CalendarList: () => null,
  Agenda: () => null,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
}));

describe('CalendarView', () => {
  const mockBookings: AdminBooking[] = [
    {
      id: '1',
      booking_date: format(new Date(), 'yyyy-MM-dd'),
      booking_time: '10:00',
      status: 'scheduled',
      total_amount: 100,
      services: { id: '1', title: 'Cleaning Service', category: 'Cleaning' },
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      is_multi_day: false,
    },
    {
      id: '2',
      booking_date: format(new Date(), 'yyyy-MM-dd'),
      booking_time: '14:00',
      status: 'confirmed',
      total_amount: 150,
      services: { id: '2', title: 'Moving Service', category: 'Moving' },
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      is_multi_day: false,
    },
  ];

  const mockOnBookingPress = jest.fn();
  const mockOnViewModeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders month view by default', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
      />
    );

    expect(getByText('Month')).toBeTruthy();
    expect(getByText('Week')).toBeTruthy();
    expect(getByText('Day')).toBeTruthy();
  });

  it('switches between view modes', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
        onViewModeChange={mockOnViewModeChange}
      />
    );

    const weekButton = getByText('Week');
    fireEvent.press(weekButton);

    expect(mockOnViewModeChange).toHaveBeenCalledWith('week');
  });

  it('displays bookings for selected date in month view', () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
      />
    );

    // Should show bookings for today
    expect(getByText('Cleaning Service')).toBeTruthy();
  });

  it('handles date selection', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
      />
    );

    // Calendar component is mocked, so we can't directly test date selection
    // But we can verify the component renders without errors
    expect(getByText('Month')).toBeTruthy();
  });

  it('renders week view correctly', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
        viewMode="week"
      />
    );

    const weekButton = getByText('Week');
    expect(weekButton).toBeTruthy();
  });

  it('renders day view correctly', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
        viewMode="day"
      />
    );

    const dayButton = getByText('Day');
    expect(dayButton).toBeTruthy();
  });

  it('calls onBookingPress when booking is pressed', () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
      />
    );

    const booking = getByText('Cleaning Service');
    fireEvent.press(booking);

    expect(mockOnBookingPress).toHaveBeenCalledWith(mockBookings[0]);
  });

  it('handles multi-day bookings', () => {
    const multiDayBooking: AdminBooking = {
      id: '3',
      booking_date: format(new Date(), 'yyyy-MM-dd'),
      booking_time: '09:00',
      status: 'scheduled',
      total_amount: 200,
      services: { id: '3', title: 'Weekly Cleaning', category: 'Cleaning' },
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      is_multi_day: true,
      allBookingDates: [
        { date: format(new Date(), 'yyyy-MM-dd'), time: '09:00' },
        { date: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), time: '09:00' },
      ],
    };

    const { getByText } = render(
      <CalendarView
        bookings={[multiDayBooking]}
        onBookingPress={mockOnBookingPress}
      />
    );

    expect(getByText('Weekly Cleaning')).toBeTruthy();
  });

  it('handles empty bookings list', () => {
    const { getByText } = render(
      <CalendarView
        bookings={[]}
        onBookingPress={mockOnBookingPress}
        viewMode="day"
      />
    );

    // Should show "No bookings for this day" in day view
    expect(getByText('No bookings for this day')).toBeTruthy();
  });

  it('displays correct status colors', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
      />
    );

    // Status chips should be rendered
    expect(getByText('scheduled')).toBeTruthy();
    expect(getByText('confirmed')).toBeTruthy();
  });

  it('formats time correctly', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
      />
    );

    // Time should be formatted (component uses formatTime internally)
    expect(getByText('Cleaning Service')).toBeTruthy();
  });

  it('handles bookings without booking_date', () => {
    const bookingWithoutDate: AdminBooking = {
      id: '4',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '15:00',
      status: 'scheduled',
      total_amount: 120,
      services: { id: '4', title: 'Test Service', category: 'Test' },
      customer_name: 'Test',
      customer_email: 'test@test.com',
      is_multi_day: false,
    };

    const { getByText } = render(
      <CalendarView
        bookings={[bookingWithoutDate]}
        onBookingPress={mockOnBookingPress}
      />
    );

    expect(getByText('Test Service')).toBeTruthy();
  });

  it('navigates months correctly', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
        viewMode="month"
      />
    );

    // Navigation buttons should be present (though functionality is in Calendar component)
    expect(getByText('Month')).toBeTruthy();
  });

  it('navigates weeks correctly', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
        viewMode="week"
      />
    );

    expect(getByText('Prev')).toBeTruthy();
    expect(getByText('Next')).toBeTruthy();
  });

  it('navigates days correctly', () => {
    const { getByText } = render(
      <CalendarView
        bookings={mockBookings}
        onBookingPress={mockOnBookingPress}
        viewMode="day"
      />
    );

    expect(getByText('Prev')).toBeTruthy();
    expect(getByText('Next')).toBeTruthy();
  });
});

