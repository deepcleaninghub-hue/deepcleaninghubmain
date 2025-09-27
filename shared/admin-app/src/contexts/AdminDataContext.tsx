import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { 
  AdminBooking, 
  AdminService, 
  AdminDataContextType 
} from '@/types';
import { adminDataService } from '@/services/adminDataService';
import { useAdminAuth } from './AdminAuthContext';

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

interface AdminDataProviderProps {
  children: ReactNode;
}

export function AdminDataProvider({ children }: AdminDataProviderProps) {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const refreshData = async (): Promise<void> => {
    try {
      setLoading(true);
      await Promise.all([
        refreshBookings(),
        refreshServices(),
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBookings = async (): Promise<void> => {
    try {
      const result = await adminDataService.getBookings();
      if (result.success && result.data) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    }
  };

  const refreshServices = async (): Promise<void> => {
    try {
      const result = await adminDataService.getServices();
      if (result.success && result.data) {
        setServices(result.data);
      }
    } catch (error) {
      console.error('Failed to refresh services:', error);
    }
  };

  const value: AdminDataContextType = {
    bookings,
    services,
    loading,
    refreshData,
    refreshBookings,
    refreshServices,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextType {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
