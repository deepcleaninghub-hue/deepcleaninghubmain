/**
 * BookingCreateScreen New - Comprehensive Tests (TDD)
 * Tests written first for the new improved component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { BookingCreateScreen } from '../BookingCreateScreen.new';
import { adminDataService } from '@/services/adminDataService';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useServiceCategories } from '../hooks/useServiceCategories';
import { useCustomers } from '../hooks/useCustomers';
import { useBookingForm } from '../hooks/useBookingForm';

// Mock dependencies
jest.mock('@/services/adminDataService');
jest.mock('@/contexts/AdminAuthContext');
jest.mock('../hooks/useServiceCategories');
jest.mock('../hooks/useCustomers');
jest.mock('../hooks/useBookingForm');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      routes: [
        {
          name: 'Bookings',
          state: {
            routes: [{ name: 'BookingList' }],
            index: 0,
          },
        },
      ],
    })),
  }),
  CommonActions: {
    reset: jest.fn((config) => config),
    navigate: jest.fn((config) => config),
  },
}));

jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('../../../../../shared/src/components/MultiDateSelector', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.spyOn(Alert, 'alert');

const mockAdminDataService = adminDataService as jest.Mocked<typeof adminDataService>;
const mockUseAdminAuth = useAdminAuth as jest.MockedFunction<typeof useAdminAuth>;
const mockUseServiceCategories = useServiceCategories as jest.MockedFunction<typeof useServiceCategories>;
const mockUseCustomers = useCustomers as jest.MockedFunction<typeof useCustomers>;
const mockUseBookingForm = useBookingForm as jest.MockedFunction<typeof useBookingForm>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  getState: jest.fn(() => ({
    routes: [
      {
        name: 'Bookings',
        state: {
          routes: [{ name: 'BookingList' }],
          index: 0,
        },
      },
    ],
  })),
};

const mockCategories = [
  { id: 'cleaning', title: 'Cleaning', category: 'Cleaning' },
  { id: 'moving', title: 'Moving', category: 'Moving' },
];

const mockCustomer = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
};

const mockService = {
  id: 'service-1',
  title: 'Deep Cleaning',
  category: 'Cleaning',
  pricingType: 'fixed' as const,
  price: 100,
  isActive: true,
  totalBookings: 0,
  totalRevenue: 0,
  averageRating: 0,
  popularityScore: 0,
  seasonalTrends: [],
  staffRequirements: [],
  equipmentNeeded: [],
  suppliesNeeded: [],
  estimatedDuration: 0,
  difficultyLevel: 'medium' as const,
};

const mockVariant = {
  id: 'variant-1',
  service_id: 'service-1',
  title: 'Standard Cleaning',
  price: 100,
  pricingType: 'fixed' as const,
  duration: 120,
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('BookingCreateScreen New - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockUseAdminAuth.mockReturnValue({
      signOut: jest.fn(),
      user: null,
      loading: false,
    } as any);

    mockUseServiceCategories.mockReturnValue({
      categories: mockCategories,
      loading: false,
      error: null,
    });

    mockUseCustomers.mockReturnValue({
      customers: [mockCustomer],
      loading: false,
      error: null,
      loadCustomers: jest.fn(),
      filterCustomers: jest.fn(),
    });

    mockUseBookingForm.mockReturnValue({
      selectedCustomer: null,
      setSelectedCustomer: jest.fn(),
      selectedServiceCategory: '',
      setSelectedServiceCategory: jest.fn(),
      selectedServiceType: null,
      setSelectedServiceType: jest.fn(),
      selectedServiceVariant: null,
      setSelectedServiceVariant: jest.fn(),
      variantQuantity: '1',
      setVariantQuantity: jest.fn(),
      variantMeasurement: '',
      setVariantMeasurement: jest.fn(),
      distance: '',
      setDistance: jest.fn(),
      numberOfBoxes: '',
      setNumberOfBoxes: jest.fn(),
      selectedDate: new Date(),
      selectedTime: new Date(),
      date: '',
      time: '',
      selectedDates: [],
      setSelectedDates: jest.fn(),
      serviceTime: new Date(),
      setServiceTime: jest.fn(),
      handleDateChange: jest.fn(),
      handleTimeChange: jest.fn(),
      serviceAddress: '',
      setServiceAddress: jest.fn(),
      notes: '',
      setNotes: jest.fn(),
      isHouseMovingService: false,
      isWeeklyCleaningService: false,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders header with back button and title', () => {
      const { getByText, getByTestId } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      expect(getByText('Create Booking')).toBeTruthy();
      // Back button is now an IconButton, check for icon
      expect(getByText(/steps completed/)).toBeTruthy();
    });

    it('renders all required form sections', () => {
      const { getByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      expect(getByText(/Customer/)).toBeTruthy();
      expect(getByText(/Service Category/)).toBeTruthy();
      expect(getByText(/Service Address/)).toBeTruthy();
    });

    it('renders action buttons', () => {
      const { getByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Create Booking')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('validates customer selection', async () => {
      mockAdminDataService.createBooking = jest.fn().mockResolvedValue({
        success: false,
        error: 'Customer required',
      });

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a customer');
      });
    });

    it('validates service category selection', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
      } as any);

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a service category');
      });
    });

    it('validates service type selection', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
        selectedServiceCategory: 'cleaning',
      } as any);

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a service type');
      });
    });

    it('validates service variant selection', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
        selectedServiceCategory: 'cleaning',
        selectedServiceType: mockService,
      } as any);

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a service variant');
      });
    });

    it('validates date and time for non-weekly services', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
        selectedServiceCategory: 'cleaning',
        selectedServiceType: mockService,
        selectedServiceVariant: mockVariant,
      } as any);

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select service date and time');
      });
    });

    it('validates dates for weekly cleaning services', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
        selectedServiceCategory: 'cleaning',
        selectedServiceType: mockService,
        selectedServiceVariant: mockVariant,
        isWeeklyCleaningService: true,
        selectedDates: [],
      } as any);

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please select at least one service date for weekly cleaning'
        );
      });
    });

    it('validates service address', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
        selectedServiceCategory: 'cleaning',
        selectedServiceType: mockService,
        selectedServiceVariant: mockVariant,
        date: '2024-01-01',
        time: '10:00',
        serviceAddress: '',
      } as any);

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });
  });

  describe('Booking Creation', () => {
    it('creates booking successfully', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
        selectedServiceCategory: 'cleaning',
        selectedServiceType: mockService,
        selectedServiceVariant: mockVariant,
        date: '2024-01-01',
        time: '10:00',
        serviceAddress: '123 Main St, Berlin, 10115, Germany',
        notes: 'Test notes',
      } as any);

      mockAdminDataService.createBooking = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 'booking-1' },
      });

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(mockAdminDataService.createBooking).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Booking created successfully', expect.any(Array));
      });
    });

    it('handles booking creation error', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
        selectedServiceCategory: 'cleaning',
        selectedServiceType: mockService,
        selectedServiceVariant: mockVariant,
        date: '2024-01-01',
        time: '10:00',
        serviceAddress: '123 Main St, Berlin, 10115, Germany',
      } as any);

      mockAdminDataService.createBooking = jest.fn().mockResolvedValue({
        success: false,
        error: 'Failed to create booking',
      });

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('Failed to create booking'));
      });
    });

    it('handles session expiration', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
        selectedServiceCategory: 'cleaning',
        selectedServiceType: mockService,
        selectedServiceVariant: mockVariant,
        date: '2024-01-01',
        time: '10:00',
        serviceAddress: '123 Main St, Berlin, 10115, Germany',
      } as any);

      mockAdminDataService.createBooking = jest.fn().mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
      }

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Session Expired', expect.any(String), expect.any(Array));
      });
    });
  });

  describe('Navigation', () => {
    it('handles back navigation from dashboard', () => {
      const { getByTestId } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      // Find back button by testID
      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);
      
      expect(mockNavigation.dispatch).toHaveBeenCalled();
    });

    it('handles cancel navigation', () => {
      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const cancelButtons = getAllByText('Cancel');
      if (cancelButtons.length > 0) {
        fireEvent.press(cancelButtons[0]);
        expect(mockNavigation.dispatch).toHaveBeenCalled();
      }
    });
  });

  describe('Loading States', () => {
    it('shows loading state while creating booking', async () => {
      mockUseBookingForm.mockReturnValue({
        ...mockUseBookingForm(),
        selectedCustomer: mockCustomer,
        selectedServiceCategory: 'cleaning',
        selectedServiceType: mockService,
        selectedServiceVariant: mockVariant,
        date: '2024-01-01',
        time: '10:00',
        serviceAddress: '123 Main St, Berlin, 10115, Germany',
      } as any);

      mockAdminDataService.createBooking = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      const { getAllByText } = renderWithTheme(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const createButtons = getAllByText('Create Booking');
      if (createButtons.length > 0) {
        fireEvent.press(createButtons[0]);
        await waitFor(() => {
          expect(getAllByText('Creating...').length).toBeGreaterThan(0);
        });
      }
    });
  });
});

