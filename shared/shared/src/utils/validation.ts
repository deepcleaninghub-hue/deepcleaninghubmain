/**
 * Validation Utilities
 * 
 * Centralized validation functions for forms and data validation
 * across the DeepClean Mobile Hub app.
 */

import { ValidationError } from '../types';

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Name validation
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true };
};

// Address validation
export const validateAddress = (address: string): { isValid: boolean; error?: string } => {
  const trimmed = address.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Address is required' };
  }
  
  if (trimmed.length < 10) {
    return { isValid: false, error: 'Address must be at least 10 characters long' };
  }
  
  if (trimmed.length > 200) {
    return { isValid: false, error: 'Address must be less than 200 characters' };
  }
  
  return { isValid: true };
};

// Measurement validation
export const validateMeasurement = (
  value: string, 
  min?: number, 
  max?: number, 
  step?: number
): { isValid: boolean; error?: string; numericValue?: number } => {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Measurement is required' };
  }
  
  const numericValue = parseFloat(trimmed);
  
  if (isNaN(numericValue)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  if (numericValue <= 0) {
    return { isValid: false, error: 'Measurement must be greater than 0' };
  }
  
  if (min !== undefined && numericValue < min) {
    return { isValid: false, error: `Minimum measurement is ${min}` };
  }
  
  if (max !== undefined && numericValue > max) {
    return { isValid: false, error: `Maximum measurement is ${max}` };
  }
  
  if (step !== undefined) {
    const remainder = numericValue % step;
    if (remainder > 0.001) { // Allow for floating point precision
      return { isValid: false, error: `Measurement must be in increments of ${step}` };
    }
  }
  
  return { isValid: true, numericValue };
};

// Date validation
export const validateDate = (date: string): { isValid: boolean; error?: string } => {
  const trimmed = date.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Date is required' };
  }
  
  const dateObj = new Date(trimmed);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj < today) {
    return { isValid: false, error: 'Date cannot be in the past' };
  }
  
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  
  if (dateObj > maxDate) {
    return { isValid: false, error: 'Date cannot be more than 1 year in the future' };
  }
  
  return { isValid: true };
};

// Time validation
export const validateTime = (time: string): { isValid: boolean; error?: string } => {
  const trimmed = time.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Time is required' };
  }
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid time (HH:MM format)' };
  }
  
  return { isValid: true };
};

// Generic form validation
export const validateForm = <T extends Record<string, any>>(
  values: T,
  validators: Record<keyof T, (value: any) => { isValid: boolean; error?: string }>
): { isValid: boolean; errors: Record<keyof T, string> } => {
  const errors = {} as Record<keyof T, string>;
  let isValid = true;
  
  Object.keys(validators).forEach(key => {
    const validator = validators[key as keyof T];
    const value = values[key as keyof T];
    const result = validator(value);
    
    if (!result.isValid) {
      errors[key as keyof T] = result.error || 'Invalid value';
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

// Sanitize input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    default:
      return dateObj.toLocaleDateString();
  }
};

// Debounce function for input validation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for API calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
