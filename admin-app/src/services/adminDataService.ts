import { httpClient } from '@/services/httpClient';
import {
  AdminApiResponse,
  AdminBooking,
  AdminService,
} from '@/types';

class AdminDataService {
  // Dashboard metrics removed

  async getBookings(): Promise<AdminApiResponse<AdminBooking[]>> {
    try {
      const res = await httpClient.get<AdminApiResponse<AdminBooking[]>>('/admin/bookings');
      return res.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, error: 'Failed to fetch bookings' };
    }
  }

  async getServices(): Promise<AdminApiResponse<AdminService[]>> {
    try {
      const res = await httpClient.get<AdminApiResponse<AdminService[]>>('/services/admin');
      return res.data;
    } catch (error) {
      return { success: true, data: [] };
    }
  }

  async getBooking(id: string): Promise<AdminApiResponse<AdminBooking>> {
    try {
      const res = await httpClient.get<AdminApiResponse<AdminBooking>>(`/admin/bookings/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      return { success: false, error: 'Failed to fetch booking' };
    }
  }

  async updateBooking(id: string, updates: Partial<AdminBooking>): Promise<AdminApiResponse<AdminBooking>> {
    try {
      const res = await httpClient.put<AdminApiResponse<AdminBooking>>(`/admin/bookings/${id}`, updates);
      return res.data;
    } catch (error) {
      return { success: false, error: 'Failed to update booking.' };
    }
  }

  async updateBookingStatus(update: { bookingId: string; status: string }): Promise<AdminApiResponse<AdminBooking>> {
    try {
      const response = await httpClient.patch(`/admin/bookings/${update.bookingId}/status`, { status: update.status });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { success: false, error: 'Failed to update booking status.' };
    }
  }

  async getRevenueData(period: 'weekly' | 'monthly'): Promise<AdminApiResponse<Array<{ date: string; amount: number; bookings: number }>>> {
    try {
      const res = await httpClient.get<AdminApiResponse<Array<{ date: string; amount: number; bookings: number }>>>(`/admin/analytics/revenue?period=${period}`);
      return res.data;
    } catch (error) {
      // Fallback mock data
      const today = new Date();
      const data = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return {
          date: d.toISOString(),
          amount: Math.round(Math.random() * 500),
          bookings: Math.floor(Math.random() * 10),
        };
      });
      return { success: true, data };
    }
  }

  // Fallbacks removed
}

export const adminDataService = new AdminDataService();


