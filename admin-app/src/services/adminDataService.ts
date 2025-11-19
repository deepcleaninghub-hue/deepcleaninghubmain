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

  async getServices(category?: string): Promise<AdminApiResponse<AdminService[]>> {
    try {
      // Use the same endpoint as shared app - this includes service_variants
      // Build URL with query params (axios style)
      let url = '/services';
      if (category) {
        url = `/services?category=${encodeURIComponent(category)}`;
      }

      const res = await httpClient.get<{ success: boolean; data: any[]; count?: number }>(url);

      // httpClient.get returns axios response: { data: { success, data: [...] } }
      const responseData = res.data;

      // Handle case where response might be directly the data array or have different structure
      if (Array.isArray(responseData)) {
        return {
          success: true, data: responseData.map((service: any): AdminService => {
            const result: AdminService = {
              id: service.id,
              title: service.title,
              description: service.description,
              category: service.category,
              isActive: service.is_active ?? true,
              pricingType: (service.pricing_type || 'fixed') as 'fixed' | 'hourly' | 'custom',
              totalBookings: 0,
              totalRevenue: 0,
              averageRating: 0,
              popularityScore: 0,
              seasonalTrends: [],
              staffRequirements: [],
              equipmentNeeded: [],
              suppliesNeeded: [],
              estimatedDuration: 0,
              difficultyLevel: 'medium' as const,
            };
            if (service.price) {
              result.price = parseFloat(service.price);
            }
            return result;
          })
        };
      }

      if (responseData && responseData.success && responseData.data) {
        // The /services endpoint returns services with service_variants included
        // Transform to match AdminService format (using snake_case from database)
        const transformedServices = responseData.data.map((service: any): AdminService => {
          const result: AdminService = {
            id: service.id,
            title: service.title,
            description: service.description,
            category: service.category,
            isActive: service.is_active ?? true,
            pricingType: (service.pricing_type || 'fixed') as 'fixed' | 'hourly' | 'custom',
            // AdminService extended fields with defaults
            totalBookings: 0,
            totalRevenue: 0,
            averageRating: 0,
            popularityScore: 0,
            seasonalTrends: [],
            staffRequirements: [],
            equipmentNeeded: [],
            suppliesNeeded: [],
            estimatedDuration: 0,
            difficultyLevel: 'medium' as const,
          };
          if (service.price) {
            result.price = parseFloat(service.price);
          }
          return result;
        });

        return { success: true, data: transformedServices };
      }

      return { success: true, data: [] };
    } catch (error: any) {
      console.error('Error fetching services:', error);
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
  // Use the same endpoint as shared app
  async getServiceVariants(serviceId: string): Promise<AdminApiResponse<any[]>> {
    try {
      // Use the same endpoint as shared app: /service-variants?service_id=...
      const url = `/service-variants?service_id=${serviceId}`;

      const res = await httpClient.get<AdminApiResponse<any[]>>(url);

      if (res.data && res.data.success && res.data.data) {

        // Transform variants to match expected format (same as shared app)
        const transformedVariants = res.data.data.map((variant: any) => ({
          id: variant.id,
          service_id: variant.service_id,
          title: variant.title,
          description: variant.description,
          price: variant.price ? parseFloat(variant.price) : undefined,
          unitPrice: variant.unit_price ? parseFloat(variant.unit_price) : undefined,
          unitMeasure: variant.unit_measure,
          pricingType: variant.pricing_type,
          minMeasurement: variant.min_measurement,
          maxMeasurement: variant.max_measurement,
          measurementStep: variant.measurement_step,
          measurementPlaceholder: variant.measurement_placeholder,
          duration: variant.duration,
          is_active: variant.is_active,
          display_order: variant.display_order,
        }));

        return { success: true, data: transformedVariants };
      }

      return { success: true, data: [] };
    } catch (error: any) {
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

  async deleteBooking(id: string): Promise<AdminApiResponse> {
    try {
      const res = await httpClient.delete<AdminApiResponse>(`/admin/bookings/${id}`);
      return res.data;
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete booking',
      };
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
      // Use the same endpoint as shared app (/service-bookings) which accepts the full booking data format
      const res = await httpClient.post<AdminApiResponse<any>>('/service-bookings', bookingData);
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

  // Mobile Users (Customers) Management
  async getMobileUsers(): Promise<AdminApiResponse<any[]>> {
    try {
      const res = await httpClient.get<AdminApiResponse<any[]>>('/admin/mobile-users');
      return res.data;
    } catch (error) {
      console.error('Error fetching mobile users:', error);
      return { success: false, error: 'Failed to fetch mobile users' };
    }
  }

  async getMobileUser(id: string): Promise<AdminApiResponse<any>> {
    try {
      const res = await httpClient.get<AdminApiResponse<any>>(`/admin/mobile-users/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching mobile user:', error);
      return { success: false, error: 'Failed to fetch mobile user' };
    }
  }

  // Fallbacks removed
}

export const adminDataService = new AdminDataService();


