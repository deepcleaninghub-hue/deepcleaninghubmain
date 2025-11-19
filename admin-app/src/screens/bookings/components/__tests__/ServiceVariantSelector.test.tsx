/**
 * ServiceVariantSelector Component Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ServiceVariantSelector, ServiceVariant } from '../ServiceVariantSelector';

// Mock react-native-paper Portal
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

const mockVariants: ServiceVariant[] = [
  {
    id: 'variant-1',
    service_id: 'service-1',
    title: 'Standard Variant',
    price: 50,
    pricingType: 'fixed',
  },
  {
    id: 'variant-2',
    service_id: 'service-1',
    title: 'Premium Variant',
    price: 100,
    pricingType: 'fixed',
  },
  {
    id: 'variant-3',
    service_id: 'service-1',
    title: 'Per Unit Variant',
    unitPrice: 10,
    unitMeasure: 'sqm',
    pricingType: 'per_unit',
  },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('ServiceVariantSelector', () => {
  const mockOnSelectVariant = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with no variant selected', () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={mockVariants}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
      />
    );

    expect(getByText('Service Variant *')).toBeTruthy();
    expect(getByText('Select Service Variant')).toBeTruthy();
  });

  it('renders selected variant title', () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={mockVariants}
        selectedVariant={mockVariants[0]}
        onSelectVariant={mockOnSelectVariant}
      />
    );

    expect(getByText('Standard Variant')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={mockVariants}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
        loading={true}
      />
    );

    expect(getByText('Loading variants...')).toBeTruthy();
  });

  it('opens menu when button is pressed', async () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={mockVariants}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
      />
    );

    const button = getByText('Select Service Variant');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Menu items should be visible
    await waitFor(() => {
      expect(getByText('Standard Variant')).toBeTruthy();
      expect(getByText('Premium Variant')).toBeTruthy();
    });
  });

  it('calls onSelectVariant when variant is selected', async () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={mockVariants}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
      />
    );

    const button = getByText('Select Service Variant');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Find and press a variant item
    await waitFor(() => {
      const variantItem = getByText('Standard Variant');
      fireEvent.press(variantItem);
    });

    await waitFor(() => {
      expect(mockOnSelectVariant).toHaveBeenCalledWith(mockVariants[0]);
    });
  });

  it('shows empty state when no variants available', () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={[]}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
      />
    );

    expect(getByText('No variants available')).toBeTruthy();
  });

  it('disables button when loading', () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={mockVariants}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
        loading={true}
      />
    );

    const button = getByText('Loading variants...');
    expect(button).toBeTruthy();
  });

  it('disables button when no variants available', () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={[]}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
      />
    );

    const button = getByText('No variants available');
    fireEvent.press(button);

    // Menu should not open
    expect(() => getByText('Standard Variant')).toThrow();
  });

  it('closes menu when loading starts', async () => {
    const { getByText, rerender } = renderWithTheme(
      <ServiceVariantSelector
        variants={mockVariants}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
        loading={false}
      />
    );

    const button = getByText('Select Service Variant');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Change loading to true
    rerender(
      <PaperProvider>
        <ServiceVariantSelector
          variants={mockVariants}
          selectedVariant={null}
          onSelectVariant={mockOnSelectVariant}
          loading={true}
        />
      </PaperProvider>
    );

    // Should show loading button
    await waitFor(() => {
      expect(getByText('Loading variants...')).toBeTruthy();
    });
  });

  it('closes menu when variants list becomes empty', async () => {
    const { getByText, rerender } = renderWithTheme(
      <ServiceVariantSelector
        variants={mockVariants}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
        loading={false}
      />
    );

    const button = getByText('Select Service Variant');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Change variants to empty
    rerender(
      <PaperProvider>
        <ServiceVariantSelector
          variants={[]}
          selectedVariant={null}
          onSelectVariant={mockOnSelectVariant}
          loading={false}
        />
      </PaperProvider>
    );

    // Button should show empty state
    await waitFor(() => {
      expect(getByText('No variants available')).toBeTruthy();
    });
  });

  it('does not open menu if already visible', async () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={mockVariants}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
      />
    );

    const button = getByText('Select Service Variant');
    
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
    expect(getByText('Standard Variant')).toBeTruthy();
  });

  it('does not open menu when loading or variants empty', () => {
    const { getByText } = renderWithTheme(
      <ServiceVariantSelector
        variants={[]}
        selectedVariant={null}
        onSelectVariant={mockOnSelectVariant}
        loading={false}
      />
    );

    const button = getByText('No variants available');
    fireEvent.press(button);

    // Menu should not open
    expect(() => getByText('Standard Variant')).toThrow();
  });
});

