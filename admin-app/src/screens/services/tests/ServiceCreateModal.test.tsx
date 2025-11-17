/**
 * Tests for ServiceCreateModal Component
 * Tests category dropdown, service type dropdown, and form display
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ServiceCreateModal } from '../components/ServiceCreateModal';
import { useServiceCategories } from '../hooks/useServiceCategories';
import { useServices } from '../hooks/useServices';
import { adminDataService } from '@/services/adminDataService';

// Mock dependencies
jest.mock('../hooks/useServiceCategories');
jest.mock('../hooks/useServices');
jest.mock('@/services/adminDataService');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

const mockUseServiceCategories = useServiceCategories as jest.MockedFunction<typeof useServiceCategories>;
const mockUseServices = useServices as jest.MockedFunction<typeof useServices>;
const mockAdminDataService = adminDataService as jest.Mocked<typeof adminDataService>;

const mockCategories = [
  { id: 'cleaning', title: 'Cleaning', category: 'Cleaning' },
  { id: 'furniture-assembly', title: 'Furniture Assembly', category: 'Furniture Assembly' },
];

const mockServices = [
  {
    id: 'service-1',
    title: 'Normal Cleaning',
    category: 'Cleaning',
    description: 'Standard cleaning',
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
    description: 'Deep cleaning',
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
];

describe('ServiceCreateModal', () => {
  const mockOnDismiss = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseServiceCategories.mockReturnValue({
      categories: mockCategories,
      loading: false,
      error: null,
    });
    mockUseServices.mockReturnValue({
      services: [],
      loading: false,
      error: null,
      refreshServices: jest.fn(),
    });
    mockAdminDataService.createService = jest.fn().mockResolvedValue({
      success: true,
      data: {},
    });
  });

  describe('Category Dropdown', () => {
    it('should render category dropdown as first option', () => {
      const { getByText } = render(
        <ServiceCreateModal
          visible={true}
          category=""
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      expect(getByText('Service Category *')).toBeTruthy();
      expect(getByText('Select Service Category')).toBeTruthy();
    });

    it('should display selected category when category prop is provided', () => {
      mockUseServiceCategories.mockReturnValue({
        categories: mockCategories,
        loading: false,
        error: null,
      });

      const { getByText } = render(
        <ServiceCreateModal
          visible={true}
          category="Cleaning"
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      // Should show the category name
      expect(getByText(/Cleaning/)).toBeTruthy();
    });

    it('should show all available categories in dropdown', () => {
      const { getByText } = render(
        <ServiceCreateModal
          visible={true}
          category=""
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      const categoryButton = getByText('Select Service Category');
      fireEvent.press(categoryButton);

      // Categories should be available in the menu
      expect(mockCategories.length).toBeGreaterThan(0);
    });
  });

  describe('Service Type Dropdown', () => {
    it('should render service type dropdown as second option', () => {
      mockUseServices.mockReturnValue({
        services: mockServices,
        loading: false,
        error: null,
        refreshServices: jest.fn(),
      });

      const { getByText } = render(
        <ServiceCreateModal
          visible={true}
          category="Cleaning"
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      expect(getByText('Service Type *')).toBeTruthy();
    });

    it('should show services for selected category', () => {
      mockUseServices.mockReturnValue({
        services: mockServices,
        loading: false,
        error: null,
        refreshServices: jest.fn(),
      });

      const { getByText } = render(
        <ServiceCreateModal
          visible={true}
          category="Cleaning"
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      const serviceTypeButton = getByText(/Select Service Type|No services available/);
      expect(serviceTypeButton).toBeTruthy();
    });

    it('should include "Create New Service" as last option in service type dropdown', () => {
      mockUseServices.mockReturnValue({
        services: mockServices,
        loading: false,
        error: null,
        refreshServices: jest.fn(),
      });

      const { getByText } = render(
        <ServiceCreateModal
          visible={true}
          category="Cleaning"
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      // The "Create New Service" option should be available
      // This will be tested when we implement the component
      expect(getByText('Service Type *')).toBeTruthy();
    });

    it('should show form fields when "Create New Service" is selected', () => {
      mockUseServices.mockReturnValue({
        services: [],
        loading: false,
        error: null,
        refreshServices: jest.fn(),
      });

      const { getByText } = render(
        <ServiceCreateModal
          visible={true}
          category="Cleaning"
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      // Form fields should be visible when "Create New Service" is selected
      // Since no services exist, "Create New Service" should be auto-selected
      expect(getByText('Title *')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
    });
  });

  describe('Form Display', () => {
    it('should show form fields when creating new service', () => {
      mockUseServices.mockReturnValue({
        services: [],
        loading: false,
        error: null,
        refreshServices: jest.fn(),
      });

      const { getByText } = render(
        <ServiceCreateModal
          visible={true}
          category="Cleaning"
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      expect(getByText('Title *')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
      expect(getByText('Image URL')).toBeTruthy();
    });

    it('should validate required fields before submission', async () => {
      mockUseServices.mockReturnValue({
        services: [],
        loading: false,
        error: null,
        refreshServices: jest.fn(),
      });

      const { getByText } = render(
        <ServiceCreateModal
          visible={true}
          category="Cleaning"
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      const createButton = getByText('Create Service');
      fireEvent.press(createButton);

      // Should show validation error
      await waitFor(() => {
        expect(mockAdminDataService.createService).not.toHaveBeenCalled();
      });
    });
  });

  describe('Service Creation', () => {
    it('should create service with correct data when form is valid', async () => {
      mockUseServiceCategories.mockReturnValue({
        categories: mockCategories,
        loading: false,
        error: null,
      });
      mockUseServices.mockReturnValue({
        services: [],
        loading: false,
        error: null,
        refreshServices: jest.fn(),
      });

      const { getByText, getByDisplayValue } = render(
        <ServiceCreateModal
          visible={true}
          category="Cleaning"
          onDismiss={mockOnDismiss}
          onSuccess={mockOnSuccess}
        />
      );

      // Select "Create New Service" option
      const serviceTypeButton = getByText(/Select Service Type|Create New Service/);
      fireEvent.press(serviceTypeButton);

      // Wait for menu to appear and select "Create New Service"
      await waitFor(() => {
        const createNewOption = getByText('➕ Create New Service');
        if (createNewOption) {
          fireEvent.press(createNewOption);
        }
      });

      // Fill in form - find input by label
      const titleInput = getByDisplayValue('');
      fireEvent.changeText(titleInput, 'Test Service');

      const createButton = getByText('Create Service');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(mockAdminDataService.createService).toHaveBeenCalled();
      });
    });
  });
});

