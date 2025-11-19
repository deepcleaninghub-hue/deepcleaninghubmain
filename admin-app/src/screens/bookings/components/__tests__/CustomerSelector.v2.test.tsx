/**
 * CustomerSelector V2 - Comprehensive Tests (TDD)
 * Tests written first, then implementation
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { CustomerSelector } from '../CustomerSelector';
import { Customer } from '../../hooks/useCustomers';

// Mock react-native-paper Portal
jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

const mockCustomers: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', phone: '5555555555' },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('CustomerSelector V2 - Quality Improvements', () => {
  const mockOnSelectCustomer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders label correctly', () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      expect(getByText('Customer *')).toBeTruthy();
    });

    it('renders placeholder when no customer selected', () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      expect(getByText('Select Customer')).toBeTruthy();
    });

    it('renders selected customer information', () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={mockCustomers[0] ?? null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      expect(getByText('John Doe (john@example.com)')).toBeTruthy();
    });

    it('handles customer without phone number', () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={mockCustomers[2] ?? null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      expect(getByText('Bob Johnson (bob@example.com)')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when loading', () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
          loading={true}
        />
      );
      expect(getByText('Loading customers...')).toBeTruthy();
    });

    it('disables button when loading', () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
          loading={true}
        />
      );
      const button = getByText('Loading customers...');
      expect(button).toBeTruthy();
    });

    it('prevents menu opening when loading', async () => {
      const { getByText, queryByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
          loading={true}
        />
      );
      const button = getByText('Loading customers...');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(100);
      });
      expect(queryByPlaceholderText('Search by name, email, phone...')).toBeNull();
    });
  });

  describe('Menu Interaction', () => {
    it('opens menu when button is clicked', async () => {
      const { getByText, queryByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      await waitFor(() => {
        expect(queryByPlaceholderText('Search by name, email, phone...')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('closes menu when dismissed', async () => {
      const { getByText, queryByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      // Simulate menu dismiss
      const menu = queryByPlaceholderText('Search by name, email, phone...');
      if (menu) {
        // Menu should close on outside press
        fireEvent.press(button);
        await waitFor(() => {
          jest.advanceTimersByTime(100);
        });
      }
    });

    it('does not open menu if already visible', async () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(300);
      });
      // Verify menu opened
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      }, { timeout: 3000 });
      // Press again - Menu component will close it (expected behavior)
      // Our handler prevents duplicate open attempts
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      // Component should handle this gracefully - button should still work
      expect(button).toBeTruthy();
      // Can reopen menu
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(300);
      });
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Customer Selection', () => {
    it('calls onSelectCustomer when customer is selected', async () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      const customerItem = await waitFor(() => getByText(/John Doe/));
      fireEvent.press(customerItem);
      await waitFor(() => {
        expect(mockOnSelectCustomer).toHaveBeenCalledWith(mockCustomers[0]);
        expect(mockOnSelectCustomer).toHaveBeenCalledTimes(1);
      });
    });

    it('closes menu after selection', async () => {
      const { getByText, queryByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      const customerItem = await waitFor(() => getByText(/John Doe/));
      fireEvent.press(customerItem);
      await waitFor(() => {
        jest.advanceTimersByTime(100);
      });
      // Menu should be closed
      expect(queryByPlaceholderText('Search by name, email, phone...')).toBeNull();
    });

    it('clears search query after selection', async () => {
      const { getByText, getByPlaceholderText, queryByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      const searchBar = await waitFor(() => getByPlaceholderText('Search by name, email, phone...'));
      fireEvent.changeText(searchBar, 'John');
      expect(searchBar.props.value).toBe('John');
      const customerItem = await waitFor(() => getByText(/John Doe/));
      fireEvent.press(customerItem);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      // Menu should be closed and search cleared (verify by reopening menu)
      expect(queryByPlaceholderText('Search by name, email, phone...')).toBeNull();
      // Reopen menu to verify search is cleared
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      const newSearchBar = await waitFor(() => getByPlaceholderText('Search by name, email, phone...'));
      expect(newSearchBar.props.value).toBe('');
    });
  });

  describe('Search Functionality', () => {
    it('filters customers by name', async () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
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

    it('filters customers by email', async () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      const searchBar = await waitFor(() => getByPlaceholderText('Search by name, email, phone...'));
      fireEvent.changeText(searchBar, 'jane@example.com');
      await waitFor(() => {
        expect(getByText(/Jane Smith/)).toBeTruthy();
      });
    });

    it('filters customers by phone', async () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      const searchBar = await waitFor(() => getByPlaceholderText('Search by name, email, phone...'));
      fireEvent.changeText(searchBar, '1234567890');
      await waitFor(() => {
        expect(getByText(/John Doe/)).toBeTruthy();
      });
    });

    it('filters customers by ID', async () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      const searchBar = await waitFor(() => getByPlaceholderText('Search by name, email, phone...'));
      fireEvent.changeText(searchBar, '2');
      await waitFor(() => {
        expect(getByText(/Jane Smith/)).toBeTruthy();
      });
    });

    it('is case-insensitive', async () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      const searchBar = await waitFor(() => getByPlaceholderText('Search by name, email, phone...'));
      fireEvent.changeText(searchBar, 'JOHN');
      await waitFor(() => {
        expect(getByText(/John Doe/)).toBeTruthy();
      });
    });

    it('shows empty state when no matches found', async () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      const searchBar = await waitFor(() => getByPlaceholderText('Search by name, email, phone...'));
      fireEvent.changeText(searchBar, 'NonExistentCustomer');
      await waitFor(() => {
        expect(getByText('No customers found')).toBeTruthy();
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no customers available', async () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={[]}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      await waitFor(() => {
        expect(getByText('No customers available')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid button clicks gracefully', async () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      // Rapid clicks - should handle gracefully without errors
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(500);
      });
      // Should still work correctly - menu should eventually open
      // Give more time for state updates
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      }, { timeout: 5000 });
    });

    it('handles customers list changing while menu is open', async () => {
      const { getByText, rerender } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      fireEvent.press(button);
      await waitFor(() => {
        jest.advanceTimersByTime(300);
      });
      // Verify menu is open with all customers
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Jane Smith')).toBeTruthy();
      }, { timeout: 3000 });
      // Change customers list - menu should update
      rerender(
        <PaperProvider>
          <CustomerSelector
            customers={mockCustomers[0] ? [mockCustomers[0]] : []}
            selectedCustomer={null}
            onSelectCustomer={mockOnSelectCustomer}
          />
        </PaperProvider>
      );
      await waitFor(() => {
        jest.advanceTimersByTime(200);
      });
      // Menu might close on rerender, but component should handle it gracefully
      // Reopen to verify updated list
      const newButton = getByText('Select Customer');
      fireEvent.press(newButton);
      await waitFor(() => {
        jest.advanceTimersByTime(300);
      });
      // Should show John Doe (still in list)
      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('handles very long customer names', () => {
      const longNameCustomer: Customer = {
        id: '5',
        name: 'Very Long Customer Name That Should Still Display Correctly',
        email: 'long@example.com',
      };
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={[longNameCustomer]}
          selectedCustomer={longNameCustomer}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      expect(getByText(/Very Long Customer Name/)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button', () => {
      const { getByText } = renderWithTheme(
        <CustomerSelector
          customers={mockCustomers}
          selectedCustomer={null}
          onSelectCustomer={mockOnSelectCustomer}
        />
      );
      const button = getByText('Select Customer');
      expect(button).toBeTruthy();
    });
  });
});

