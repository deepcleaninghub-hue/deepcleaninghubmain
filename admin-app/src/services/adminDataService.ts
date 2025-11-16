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

  async getService(id: string): Promise<AdminApiResponse<AdminService>> {
    try {
      const res = await httpClient.get<AdminApiResponse<AdminService>>(`/services/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching service:', error);
      return { success: false, error: 'Failed to fetch service' };
    }
  }

  async createService(service: Partial<AdminService>): Promise<AdminApiResponse<AdminService>> {
    try {
      const res = await httpClient.post<AdminApiResponse<AdminService>>('/services', service);
      return res.data;
    } catch (error) {
      console.error('Error creating service:', error);
      return { success: false, error: 'Failed to create service' };
    }
  }

  async updateService(id: string, updates: Partial<AdminService>): Promise<AdminApiResponse<AdminService>> {
    try {
      const res = await httpClient.put<AdminApiResponse<AdminService>>(`/services/${id}`, updates);
      return res.data;
    } catch (error) {
      console.error('Error updating service:', error);
      return { success: false, error: 'Failed to update service' };
    }
  }

  async deleteService(id: string): Promise<AdminApiResponse> {
    try {
      const res = await httpClient.delete<AdminApiResponse>(`/services/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error deleting service:', error);
      return { success: false, error: 'Failed to delete service' };
    }
  }

  // Service Variant Management
  async getServiceVariants(serviceId: string): Promise<AdminApiResponse<any[]>> {
    try {
      const res = await httpClient.get<AdminApiResponse<any[]>>(`/service-variants?service_id=${serviceId}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching service variants:', error);
      return { success: false, error: 'Failed to fetch service variants' };
    }
  }

  async createServiceVariant(variant: any): Promise<AdminApiResponse<any>> {
    try {
      const res = await httpClient.post<AdminApiResponse<any>>('/service-variants', variant);
      return res.data;
    } catch (error) {
      console.error('Error creating service variant:', error);
      return { success: false, error: 'Failed to create service variant' };
    }
  }

  async updateServiceVariant(id: string, updates: any): Promise<AdminApiResponse<any>> {
    try {
      const res = await httpClient.put<AdminApiResponse<any>>(`/service-variants/${id}`, updates);
      return res.data;
    } catch (error) {
      console.error('Error updating service variant:', error);
      return { success: false, error: 'Failed to update service variant' };
    }
  }

  async deleteServiceVariant(id: string): Promise<AdminApiResponse> {
    try {
      const res = await httpClient.delete<AdminApiResponse>(`/service-variants/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error deleting service variant:', error);
      return { success: false, error: 'Failed to delete service variant' };
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

  // Create service booking (using same endpoint as shared app)
  async createBooking(bookingData: any): Promise<AdminApiResponse<any>> {
    try {
      console.log('Sending booking data to API:', JSON.stringify(bookingData, null, 2));
      // Use the same endpoint as shared app (/service-bookings) which accepts the full booking data format
      const res = await httpClient.post<AdminApiResponse<any>>('/service-bookings', bookingData);
      console.log('Booking creation response:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create booking',
      };
    }
  }

  // Fallbacks removed
}

export const adminDataService = new AdminDataService();


