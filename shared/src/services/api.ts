/**
 * API Service
 * 
 * Centralized API service with proper error handling and type safety
 * for the DeepClean Mobile Hub app.
 */

import { httpClient } from './httpClient';
import { 
  Service, 
  CartItem, 
  CartSummary, 
  Booking, 
  User, 
  ApiResponse 
} from '../types';

// Simple console.log wrapper for now
const secureLog = (level: string, message: string, data?: any) => {
  console.log(`[${level.toUpperCase()}] ${message}`, data || '');
};

// Transform API response from snake_case to camelCase
const transformService = (apiService: any): Service => ({
  id: apiService.id,
  title: apiService.title,
  description: apiService.description,
  image: apiService.image_url,
  category: apiService.category,
  pricingType: apiService.pricing_type,
  price: apiService.price,
  unitPrice: apiService.unit_price,
  unitMeasure: apiService.unit_measure,
  minMeasurement: apiService.min_measurement,
  maxMeasurement: apiService.max_measurement,
  measurementStep: apiService.measurement_step,
  measurementPlaceholder: apiService.measurement_placeholder,
  duration: apiService.duration,
  features: apiService.features || [],
  displayOrder: apiService.display_order,
  isActive: apiService.is_active,
  serviceVariants: (apiService.service_variants || []).map((variant: any) => ({
    id: variant.id,
    serviceId: variant.service_id,
    title: variant.title,
    description: variant.description,
    price: variant.price,
    duration: variant.duration,
    features: variant.features || [],
    isActive: variant.is_active,
    createdAt: variant.created_at,
    updatedAt: variant.updated_at,
  })),
  createdAt: apiService.created_at,
  updatedAt: apiService.updated_at,
});

// Services API
export const servicesAPI = {
  async getAllServices(): Promise<Service[]> {
    try {
      const response = await httpClient.get<{ success: boolean; data: any[] }>('/services');
      
      if (response.success && response.data) {
        console.log('Services fetched successfully:', response.data.length);
        // Transform the API response to match our types
        const transformedServices = response.data.map(transformService);
        return transformedServices;
      }
      
      console.log('No services data received, returning fallback');
      return getFallbackServices();
    } catch (error) {
      console.error('Error fetching services:', error);
      return getFallbackServices();
    }
  },

  async getServiceById(id: string): Promise<Service | null> {
    try {
      const response = await httpClient.get<ApiResponse<any>>(`/services/${id}`);
      
      if (response.success && response.data) {
        return transformService(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching service by ID:', { error, serviceId: id });
      return null;
    }
  },

  async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      const response = await httpClient.get<ApiResponse<any[]>>('/services', { category });
      
      if (response.success && response.data) {
        return response.data.map(transformService);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching services by category:', { error, category });
      return [];
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await httpClient.get<ApiResponse<string[]>>('/services/categories');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      secureLog('error', 'Error fetching categories', { error });
      return [];
    }
  },
};

// Cart API
export const cartAPI = {
  async getCartItems(): Promise<CartItem[]> {
    try {
      const response = await httpClient.get<ApiResponse<CartItem[]>>('/cart/items');
      return response.success ? response.data || [] : [];
    } catch (error) {
      secureLog('error', 'Error fetching cart items', { error });
      return [];
    }
  },

  async getCartSummary(): Promise<CartSummary> {
    try {
      const response = await httpClient.get<ApiResponse<CartSummary>>('/cart/summary');
      return response.success ? response.data || { totalItems: 0, totalPrice: 0, subtotal: 0 } : { totalItems: 0, totalPrice: 0, subtotal: 0 };
    } catch (error) {
      secureLog('error', 'Error fetching cart summary', { error });
      return { totalItems: 0, totalPrice: 0, subtotal: 0 };
    }
  },

  async addToCart(cartItemData: Partial<CartItem>): Promise<boolean> {
    try {
      const response = await httpClient.post<ApiResponse<CartItem>>('/cart/items', cartItemData);
      return response.success;
    } catch (error) {
      secureLog('error', 'Error adding to cart', { error, cartItemData });
      return false;
    }
  },

  async updateCartItem(cartItemId: string, updates: Partial<CartItem>): Promise<boolean> {
    try {
      const response = await httpClient.patch<ApiResponse<CartItem>>(`/cart/items/${cartItemId}`, updates);
      return response.success;
    } catch (error) {
      secureLog('error', 'Error updating cart item', { error, cartItemId, updates });
      return false;
    }
  },

  async removeFromCart(cartItemId: string): Promise<boolean> {
    try {
      const response = await httpClient.delete<ApiResponse>(`/cart/items/${cartItemId}`);
      return response.success;
    } catch (error) {
      secureLog('error', 'Error removing from cart', { error, cartItemId });
      return false;
    }
  },

  async clearCart(): Promise<boolean> {
    try {
      const response = await httpClient.delete<ApiResponse>('/cart/clear');
      return response.success;
    } catch (error) {
      secureLog('error', 'Error clearing cart', { error });
      return false;
    }
  },
};

// Booking API
export const bookingAPI = {
  async createBooking(bookingData: Partial<Booking>): Promise<Booking | null> {
    try {
      const response = await httpClient.post<ApiResponse<Booking>>('/bookings', bookingData);
      
      if (response.success && response.data) {
        secureLog('info', 'Booking created successfully', { bookingId: response.data.id });
        return response.data;
      }
      
      return null;
    } catch (error) {
      secureLog('error', 'Error creating booking', { error, bookingData });
      return null;
    }
  },

  async getBookings(): Promise<Booking[]> {
    try {
      const response = await httpClient.get<ApiResponse<Booking[]>>('/bookings');
      return response.success ? response.data || [] : [];
    } catch (error) {
      secureLog('error', 'Error fetching bookings', { error });
      return [];
    }
  },

  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const response = await httpClient.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
      return response.success ? response.data || null : null;
    } catch (error) {
      secureLog('error', 'Error fetching booking by ID', { error, bookingId });
      return null;
    }
  },

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<boolean> {
    try {
      const response = await httpClient.patch<ApiResponse<Booking>>(`/bookings/${bookingId}`, updates);
      return response.success;
    } catch (error) {
      secureLog('error', 'Error updating booking', { error, bookingId, updates });
      return false;
    }
  },

  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      const response = await httpClient.patch<ApiResponse<Booking>>(`/bookings/${bookingId}`, { status: 'cancelled' });
      return response.success;
    } catch (error) {
      secureLog('error', 'Error cancelling booking', { error, bookingId });
      return false;
    }
  },
};

