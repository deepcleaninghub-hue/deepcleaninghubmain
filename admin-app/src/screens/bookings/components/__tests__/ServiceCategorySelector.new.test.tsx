/**
 * ServiceCategorySelector New - Comprehensive Tests (TDD)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ServiceCategorySelector } from '../ServiceCategorySelector.new';
import { dataCache } from '@/services/dataCache';

jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

jest.mock('@/services/dataCache');

const mockCategories = [
  { id: 'cleaning', title: 'Cleaning', category: 'Cleaning' },
  { id: 'furniture', title: 'Furniture Assembly', category: 'Furniture Assembly' },
];

const mockDataCache = dataCache as jest.Mocked<typeof dataCache>;

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('ServiceCategorySelector New', () => {
  const mockOnSelectCategory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockDataCache.getServiceCategories = jest.fn().mockResolvedValue(mockCategories);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('loads categories from cache on mount', async () => {
    renderWithTheme(
      <ServiceCategorySelector
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
      />
    );
    
    await waitFor(() => {
      expect(mockDataCache.getServiceCategories).toHaveBeenCalledTimes(1);
    });
  });

  it('opens menu reliably on multiple clicks', async () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
      />
    );
    
    await waitFor(() => {
      expect(getByText('Select Service Category')).toBeTruthy();
    });
    
    const button = getByText('Select Service Category');
    
    // First click
    fireEvent.press(button);
    await waitFor(() => {
      jest.advanceTimersByTime(200);
    });
    await waitFor(() => {
      expect(getByText('Cleaning')).toBeTruthy();
    });
    
    // Close menu
    fireEvent.press(button);
    await waitFor(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Second click - should open again
    fireEvent.press(button);
    await waitFor(() => {
      jest.advanceTimersByTime(200);
    });
    await waitFor(() => {
      expect(getByText('Cleaning')).toBeTruthy();
    });
  });

  it('calls onSelectCategory when category is selected', async () => {
    const { getByText } = renderWithTheme(
      <ServiceCategorySelector
        selectedCategoryId=""
        onSelectCategory={mockOnSelectCategory}
      />
    );
    
    await waitFor(() => {
      expect(getByText('Select Service Category')).toBeTruthy();
    });
    
    const button = getByText('Select Service Category');
    fireEvent.press(button);
    
    await waitFor(() => {
      jest.advanceTimersByTime(200);
    });
    
    const categoryItem = await waitFor(() => getByText('Cleaning'));
    fireEvent.press(categoryItem);
    
    await waitFor(() => {
      expect(mockOnSelectCategory).toHaveBeenCalledWith('cleaning');
    });
  });
});

