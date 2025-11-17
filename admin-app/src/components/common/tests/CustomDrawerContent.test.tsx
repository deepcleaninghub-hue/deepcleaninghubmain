import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomDrawerContent } from '../CustomDrawerContent';

// Mock useAdminAuth
const mockSignOut = jest.fn();
jest.mock('@/contexts/AdminAuthContext', () => ({
  useAdminAuth: () => ({
    admin: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'admin',
    },
    signOut: mockSignOut,
  }),
}));

// Mock Icon
jest.mock('../Icon', () => ({
  Icon: ({ name }: any) => null,
}));

describe('CustomDrawerContent', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockState = {
    routes: [
      { key: 'route1', name: 'Dashboard' },
      { key: 'route2', name: 'Bookings' },
    ],
    index: 0,
  };

  const mockDescriptors = {
    route1: {
      options: {
        drawerLabel: 'Dashboard',
        drawerIcon: () => null,
      },
    },
    route2: {
      options: {
        drawerLabel: 'Bookings',
        drawerIcon: () => null,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders admin information', () => {
    const { getByText } = render(
      <CustomDrawerContent
        navigation={mockNavigation}
        state={mockState}
        descriptors={mockDescriptors}
      />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('ADMIN')).toBeTruthy();
  });

  it('renders drawer items for each route', () => {
    const { getByText } = render(
      <CustomDrawerContent
        navigation={mockNavigation}
        state={mockState}
        descriptors={mockDescriptors}
      />
    );

    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Bookings')).toBeTruthy();
  });

  it('calls navigate when drawer item is pressed', () => {
    const { getByText } = render(
      <CustomDrawerContent
        navigation={mockNavigation}
        state={mockState}
        descriptors={mockDescriptors}
      />
    );

    const dashboardItem = getByText('Dashboard');
    fireEvent.press(dashboardItem);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard');
  });

  it('calls signOut when sign out button is pressed', async () => {
    const { getByText } = render(
      <CustomDrawerContent
        navigation={mockNavigation}
        state={mockState}
        descriptors={mockDescriptors}
      />
    );

    const signOutButton = getByText('Sign Out');
    fireEvent.press(signOutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('handles admin without firstName', () => {
    jest.resetModules();
    jest.mock('@/contexts/AdminAuthContext', () => ({
      useAdminAuth: () => ({
        admin: {
          id: '1',
          email: 'admin@example.com',
          role: 'admin',
        },
        signOut: mockSignOut,
      }),
    }));

    const { UNSAFE_root } = render(
      <CustomDrawerContent
        navigation={mockNavigation}
        state={mockState}
        descriptors={mockDescriptors}
      />
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});

