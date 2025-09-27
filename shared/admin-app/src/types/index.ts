/**
 * Admin App Type Definitions
 * 
 * Centralized type definitions for the DeepClean Admin app.
 * Extends shared types with admin-specific functionality.
 */

// Minimal shared types to decouple from shared package
export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  isActive: boolean;
  pricingType: 'fixed' | 'hourly' | 'custom';
}

export interface Booking {
  id: string;
  serviceId: string;
  customerId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  // Multi-day booking support
  isMultiDay?: boolean;
  parentBookingId?: string;
  bookingDates?: BookingDate[];
  allBookingDates?: BookingDate[];
  totalDays?: number;
}

export interface BookingDate {
  date: string;
  time: string;
  bookingId: string;
}

export interface ServiceVariant { id: string; name: string }
export interface ServiceOption { id: string; name: string }

// Admin User interface
export interface AdminUser extends User {
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  permissions: AdminPermission[];
  lastActive: string;
  isOnline: boolean;
}

export interface AdminPermission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: Record<string, any>;
}

// Dashboard analytics removed

// Enhanced Booking types for admin
export interface AdminBooking extends Booking {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedStaff?: string;
  staffNotes?: string;
  adminNotes?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  customerRating?: number;
  customerFeedback?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  conflictDetected?: boolean;
  conflictReason?: string;
  createdAt: string;
  updatedAt: string;
  // Database fields
  user_id?: string;
  service_id?: string;
  service_variant_id?: string;
  booking_date?: string;
  booking_time?: string;
  duration_minutes?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_address?: string;
  special_instructions?: string;
  total_amount?: number;
  payment_status?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
  // Multi-day booking database fields
  booking_dates?: any; // JSONB field
  is_multi_day?: boolean;
  parent_booking_id?: string;
  // Related data
  services?: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
  mobile_users?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export interface BookingStatusUpdate {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  assignedStaff?: string;
  estimatedDuration?: number;
}


// Service Management types
export interface AdminService extends Service {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  popularityScore: number;
  seasonalTrends: ServiceTrend[];
  staffRequirements: StaffRequirement[];
  equipmentNeeded: string[];
  suppliesNeeded: string[];
  estimatedDuration: number;
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface ServiceTrend {
  month: string;
  bookings: number;
  revenue: number;
  rating: number;
}

export interface StaffRequirement {
  role: string;
  minCount: number;
  maxCount: number;
  skills: string[];
}

// Support and Feedback types removed

// Notification types removed

// Settings and Configuration types removed

// Navigation types
export type AdminRootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AdminAuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type AdminMainTabParamList = {
  Bookings: undefined;
  Services: undefined;
  Profile: undefined;
};

export type AdminBookingStackParamList = {
  BookingList: undefined;
  BookingDetails: { bookingId: string };
  BookingEdit: { bookingId: string };
  BookingCreate: undefined;
};

export type AdminServiceStackParamList = {
  ServiceList: undefined;
  ServiceDetails: { serviceId: string };
  ServiceEdit: { serviceId: string };
  ServiceCreate: undefined;
  ServiceVariants: { serviceId: string };
  ServiceCategories: undefined;
};

// API Response types
export interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and Search types
export interface BookingFilters {
  status?: Array<'pending' | 'confirmed' | 'completed' | 'cancelled'>;
  priority?: AdminBooking['priority'][];
  dateRange?: {
    start: string;
    end: string;
  };
  assignedStaff?: string[];
  customerName?: string;
  serviceType?: string[];
}

// Customer filters removed

export interface ServiceFilters {
  category?: string[];
  isActive?: boolean;
  pricingType?: Service['pricingType'][];
  difficultyLevel?: AdminService['difficultyLevel'][];
}

// Analytics types removed

// Form types
export interface AdminFormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Context types
export interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AdminUser>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  hasPermission: (resource: string, action: string) => boolean;
}

export interface AdminDataContextType {
  bookings: AdminBooking[];
  services: AdminService[];
  loading: boolean;
  refreshData: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  refreshServices: () => Promise<void>;
}
