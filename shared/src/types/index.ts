/**
 * Shared Type Definitions
 * 
 * Centralized type definitions for the DeepClean Mobile Hub app.
 * Ensures consistency across the entire application.
 */

// Base user interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string; // Made required
  address: string; // Added required address field
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Service related types
export interface Service {
  id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  pricingType: 'fixed' | 'per_unit' | 'hourly';
  price?: number;
  unitPrice?: number;
  unitMeasure?: string;
  minMeasurement?: number;
  maxMeasurement?: number;
  measurementStep?: number;
  measurementPlaceholder?: string;
  duration?: string;
  features: string[];
  displayOrder: number;
  isActive: boolean;
  serviceVariants: ServiceVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceVariant {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  price: number;
  duration?: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional pricing fields from database
  pricingType?: 'fixed' | 'per_unit';
  unitPrice?: number | undefined;
  unitMeasure?: string;
  minMeasurement?: number;
  maxMeasurement?: number;
  measurementStep?: number;
  measurementPlaceholder?: string;
  displayOrder?: number;
}

export interface ServiceOption {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  services: {
    id: string;
    title: string;
    category: string;
  };
}

// Cart related types
export interface CartItem {
  id: string;
  serviceId: string;
  service_id: string;
  title: string;
  service_title: string;
  description: string;
  service_description: string;
  duration?: string;
  service_duration?: string;
  price: number;
  service_price: number;
  quantity: number;
  userInputs?: Record<string, any>;
  user_inputs?: Record<string, any>;
  calculatedPrice?: number;
  calculated_price?: number;
  createdAt: string;
  updatedAt: string;
  // User inputs from service modal
  service_variant_data?: any;
  moving_service_data?: any;
  cost_breakdown?: any;
  booking_type?: string;
  is_house_moving?: boolean;
  area_sqm?: number | null;
  distance_km?: number | null;
  number_of_boxes?: number;
  boxes_cost?: number;
  area_cost?: number | null;
  distance_cost?: number | null;
  subtotal_before_vat?: number | null;
  vat_amount?: number | null;
  vat_rate?: number;
  service_duration_hours?: number | null;
  measurement_value?: number | null;
  measurement_unit?: string | null;
  unit_price?: number | null;
  pricing_type?: string;
  selected_dates?: any;
  is_multi_day_booking?: boolean;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  tax?: number;
  discount?: number;
}

// Booking related types
export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceAddress: string;
  serviceDate: string;
  serviceTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total: number;
  notes?: string;
  services: BookingService[];
  createdAt: string;
  updatedAt: string;
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
  id: string;
}

export interface BookingService {
  id: string;
  serviceId: string;
  title: string;
  price: number;
  quantity: number;
  userInputs?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T = any> {
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

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Services: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Contact: undefined;
};

export type ServicesStackParamList = {
  ServicesMain: undefined;
  ServiceDetails: { serviceId: string };
  ServiceOptions: { serviceId: string };
  Contact: undefined;
};

export type CartStackParamList = {
  CartMain: undefined;
  ServiceOptions: { serviceId: string };
  Checkout: undefined;
  OrderConfirmation: { bookingId: string };
};

export type OrdersStackParamList = {
  OrdersMain: undefined;
  OrderDetails: { orderId: string };
  Booking: { serviceId?: string };
  ServiceOptions: { serviceId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

// Theme types
export interface AppTheme {
  colors: {
    primary: string;
    primaryContainer: string;
    secondary: string;
    secondaryContainer: string;
    tertiary: string;
    tertiaryContainer: string;
    surface: string;
    surfaceVariant: string;
    background: string;
    error: string;
    errorContainer: string;
    onPrimary: string;
    onSecondary: string;
    onTertiary: string;
    onSurface: string;
    onSurfaceVariant: string;
    onBackground: string;
    onError: string;
    outline: string;
    outlineVariant: string;
    shadow: string;
    scrim: string;
    inverseSurface: string;
    inverseOnSurface: string;
    inversePrimary: string;
    elevation: {
      level0: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
      level5: string;
    };
  };
  fonts: any;
  roundness: number;
}

// Context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone: string, address: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  updateUser: (updatedUser: User) => void;
  clearAllAuthData: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export interface CartContextType {
  cartItems: CartItem[];
  cartSummary: CartSummary;
  serviceCategories: Service[];
  loading: boolean;
  addToCart: (service: Service, calculatedPrice?: number, userInputs?: any) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: (forceRefresh?: boolean) => Promise<void>;
  refreshServiceCategories: () => Promise<void>;
  isServiceInCart: (serviceId: string) => boolean;
}

// Component prop types
export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: 'none' | 'button' | 'link' | 'image' | 'text' | 'keyboardkey' | 'search' | 'summary' | 'adjustable' | 'header' | 'alert' | 'checkbox' | 'combobox' | 'menu' | 'menubar' | 'menuitem' | 'progressbar' | 'radio' | 'radiogroup' | 'scrollbar' | 'spinbutton' | 'switch' | 'tab' | 'tablist' | 'timer' | 'toolbar' | 'tabbar' | 'tabpanel' | 'list' | 'listitem' | 'grid' | 'gridcell' | 'banner' | 'complementary' | 'contentinfo' | 'form' | 'main' | 'navigation' | 'region' | 'search' | 'article' | 'aside' | 'figure' | 'footer' | 'header' | 'section' | 'status' | 'alertdialog' | 'dialog' | 'log' | 'marquee' | 'note' | 'presentation' | 'separator' | 'tooltip' | 'tree' | 'treeitem';
  accessibilityHint?: string;
}

export interface LoadingProps extends BaseComponentProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorProps extends BaseComponentProps {
  error: string | null;
  onRetry?: () => void;
  retryText?: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Environment types
export type Environment = 'development' | 'staging' | 'production';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
