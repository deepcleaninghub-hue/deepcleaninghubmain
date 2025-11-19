/**
 * ServiceTypeSelector Component Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ServiceTypeSelector } from '../ServiceTypeSelector';
import { AdminService } from '@/types';

// Mock react-native-paper Portal
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

const mockServices: AdminService[] = [
  {
    id: 'service-1',
    title: 'Normal Cleaning',
    category: 'Cleaning',
    description: 'Standard cleaning',
    price: 50,
    pricingType: 'fixed',
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
    difficultyLevel: 'medium',
  },
  {
    id: 'service-2',
    title: 'Deep Cleaning',
    category: 'Cleaning',
    description: 'Deep cleaning',
    price: 100,
    pricingType: 'fixed',
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
    difficultyLevel: 'medium',
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('ServiceTypeSelector', () => {
  const mockOnSelectService = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with no service selected', () => {
    const { getByText } = renderWithTheme(
      <ServiceTypeSelector
        services={mockServices}
        selectedService={null}
        onSelectService={mockOnSelectService}
      />
    );

    expect(getByText('Service Type *')).toBeTruthy();
    expect(getByText('Select Service Type')).toBeTruthy();
  });

  it('renders selected service title', () => {
    const { getByText } = renderWithTheme(
      <ServiceTypeSelector
        services={mockServices}
        selectedService={mockServices[0]}
        onSelectService={mockOnSelectService}
      />
    );

    expect(getByText('Normal Cleaning')).toBeTruthy();
  });

  it('shows warning when no services available for category', () => {
    const { getByText } = renderWithTheme(
      <ServiceTypeSelector
        services={[]}
        selectedService={null}
        onSelectService={mockOnSelectService}
        categoryName="Cleaning"
      />
    );

    expect(getByText(/No services found for this category/)).toBeTruthy();
  });

  it('opens menu when button is pressed', async () => {
    const { getByText } = renderWithTheme(
      <ServiceTypeSelector
        services={mockServices}
        selectedService={null}
        onSelectService={mockOnSelectService}
      />
    );

    const button = getByText('Select Service Type');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Menu items should be visible
    await waitFor(() => {
      expect(getByText('Normal Cleaning')).toBeTruthy();
      expect(getByText('Deep Cleaning')).toBeTruthy();
    });
  });

  it('calls onSelectService when service is selected', async () => {
    const { getByText } = renderWithTheme(
      <ServiceTypeSelector
        services={mockServices}
        selectedService={null}
        onSelectService={mockOnSelectService}
      />
    );

    const button = getByText('Select Service Type');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Find and press a service item
    await waitFor(() => {
      const serviceItem = getByText('Normal Cleaning');
      fireEvent.press(serviceItem);
    });

    await waitFor(() => {
      expect(mockOnSelectService).toHaveBeenCalledWith(mockServices[0]);
    });
  });

  it('disables button when no services available', () => {
    const { getByText } = renderWithTheme(
      <ServiceTypeSelector
        services={[]}
        selectedService={null}
        onSelectService={mockOnSelectService}
      />
    );

    const button = getByText('No services available');
    expect(button).toBeTruthy();
  });

  it('closes menu when services list becomes empty', async () => {
    const { getByText, rerender } = renderWithTheme(
      <ServiceTypeSelector
        services={mockServices}
        selectedService={null}
        onSelectService={mockOnSelectService}
      />
    );

    const button = getByText('Select Service Type');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Change services to empty
    rerender(
      <PaperProvider>
        <ServiceTypeSelector
          services={[]}
          selectedService={null}
          onSelectService={mockOnSelectService}
        />
      </PaperProvider>
    );

    // Button should show empty state
    await waitFor(() => {
      expect(getByText('No services available')).toBeTruthy();
    });
  });

  it('does not open menu if already visible', async () => {
    const { getByText } = renderWithTheme(
      <ServiceTypeSelector
        services={mockServices}
        selectedService={null}
        onSelectService={mockOnSelectService}
      />
    );

    const button = getByText('Select Service Type');
    
    // Press button first time
    fireEvent.press(button);
    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Press button second time - should not cause issues
    fireEvent.press(button);
    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Should still work correctly
    expect(getByText('Normal Cleaning')).toBeTruthy();
  });

  it('does not open menu when services list is empty', () => {
    const { getByText } = renderWithTheme(
      <ServiceTypeSelector
        services={[]}
        selectedService={null}
        onSelectService={mockOnSelectService}
      />
    );

    const button = getByText('No services available');
    fireEvent.press(button);

    // Menu should not open
    expect(() => getByText('Normal Cleaning')).toThrow();
  });
});

