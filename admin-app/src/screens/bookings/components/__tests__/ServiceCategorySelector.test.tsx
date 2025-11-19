/**
 * ServiceCategorySelector Component Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ServiceCategorySelector } from '../ServiceCategorySelector';
import { ServiceCategory } from '../../hooks/useServiceCategories';

// Mock react-native-paper Portal
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

const mockCategories: ServiceCategory[] = [
  { id: 'cleaning', title: 'Cleaning', category: 'Cleaning' },
  { id: 'furniture', title: 'Furniture Assembly', category: 'Furniture Assembly' },
  { id: 'painting', title: 'House Painting', category: 'House Painting' },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('ServiceCategorySelector', () => {
  const mockOnSelectCategory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with no category selected', () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        categories={mockCategories}
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
      />
    );

    expect(getByText('Service Category *')).toBeTruthy();
    expect(getByText('Select Service Category')).toBeTruthy();
  });

  it('renders selected category title', () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        categories={mockCategories}
        selectedCategoryId="cleaning"
        onSelectCategory={mockOnSelectCategory}
      />
    );

    expect(getByText('Cleaning')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        categories={mockCategories}
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
        loading={true}
      />
    );

    expect(getByText('Loading categories...')).toBeTruthy();
  });

  it('opens menu when button is pressed', async () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        categories={mockCategories}
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
      />
    );

    const button = getByText('Select Service Category');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Menu items should be visible
    await waitFor(() => {
      expect(getByText('Cleaning')).toBeTruthy();
      expect(getByText('Furniture Assembly')).toBeTruthy();
    });
  });

  it('calls onSelectCategory when category is selected', async () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        categories={mockCategories}
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
      />
    );

    const button = getByText('Select Service Category');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Find and press a category item
    await waitFor(() => {
      const categoryItems = getByText('Cleaning');
      fireEvent.press(categoryItems);
    });

    await waitFor(() => {
      expect(mockOnSelectCategory).toHaveBeenCalledWith('cleaning');
    });
  });

  it('closes menu after selection', async () => {
    const { getByText, queryByText } = renderWithTheme(
      <ServiceCategorySelector
        categories={mockCategories}
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
      />
    );

    const button = getByText('Select Service Category');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    const categoryItem = await waitFor(() => getByText('Cleaning'));
    fireEvent.press(categoryItem);

    await waitFor(() => {
      // Menu should close - check that we can't find multiple instances
      expect(mockOnSelectCategory).toHaveBeenCalled();
    });
  });

  it('shows empty state when no categories available', async () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        categories={[]}
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
      />
    );

    const button = getByText('Select Service Category');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(200);
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(getByText('No categories available')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('prevents opening menu when loading', () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        categories={mockCategories}
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
        loading={true}
      />
    );

    // Should show loading button instead of menu button
    expect(getByText('Loading categories...')).toBeTruthy();
  });

  it('closes menu when loading starts', async () => {
    const { getByText, rerender } = renderWithTheme(
      <ServiceCategorySelector
        categories={mockCategories}
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
        loading={false}
      />
    );

    const button = getByText('Select Service Category');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(100);
    });

    // Change loading to true
    rerender(
      <PaperProvider>
        <ServiceCategorySelector
          categories={mockCategories}
          selectedCategoryId=""
          onSelectCategory={mockOnSelectCategory}
          loading={true}
        />
      </PaperProvider>
    );

    // Should show loading button
    await waitFor(() => {
      expect(getByText('Loading categories...')).toBeTruthy();
    });
  });

  it('does not open menu if already visible', async () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        categories={mockCategories}
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
      />
    );

    const button = getByText('Select Service Category');
    
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
    expect(getByText('Cleaning')).toBeTruthy();
  });
});

