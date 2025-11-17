import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AdminDataProvider, useAdminData } from '../AdminDataContext';
import { adminDataService } from '@/services/adminDataService';
import { useAdminAuth } from '../AdminAuthContext';

// Mock services
jest.mock('@/services/adminDataService');
jest.mock('../AdminAuthContext', () => ({
  useAdminAuth: jest.fn(),
}));

const mockAdminDataService = adminDataService as jest.Mocked<typeof adminDataService>;
const mockUseAdminAuth = useAdminAuth as jest.MockedFunction<typeof useAdminAuth>;

describe('AdminDataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdminAuth.mockReturnValue({
      isAuthenticated: true,
      admin: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      refreshToken: jest.fn(),
      hasPermission: jest.fn(),
      lastError: null,
    });
  });

  it('provides initial empty state', () => {
    mockAdminDataService.getBookings.mockResolvedValue({
      success: true,
      data: [],
    });
    mockAdminDataService.getServices.mockResolvedValue({
      success: true,
      data: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminDataProvider>{children}</AdminDataProvider>
    );

    const { result } = renderHook(() => useAdminData(), { wrapper });

    expect(result.current.bookings).toEqual([]);
    expect(result.current.services).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('refreshes bookings successfully', async () => {
    const mockBookings = [
      {
        id: '1',
        serviceId: 's1',
        customerId: 'c1',
        date: '2024-01-15',
        time: '10:00',
        status: 'pending' as const,
      },
    ];

    mockAdminDataService.getBookings.mockResolvedValue({
      success: true,
      data: mockBookings as any,
    });
    mockAdminDataService.getServices.mockResolvedValue({
      success: true,
      data: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminDataProvider>{children}</AdminDataProvider>
    );

    const { result } = renderHook(() => useAdminData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshBookings();
    });

    expect(result.current.bookings).toEqual(mockBookings);
  });

  it('refreshes services successfully', async () => {
    const mockServices = [
      {
        id: '1',
        title: 'Cleaning Service',
        description: 'Test',
        category: 'Cleaning',
        isActive: true,
        pricingType: 'fixed' as const,
      },
    ];

    mockAdminDataService.getBookings.mockResolvedValue({
      success: true,
      data: [],
    });
    mockAdminDataService.getServices.mockResolvedValue({
      success: true,
      data: mockServices as any,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminDataProvider>{children}</AdminDataProvider>
    );

    const { result } = renderHook(() => useAdminData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshServices();
    });

    expect(result.current.services).toEqual(mockServices);
  });

  it('refreshes all data', async () => {
    const mockBookings = [{ id: '1' }] as any;
    const mockServices = [{ id: '1' }] as any;

    mockAdminDataService.getBookings.mockResolvedValue({
      success: true,
      data: mockBookings,
    });
    mockAdminDataService.getServices.mockResolvedValue({
      success: true,
      data: mockServices,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminDataProvider>{children}</AdminDataProvider>
    );

    const { result } = renderHook(() => useAdminData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.bookings).toEqual(mockBookings);
    expect(result.current.services).toEqual(mockServices);
  });

  it('handles refresh errors gracefully', async () => {
    mockAdminDataService.getBookings.mockRejectedValue(new Error('Network error'));
    mockAdminDataService.getServices.mockResolvedValue({
      success: true,
      data: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AdminDataProvider>{children}</AdminDataProvider>
    );

    const { result } = renderHook(() => useAdminData(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshBookings();
    });

    // Should not crash, bookings should remain empty
    expect(result.current.bookings).toEqual([]);
  });

  it('throws error when used outside provider', () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useAdminData());
    }).toThrow('useAdminData must be used within an AdminDataProvider');

    console.error = originalError;
  });
});

