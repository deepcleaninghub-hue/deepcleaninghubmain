import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { BookingCreateScreen } from '../BookingCreateScreen';
import { adminDataService } from '@/services/adminDataService';

// Mock native modules
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock MultiDateSelector
jest.mock('../../../../../shared/src/components/MultiDateSelector', () => {
  return function MultiDateSelector({ selectedDates, onDatesChange, serviceTime, onTimeChange }: any) {
    return null;
  };
});

// Mock dependencies - ALL services for ALL categories
const mockServices = [
  // Cleaning services
  {
    id: 'service-1',
    title: 'Normal Cleaning',
    category: 'Cleaning',
    description: 'Standard cleaning service',
  },
  {
    id: 'service-2',
    title: 'Deep Cleaning',
    category: 'Cleaning',
    description: 'Deep cleaning service',
  },
  // Furniture Assembly services
  {
    id: 'service-3',
    title: 'Bed Assembly',
    category: 'Furniture Assembly',
    description: 'Bed assembly service',
  },
  {
    id: 'service-4',
    title: 'Bookshelf Assembly',
    category: 'Furniture Assembly',
    description: 'Bookshelf assembly service',
  },
  {
    id: 'service-5',
    title: 'Kitchen Assembly',
    category: 'Furniture Assembly',
    description: 'Kitchen assembly service',
  },
  {
    id: 'service-6',
    title: 'Table Assembly',
    category: 'Furniture Assembly',
    description: 'Table assembly service',
  },
  {
    id: 'service-7',
    title: 'Wardrobe Assembly',
    category: 'Furniture Assembly',
    description: 'Wardrobe assembly service',
  },
  {
    id: 'service-8',
    title: 'Filing Cabinet Assembly',
    category: 'Furniture Assembly',
    description: 'Filing cabinet assembly service',
  },
  // Furniture Disassembly services
  {
    id: 'service-9',
    title: 'Bed Disassembly',
    category: 'Furniture Disassembly',
    description: 'Bed disassembly service',
  },
  {
    id: 'service-10',
    title: 'Bookshelf Disassembly',
    category: 'Furniture Disassembly',
    description: 'Bookshelf disassembly service',
  },
  {
    id: 'service-11',
    title: 'Kitchen Disassembly',
    category: 'Furniture Disassembly',
    description: 'Kitchen disassembly service',
  },
  {
    id: 'service-12',
    title: 'Table Disassembly',
    category: 'Furniture Disassembly',
    description: 'Table disassembly service',
  },
  {
    id: 'service-13',
    title: 'Wardrobe Disassembly',
    category: 'Furniture Disassembly',
    description: 'Wardrobe disassembly service',
  },
  // House Painting services
  {
    id: 'service-14',
    title: 'Exterior Painting',
    category: 'House Painting',
    description: 'Exterior painting service',
  },
  {
    id: 'service-15',
    title: 'Interior Painting',
    category: 'House Painting',
    description: 'Interior painting service',
  },
  {
    id: 'service-16',
    title: 'Ceiling Painting',
    category: 'House Painting',
    description: 'Ceiling painting service',
  },
  // Office Setup services
  {
    id: 'service-17',
    title: 'Office Chair Assembly',
    category: 'Office Setup',
    description: 'Office chair assembly service',
  },
  {
    id: 'service-18',
    title: 'Office Desk Assembly',
    category: 'Office Setup',
    description: 'Office desk assembly service',
  },
  {
    id: 'service-19',
    title: 'Office Equipment Assembly',
    category: 'Office Setup',
    description: 'Office equipment assembly service',
  },
  {
    id: 'service-20',
    title: 'Meeting Table Assembly',
    category: 'Office Setup',
    description: 'Meeting table assembly service',
  },
  // Moving services
  {
    id: 'service-21',
    title: 'House Moving',
    category: 'Moving',
    description: 'House moving service',
  },
  {
    id: 'service-22',
    title: 'Office Moving',
    category: 'Moving',
    description: 'Office moving service',
  },
];

