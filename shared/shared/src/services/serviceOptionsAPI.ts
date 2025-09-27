import { httpClient } from './httpClient';

export interface ServiceOption {
  id: string;
  title: string;
  description: string;
  service_id: string;
  price: number;
  duration: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  services?: {
    id: string;
    title: string;
    category: string;
    image_url?: string;
  };
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
  duration: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class ServiceOptionsAPI {
  private baseUrl = '/service-options';

  // Get all service options
  async getAllServiceOptions(): Promise<ServiceOption[]> {
    try {
      const response = await httpClient.get<{success: boolean, data: ServiceOption[]}>(this.baseUrl);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching service options:', error);
      return [];
    }
  }

  // Get service options by category (service_id)
  async getServiceOptionsByCategory(serviceId: string): Promise<ServiceOption[]> {
    try {
      const response = await httpClient.get<{success: boolean, data: ServiceOption[]}>(`${this.baseUrl}?service_id=${serviceId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching service options by category:', error);
      return [];
    }
  }

  // Get service option by ID
  async getServiceOptionById(id: string): Promise<ServiceOption | null> {
    try {
      const response = await httpClient.get<{success: boolean, data: ServiceOption}>(`${this.baseUrl}/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching service option:', error);
      return null;
    }
  }

  // Get service categories (from services table)
  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await httpClient.get<{success: boolean, data: ServiceCategory[]}>('/services');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching service categories:', error);
      return [];
    }
  }
}

export const serviceOptionsAPI = new ServiceOptionsAPI();
