/**
 * Comprehensive tests for ServiceListScreen
 * Tests component rendering, navigation, and service display
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ServiceListScreen } from '../ServiceListScreen';
import { useAdminData } from '@/contexts/AdminDataContext';
import { useServiceCategories } from '../hooks/useServiceCategories';
import { AdminService } from '@/types';

// Mock dependencies
jest.mock('@/contexts/AdminDataContext');
jest.mock('@/services/httpClient');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// Mock hooks
jest.mock('../hooks/useServiceCategories', () => ({
  useServiceCategories: jest.fn(),
}));

const mockUseAdminData = useAdminData as jest.MockedFunction<typeof useAdminData>;
const mockUseServiceCategories = useServiceCategories as jest.MockedFunction<typeof useServiceCategories>;

const mockServices: AdminService[] = [
  {
    id: 'service-1',
    title: 'Normal Cleaning',
    category: 'Cleaning',
    description: 'Standard cleaning service',
    price: 50,
    pricingType: 'fixed' as const,
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
  },
  {
    id: 'service-2',
    title: 'Deep Cleaning',
    category: 'Cleaning',
    description: 'Deep cleaning service',
    price: 100,
    pricingType: 'fixed' as const,
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
  },
  {
    id: 'service-3',
    title: 'Bed Assembly',
    category: 'Furniture Assembly',
    description: 'Bed assembly service',
    price: 60,
    pricingType: 'fixed' as const,
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
  },
];

const mockNavigation = {
    navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('ServiceListScreen', () => {
  const mockCategories = [
    { id: 'cleaning', title: 'Cleaning', category: 'Cleaning' },
    { id: 'furniture-assembly', title: 'Furniture Assembly', category: 'Furniture Assembly' },
    { id: 'furniture-disassembly', title: 'Furniture Disassembly', category: 'Furniture Disassembly' },
    { id: 'moving', title: 'Moving', category: 'Moving' },
    { id: 'office-setup', title: 'Office Setup', category: 'Office Setup' },
    { id: 'house-painting', title: 'House Painting', category: 'House Painting' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminData.mockReturnValue({
      services: mockServices,
      refreshServices: jest.fn(),
      loading: false,
      bookings: [],
      refreshBookings: jest.fn(),
      refreshData: jest.fn(),
    });
    mockUseServiceCategories.mockReturnValue({
      categories: mockCategories,
      loading: false,
      error: null,
    });
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { UNSAFE_root } = render(<ServiceListScreen navigation={mockNavigation} />);
    expect(UNSAFE_root).toBeTruthy();
    });

    it('should render service categories section', () => {
      const { getByText } = render(<ServiceListScreen navigation={mockNavigation} />);
      expect(getByText('Our Services')).toBeTruthy();
    });

    it('should render all main service categories', () => {
      const { getByText } = render(<ServiceListScreen navigation={mockNavigation} />);
      
      expect(getByText('Cleaning')).toBeTruthy();
      expect(getByText('Furniture Assembly')).toBeTruthy();
      expect(getByText('Furniture Disassembly')).toBeTruthy();
      expect(getByText('Moving')).toBeTruthy();
      expect(getByText('Office Setup')).toBeTruthy();
      expect(getByText('House Painting')).toBeTruthy();
    });

    it('should render FAB button for adding service', () => {
      const { getByLabelText } = render(<ServiceListScreen navigation={mockNavigation} />);
      // FAB might not have accessible label, check for icon or text
      expect(getByLabelText('Add Service')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to ServiceCategory when category card is pressed', () => {
      const { getByText } = render(<ServiceListScreen navigation={mockNavigation} />);
      
      const cleaningCard = getByText('Cleaning').parent?.parent;
      fireEvent.press(cleaningCard!);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ServiceCategory', {
        categoryId: 'cleaning',
        categoryTitle: 'Cleaning',
      });
    });

    it('should navigate to ServiceCreate when FAB is pressed', () => {
      const { getByLabelText } = render(<ServiceListScreen navigation={mockNavigation} />);
      
      const fab = getByLabelText('Add Service');
      fireEvent.press(fab);
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ServiceCreate');
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when loading', () => {
      mockUseServiceCategories.mockReturnValue({
        categories: [],
        loading: true,
        error: null,
      });

      const { getByText } = render(<ServiceListScreen navigation={mockNavigation} />);
      expect(getByText('Loading services...')).toBeTruthy();
    });

    it('should not show loading when not loading', () => {
      const { queryByText } = render(<ServiceListScreen navigation={mockNavigation} />);
      expect(queryByText('Loading services...')).toBeNull();
    });
  });

  describe('Service Categories Display', () => {
    it('should display all 6 main service categories', () => {
      const { getByText } = render(<ServiceListScreen navigation={mockNavigation} />);
      
      const categories = [
        'Cleaning',
        'Furniture Assembly',
        'Furniture Disassembly',
        'Moving',
        'Office Setup',
        'House Painting',
      ];
      
      categories.forEach(category => {
        expect(getByText(category)).toBeTruthy();
      });
    });

    it('should have View button on each category card', () => {
      const { getAllByText } = render(<ServiceListScreen navigation={mockNavigation} />);
      const viewButtons = getAllByText('View');
      expect(viewButtons.length).toBeGreaterThan(0);
    });
  });
});