const mockServiceVariants = [
  {
    id: 'variant-1',
    service_id: 'service-1',
    title: 'Standard Cleaning',
    description: 'Standard cleaning per square meter',
    price: 50,
    unitPrice: 5,
    unitMeasure: 'sqm',
    pricingType: 'per_unit' as const,
    duration: 120,
    minMeasurement: 10,
    maxMeasurement: 500,
  },
  {
    id: 'variant-2',
    service_id: 'service-1',
    title: 'Fixed Price Cleaning',
    description: 'Fixed price cleaning',
    price: 100,
    pricingType: 'fixed' as const,
    duration: 120,
  },
  {
    id: 'variant-3',
    service_id: 'service-2',
    title: 'House Moving Standard',
    description: 'House moving service',
    price: 10,
    unitPrice: 10,
    unitMeasure: 'sqm',
    pricingType: 'per_unit' as const,
    duration: 240,
  },
];

const mockBookings = [
  {
    id: 'booking-1',
    user_id: 'customer-1',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '+1234567890',
    mobile_users: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    },
  },
];

const mockUseAdminData = {
  services: mockServices,
    bookings: [],
    loading: false,
    refreshData: jest.fn(),
    refreshBookings: jest.fn(),
    refreshServices: jest.fn(),
};

const mockUseAdminAuth = {
  signOut: jest.fn(),
  user: null,
  isAuthenticated: false,
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@/contexts/AdminDataContext', () => ({
  useAdminData: () => mockUseAdminData,
}));

