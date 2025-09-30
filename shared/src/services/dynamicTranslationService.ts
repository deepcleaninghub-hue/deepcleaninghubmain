/**
 * Dynamic Translation Service
 * 
 * Automatically translates all app content using Google Translate API
 * Replaces static translation files with dynamic translation
 */

import { googleTranslateService } from './googleTranslateService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base English translations (source of truth)
const BASE_TRANSLATIONS = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    ok: 'OK',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    confirm: 'Confirm',
    retry: 'Try Again',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    done: 'Done',
    close: 'Close',
    search: 'Search',
    goBack: 'Go back',
    filter: 'Filter',
    clear: 'Clear',
    select: 'Select',
    all: 'All',
    none: 'None',
    yes: 'Yes',
    no: 'No',
  },
  auth: {
    login: 'Login',
    signup: 'Sign Up',
    signUp: 'Sign Up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    address: 'Address',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    noAccount: "Don't have an account?",
    welcomeBack: 'Welcome Back',
    signInToAccount: 'Sign in to your Deep Cleaning Hub account',
    signIn: 'Sign In',
    signingIn: 'Signing In...',
    enterEmail: 'Enter your email address',
    enterPassword: 'Enter your password',
    wrongCredentials: 'Wrong email or password. Please check your credentials and try again.',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    signupSuccess: 'Account created successfully',
    signupFailed: 'Account creation failed',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters long',
    passwordsDoNotMatch: 'Passwords do not match',
  },
  cart: {
    title: 'Cart',
    pleaseLogin: 'Please Login',
    loginToViewCart: 'You need to be logged in to view your cart',
    loginRequired: 'Login Required',
    loginToCheckout: 'Please login to proceed to checkout',
    emptyCart: 'Your cart is empty',
    addItems: 'Add some items to get started',
    total: 'Total',
    checkout: 'Checkout',
    clearCart: 'Clear Cart',
    removeItem: 'Remove Item',
    empty: 'Your cart is empty',
    items: 'items',
    updateQuantity: 'Update Quantity',
    continueShopping: 'Continue Shopping',
  },
  orders: {
    title: 'My Orders',
    orderDetails: 'Order Details',
    orderConfirmation: 'Order Confirmation',
    scheduled: 'Scheduled',
    completed: 'Completed',
    noOrders: 'No orders found',
    loadingOrders: 'Loading orders...',
    myOrders: 'My Orders',
    orderNumber: 'Order #',
    status: 'Status',
    date: 'Date',
    viewDetails: 'View Details',
    trackOrder: 'Track Order',
    cancelOrder: 'Cancel Order',
    reorder: 'Reorder',
  },
  checkout: {
    title: 'Checkout',
    streetAddress: 'Street Address',
    city: 'City',
    postalCode: 'Postal Code',
    country: 'Country',
    specialRequests: 'Any special requests or instructions',
    placeOrder: 'Place Order',
    orderSummary: 'Order Summary',
    total: 'Total',
  },
  contact: {
    title: 'Contact Us',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    serviceRequired: 'Service Required',
    message: 'Message',
    submit: 'Submit Inquiry',
    submitting: 'Submitting...',
    success: 'Inquiry submitted successfully',
    error: 'Failed to submit inquiry',
    contactUs: 'Contact Us',
    getInTouch: 'Get in Touch',
    contactDescription: 'Have questions or need help? We\'re here to assist you.',
    serviceArea: 'Service Area',
    preferredDate: 'Preferred Date',
    sendMessage: 'Send Message',
    callUs: 'Call Us',
    emailUs: 'Email Us',
    whatsappUs: 'WhatsApp Us',
    contactMethods: 'Contact Methods',
    phone: 'Phone',
    email: 'Email',
    whatsapp: 'WhatsApp',
  },
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    myOrders: 'My Orders',
    browseServices: 'Browse Services',
    rateApp: 'Rate App',
    changeLanguage: 'Change Language',
    deleteAccount: 'Delete Account',
    quickActions: 'Quick actions',
    loadingProfile: 'Loading profile...',
    guestUser: 'Guest User',
    noEmail: 'No email',
    logoutConfirm: 'Are you sure you want to logout?',
    passwordChanged: 'Password changed successfully',
    currentPassword: 'Current Password',
    state: 'State',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    changingPassword: 'Changing...',
    deleteAccountStep1: '⚠️ Delete Account - Step 1 of 2',
    deleteAccountStep2: '🗑️ Delete Account - Step 2 of 2',
    deleteAccountWarning: 'This action will permanently delete your account and ALL associated data including:\n\n• All your bookings and orders\n• Personal information\n• Payment history\n• Account settings\n\nThis action CANNOT be undone.\n\nAre you sure you want to continue?',
    deleteAccountFinal: 'FINAL WARNING: You are about to permanently delete your account.\n\nTo confirm, please type "DELETE" in the text field below and tap "Delete Forever".',
    typeDeleteToConfirm: 'Type "DELETE" exactly as shown to permanently delete your account:',
    deleteForever: 'Delete Forever',
    invalidConfirmation: 'You must type "DELETE" exactly as shown. Account deletion cancelled.',
    accountDeleted: 'Your account has been permanently deleted. This feature will be implemented with the backend API.',
    iUnderstandContinue: 'I Understand, Continue',
    typeDeleteToConfirmButton: 'Type DELETE to Confirm',
  },
  services: {
    title: 'Services',
    browseServices: 'Browse Services',
    allServices: 'All Services',
    categories: 'Categories',
    searchServices: 'Search services...',
    noServicesFound: 'No services found',
    loadingServices: 'Loading services...',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove from Cart',
    inCart: 'In Cart',
    from: 'From',
    per: 'Per',
    optionsAvailable: 'options available',
    duration: 'Duration',
    features: 'Features',
    price: 'Price',
    total: 'Total',
    quantity: 'Quantity',
    enterDistance: 'Enter distance in km',
    distance: 'Distance',
    calculation: 'Calculation',
    basePrice: 'Base Price',
    distancePrice: 'Distance Price',
    totalPrice: 'Total Price',
    bookNow: 'Book Now',
    selectOptions: 'Select Options',
  },
  navigation: {
    home: 'Home',
    services: 'Services',
    cart: 'Cart',
    orders: 'Orders',
    profile: 'Profile',
    contact: 'Contact',
  },
  errors: {
    somethingWentWrong: 'Oops! Something went wrong',
    unexpectedError: 'We\'re sorry, but something unexpected happened. Please try again.',
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    notFound: 'Not found',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    validationError: 'Please check your input and try again.',
    errorDetails: 'Error Details (Development Only):',
  },
  language: {
    selectLanguage: 'Select Language',
    currentLanguage: 'Current Language',
    changeLanguage: 'Change Language',
    languageChanged: 'Language changed successfully',
  },
};