// Profile API
export const profileAPI = {
  async getProfile(): Promise<User | null> {
    try {
      const response = await httpClient.get<ApiResponse<User>>('/profile');
      return response.success ? response.data || null : null;
    } catch (error) {
      secureLog('error', 'Error fetching profile', { error });
      return null;
    }
  },

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; data?: User; message?: string; error?: string }> {
    try {
      const response = await httpClient.patch<ApiResponse<User>>('/profile', updates);
      return {
        success: response.success,
        ...(response.data && { data: response.data }),
        ...(response.message && { message: response.message }),
        ...(response.error && { error: response.error }),
      };
    } catch (error) {
      secureLog('error', 'Error updating profile', { error, updates });
      return {
        success: false,
        error: 'Failed to update profile',
      };
    }
  },

  async deleteProfile(): Promise<boolean> {
    try {
      const response = await httpClient.delete<ApiResponse>('/profile');
      return response.success;
    } catch (error) {
      secureLog('error', 'Error deleting profile', { error });
      return false;
    }
  },
};

// Fallback data for when API is unavailable
const getFallbackServices = (): Service[] => [
  {
    id: 'fallback-1',
    title: 'Deep House Cleaning',
    description: 'Comprehensive house cleaning service for your entire home',
    image: '',
    category: 'House Cleaning',
    pricingType: 'fixed',
    price: 150,
    duration: '4-6 hours',
    features: ['Kitchen', 'Bathrooms', 'Living Areas', 'Bedrooms'],
    displayOrder: 1,
    isActive: true,
    serviceVariants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    title: 'Kitchen Deep Clean',
    description: 'Thorough kitchen cleaning service including appliances and cabinets',
    image: '',
    category: 'Kitchen Cleaning',
    pricingType: 'fixed',
    price: 80,
    duration: '2-3 hours',
    features: ['Appliance cleaning', 'Cabinet cleaning', 'Surface sanitization', 'Grease removal'],
    displayOrder: 2,
    isActive: true,
    serviceVariants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    title: 'Bathroom Sanitization',
    description: 'Complete bathroom cleaning and sanitization service',
    image: '',
    category: 'Bathroom Cleaning',
    pricingType: 'fixed',
    price: 60,
    duration: '1-2 hours',
    features: ['Tile cleaning', 'Grout sanitization', 'Fixture polishing', 'Floor mopping'],
    displayOrder: 3,
    isActive: true,
    serviceVariants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    title: 'Office Cleaning',
    description: 'Professional office cleaning service for commercial spaces',
    image: '',
    category: 'Commercial Cleaning',
    pricingType: 'hourly',
    price: 25,
    duration: 'Per hour',
    features: ['Desk cleaning', 'Floor vacuuming', 'Trash removal', 'Window cleaning'],
    displayOrder: 4,
    isActive: true,
    serviceVariants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