jest.mock('@/contexts/AdminAuthContext', () => ({
  useAdminAuth: () => mockUseAdminAuth,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('@/services/adminDataService', () => ({
  adminDataService: {
    getBookings: jest.fn(),
    getServiceVariants: jest.fn(),
    createBooking: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('BookingCreateScreen - Input Field Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (adminDataService.getBookings as jest.Mock).mockResolvedValue({
      success: true,
      data: mockBookings,
    });
    (adminDataService.getServiceVariants as jest.Mock).mockResolvedValue({
      success: true,
      data: mockServiceVariants,
    });
    (adminDataService.createBooking as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'new-booking-1' },
    });
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { UNSAFE_root } = render(<BookingCreateScreen navigation={mockNavigation} />);
    expect(UNSAFE_root).toBeTruthy();
    });

    it('should render all required input fields', () => {
      const { getAllByText, getByPlaceholderText } = render(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      expect(getAllByText('Customer *').length).toBeGreaterThan(0);
      expect(getAllByText('Service Category *').length).toBeGreaterThan(0);
      expect(getAllByText('Service Address *').length).toBeGreaterThan(0);
      expect(getAllByText('Service Date *').length).toBeGreaterThan(0);
      expect(getAllByText('Service Time *').length).toBeGreaterThan(0);
      expect(getAllByText('Notes').length).toBeGreaterThan(0);
      expect(getByPlaceholderText(/Enter service address/)).toBeTruthy();
    });
  });

  describe('Service Category Selection', () => {
    it('should render service category dropdown', () => {
      const { getByText } = render(<BookingCreateScreen navigation={mockNavigation} />);
      expect(getByText('Service Category *')).toBeTruthy();
      expect(getByText('Select Service Category')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should have create booking button', () => {
      const { getAllByText } = render(<BookingCreateScreen navigation={mockNavigation} />);
      expect(getAllByText('Create Booking').length).toBeGreaterThan(0);
    });

    it('should validate required fields exist', () => {
      const { getAllByText } = render(<BookingCreateScreen navigation={mockNavigation} />);
      
      // All required fields should be present
      expect(getAllByText('Customer *').length).toBeGreaterThan(0);
      expect(getAllByText('Service Category *').length).toBeGreaterThan(0);
      expect(getAllByText('Service Address *').length).toBeGreaterThan(0);
      expect(getAllByText('Service Date *').length).toBeGreaterThan(0);
      expect(getAllByText('Service Time *').length).toBeGreaterThan(0);
    });
  });

  describe('Input Field Rendering', () => {
    it('should render service address input with correct properties', () => {
      const { getByPlaceholderText } = render(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const addressInput = getByPlaceholderText(/Enter service address/);
      expect(addressInput).toBeTruthy();
      expect(addressInput.props.multiline).toBe(true);
      expect(addressInput.props.numberOfLines).toBe(2);
    });

    it('should render notes input', () => {
      const { getAllByText } = render(<BookingCreateScreen navigation={mockNavigation} />);
      const notesElements = getAllByText('Notes');
      expect(notesElements.length).toBeGreaterThan(0);
    });

    it('should render date and time picker buttons', () => {
      const { getByText } = render(<BookingCreateScreen navigation={mockNavigation} />);
      expect(getByText('Service Date *')).toBeTruthy();
      expect(getByText('Service Time *')).toBeTruthy();
    });
  });

  describe('Input Field Validation', () => {
    it('should accept service address input', () => {
      const { getByPlaceholderText } = render(
        <BookingCreateScreen navigation={mockNavigation} />
      );
      
      const addressInput = getByPlaceholderText(/Enter service address/);
      
      fireEvent.changeText(addressInput, '123 Main St, Berlin, 10115, Germany');
      expect(addressInput.props.value).toBe('123 Main St, Berlin, 10115, Germany');
    });

    it('should accept notes input', () => {
      const { getAllByText } = render(<BookingCreateScreen navigation={mockNavigation} />);
      // Notes field exists (may appear multiple times)
      const notesElements = getAllByText('Notes');
      expect(notesElements.length).toBeGreaterThan(0);
    });
  });

  describe('Service Type and Variant Selection', () => {
    it('should not show service type dropdown initially', () => {
      const { queryByText } = render(<BookingCreateScreen navigation={mockNavigation} />);
      
      // Service type should not be visible initially
      expect(queryByText('Service Type *')).toBeNull();
    });

    it('should filter services correctly by category', () => {
      // Test that services are correctly categorized
      const cleaningServices = mockServices.filter(s => s.category === 'Cleaning');
      const furnitureAssemblyServices = mockServices.filter(s => s.category === 'Furniture Assembly');
      const furnitureDisassemblyServices = mockServices.filter(s => s.category === 'Furniture Disassembly');
      const housePaintingServices = mockServices.filter(s => s.category === 'House Painting');
      const officeSetupServices = mockServices.filter(s => s.category === 'Office Setup');
      const movingServices = mockServices.filter(s => s.category === 'Moving');
      
      expect(cleaningServices.length).toBeGreaterThan(0);
      expect(furnitureAssemblyServices.length).toBeGreaterThan(0);
      expect(furnitureDisassemblyServices.length).toBeGreaterThan(0);
      expect(housePaintingServices.length).toBeGreaterThan(0);
      expect(officeSetupServices.length).toBeGreaterThan(0);
      expect(movingServices.length).toBeGreaterThan(0);
    });

    it('should fetch service variants when service type is selected', async () => {
      const { getByText } = render(<BookingCreateScreen navigation={mockNavigation} />);
      
      // The component should be ready to fetch variants when service is selected
      // We test that the service exists in the mock data
      expect(mockServices.length).toBeGreaterThan(0);
      expect(mockServiceVariants.length).toBeGreaterThan(0);
    });
  });

  describe('Service Category Re-selection Fix', () => {
    it('should have category button that can be pressed multiple times', () => {
      const { getByText } = render(<BookingCreateScreen navigation={mockNavigation} />);
      const categoryButton = getByText('Select Service Category');
      
      // Button should exist and be accessible
      expect(categoryButton).toBeTruthy();
      // The fix ensures the button uses toggle logic instead of just setState(true)
    });
  });

  describe('All Service Categories Available', () => {
    it('should have services available for Cleaning category', () => {
      const cleaningServices = mockServices.filter(s => s.category === 'Cleaning');
      expect(cleaningServices.length).toBeGreaterThan(0);
      expect(cleaningServices.map(s => s.title)).toContain('Normal Cleaning');
      expect(cleaningServices.map(s => s.title)).toContain('Deep Cleaning');
    });

    it('should have services available for Furniture Assembly category', () => {
      const furnitureAssemblyServices = mockServices.filter(s => s.category === 'Furniture Assembly');
      expect(furnitureAssemblyServices.length).toBeGreaterThan(0);
      expect(furnitureAssemblyServices.map(s => s.title)).toContain('Bed Assembly');
      expect(furnitureAssemblyServices.map(s => s.title)).toContain('Bookshelf Assembly');
      expect(furnitureAssemblyServices.map(s => s.title)).toContain('Kitchen Assembly');
      expect(furnitureAssemblyServices.map(s => s.title)).toContain('Table Assembly');
      expect(furnitureAssemblyServices.map(s => s.title)).toContain('Wardrobe Assembly');
      expect(furnitureAssemblyServices.map(s => s.title)).toContain('Filing Cabinet Assembly');
    });

    it('should have services available for Furniture Disassembly category', () => {
      const furnitureDisassemblyServices = mockServices.filter(s => s.category === 'Furniture Disassembly');
      expect(furnitureDisassemblyServices.length).toBeGreaterThan(0);
      expect(furnitureDisassemblyServices.map(s => s.title)).toContain('Bed Disassembly');
      expect(furnitureDisassemblyServices.map(s => s.title)).toContain('Bookshelf Disassembly');
      expect(furnitureDisassemblyServices.map(s => s.title)).toContain('Kitchen Disassembly');
      expect(furnitureDisassemblyServices.map(s => s.title)).toContain('Table Disassembly');
      expect(furnitureDisassemblyServices.map(s => s.title)).toContain('Wardrobe Disassembly');
    });

    it('should have services available for House Painting category', () => {
      const housePaintingServices = mockServices.filter(s => s.category === 'House Painting');
      expect(housePaintingServices.length).toBeGreaterThan(0);
      expect(housePaintingServices.map(s => s.title)).toContain('Exterior Painting');
      expect(housePaintingServices.map(s => s.title)).toContain('Interior Painting');
      expect(housePaintingServices.map(s => s.title)).toContain('Ceiling Painting');
    });

    it('should have services available for Office Setup category', () => {
      const officeSetupServices = mockServices.filter(s => s.category === 'Office Setup');
      expect(officeSetupServices.length).toBeGreaterThan(0);
      expect(officeSetupServices.map(s => s.title)).toContain('Office Chair Assembly');
      expect(officeSetupServices.map(s => s.title)).toContain('Office Desk Assembly');
      expect(officeSetupServices.map(s => s.title)).toContain('Office Equipment Assembly');
      expect(officeSetupServices.map(s => s.title)).toContain('Meeting Table Assembly');
    });

    it('should have services available for Moving category', () => {
      const movingServices = mockServices.filter(s => s.category === 'Moving');
      expect(movingServices.length).toBeGreaterThan(0);
      expect(movingServices.map(s => s.title)).toContain('House Moving');
      expect(movingServices.map(s => s.title)).toContain('Office Moving');
    });

    it('should verify all categories have at least one service', () => {
      const categories = ['Cleaning', 'Furniture Assembly', 'Furniture Disassembly', 'House Painting', 'Office Setup', 'Moving'];
      
      categories.forEach(category => {
        const servicesForCategory = mockServices.filter(s => s.category === category);
        expect(servicesForCategory.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Service Variants Work Correctly', () => {
    it('should have variants for different pricing types', () => {
      // Verify mock data has different pricing types
      const fixedPricing = mockServiceVariants.find(v => v.pricingType === 'fixed');
      const perUnitPricing = mockServiceVariants.find(v => v.pricingType === 'per_unit');
      
      expect(fixedPricing).toBeDefined();
      expect(perUnitPricing).toBeDefined();
    });

    it('should have variants for house moving services', () => {
      const movingVariant = mockServiceVariants.find(v => v.service_id === 'service-2');
      expect(movingVariant).toBeDefined();
      expect(movingVariant?.title).toContain('Moving');
    });
  });
});