class DynamicTranslationService {
  private cache = new Map<string, any>();
  private readonly CACHE_PREFIX = 'dynamic_translation_';
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get translated text for a key
   */
  async getTranslation(key: string, language: string): Promise<string> {
    if (language === 'en') {
      return this.getNestedValue(BASE_TRANSLATIONS, key) || key;
    }

    // Check cache first
    const cacheKey = `${this.CACHE_PREFIX}${language}_${key}`;
    const cached = await this.getCachedTranslation(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Get the English text
      const englishText = this.getNestedValue(BASE_TRANSLATIONS, key);
      if (!englishText) {
        return key;
      }

      // Translate using Google Translate
      const result = await googleTranslateService.translateText(englishText, language, 'en');
      
      // Cache the translation
      await this.cacheTranslation(cacheKey, result.translatedText);
      
      return result.translatedText;
    } catch (error) {
      console.error('Dynamic translation error:', error);
      return this.getNestedValue(BASE_TRANSLATIONS, key) || key;
    }
  }

  /**
   * Get all translations for a language
   */
  async getAllTranslations(language: string): Promise<any> {
    if (language === 'en') {
      return BASE_TRANSLATIONS;
    }

    // Check cache for full translation set
    const cacheKey = `${this.CACHE_PREFIX}${language}_all`;
    const cached = await this.getCachedTranslation(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Translate the entire object
      const translated = await googleTranslateService.translateObject(BASE_TRANSLATIONS, language, 'en');
      
      // Cache the full translation set
      await this.cacheTranslation(cacheKey, translated);
      
      return translated;
    } catch (error) {
      console.error('Full translation error:', error);
      return BASE_TRANSLATIONS;
    }
  }

  /**
   * Preload translations for a language
   */
  async preloadTranslations(language: string): Promise<void> {
    try {
      await this.getAllTranslations(language);
    } catch (error) {
      console.error('Preload translation error:', error);
    }
  }

  /**
   * Clear translation cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      this.cache.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Get cached translation
   */
  private async getCachedTranslation(cacheKey: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_EXPIRY) {
          return data;
        } else {
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Cache retrieval error:', error);
    }
    return null;
  }

  /**
   * Cache translation
   */
  private async cacheTranslation(cacheKey: string, data: any): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }
}

export const dynamicTranslationService = new DynamicTranslationService();
export default dynamicTranslationService;
