/**
 * CustomerSelector New - Comprehensive Tests (TDD)
 * Tests written first for the new improved component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { CustomerSelector } from '../CustomerSelector.new';
import { dataCache } from '@/services/dataCache';

// Mock react-native-paper Portal
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

// Mock dataCache
jest.mock('@/services/dataCache');

const mockCustomers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
];

const mockDataCache = dataCache as jest.Mocked<typeof dataCache>;

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('CustomerSelector New - Improved Quality', () => {
  const mockOnSelectCustomer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockDataCache.getCustomers = jest.fn().mockResolvedValue(mockCustomers);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders label correctly', async () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Customer *')).toBeTruthy();
      });
    });

    it('renders placeholder when no customer selected', async () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Select Customer')).toBeTruthy();
      });
    });

    it('renders selected customer information', async () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          selectedCustomer={mockCustomers[0] ?? null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      await waitFor(() => {
        expect(getByText(/John Doe/)).toBeTruthy();
      });
    });
  });

  describe('Data Loading', () => {
    it('loads customers from cache on mount', async () => {
      renderWithTheme(
        <CustomerSelector
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      await waitFor(() => {
        expect(mockDataCache.getCustomers).toHaveBeenCalledTimes(1);
      });
    });

    it('shows loading state while fetching', async () => {
      mockDataCache.getCustomers = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockCustomers), 100))
      );
      
      const { getByText } = renderWithTheme(
        <CustomerSelector
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      expect(getByText('Loading customers...')).toBeTruthy();
    });

    it('uses cached data on subsequent renders', async () => {
      const { rerender } = renderWithTheme(
        <CustomerSelector
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      await waitFor(() => {
        expect(mockDataCache.getCustomers).toHaveBeenCalledTimes(1);
      });
      
      // Rerender - should use cache
      rerender(
        <PaperProvider>
          <CustomerSelector
            selectedCustomer={null}
            onSelectCustomer={mockOnSelectCustomer}
          />
        </PaperProvider>
      );
      
      // Should not call again immediately (cache is used)
      expect(mockDataCache.getCustomers).toHaveBeenCalledTimes(1);
    });
  });

  describe('Menu Interaction', () => {
    it('opens menu when button is clicked', async () => {
      const { getByText, queryByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Select Customer')).toBeTruthy();
      });
      
      const button = getByText('Select Customer');
      fireEvent.press(button);
      
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      
      await waitFor(() => {
        expect(queryByPlaceholderText('Search by name, email, phone...')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('opens menu reliably on second click', async () => {
      const { getByText, queryByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Select Customer')).toBeTruthy();
      });
      
      const button = getByText('Select Customer');
      
      // First click
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Close menu (simulate dismiss)
      await waitFor(() => {
        const searchBar = queryByPlaceholderText('Search by name, email, phone...');
        if (searchBar) {
          // Menu is open, now close it
          fireEvent.press(button); // Click outside or dismiss
        }
      });
      
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      
      // Second click - should open again
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      
      await waitFor(() => {
        expect(queryByPlaceholderText('Search by name, email, phone...')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Customer Selection', () => {
    it('calls onSelectCustomer when customer is selected', async () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Select Customer')).toBeTruthy();
      });
      
      const button = getByText('Select Customer');
      fireEvent.press(button);
      
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      
      const customerItem = await waitFor(() => getByText(/John Doe/));
      fireEvent.press(customerItem);
      
      await waitFor(() => {
        expect(mockOnSelectCustomer).toHaveBeenCalledWith(mockCustomers[0]);
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters customers by name', async () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      
      await waitFor(() => {
        expect(getByText('Select Customer')).toBeTruthy();
      });
      
      const button = getByText('Select Customer');
      fireEvent.press(button);
      
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      
      const searchBar = await waitFor(() => getByPlaceholderText('Search by name, email, phone...'));
      fireEvent.changeText(searchBar, 'John');
      
      await waitFor(() => {
        expect(getByText(/John Doe/)).toBeTruthy();
        expect(() => getByText(/Jane Smith/)).toThrow();
      });
    });
  });
});

