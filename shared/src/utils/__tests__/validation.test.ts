/**
 * Validation Utilities Tests
 */

import {
  validateEmail,
  validatePassword,
  validateName,
  validateAddress,
  validateMeasurement,
  validateDate,
  validateTime,
  formatPhoneNumber,
  formatCurrency,
  formatDate,
  debounce,
  throttle,
} from '../validation';

describe('validateEmail', () => {
  it('validates correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.org')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('test.example.com')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('validates strong passwords', () => {
    const result = validatePassword('Password123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects weak passwords', () => {
    const result = validatePassword('123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 6 characters long');
  });

  it('rejects passwords without uppercase letters', () => {
    const result = validatePassword('password123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('rejects passwords without lowercase letters', () => {
    const result = validatePassword('PASSWORD123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('rejects passwords without numbers', () => {
    const result = validatePassword('Password');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('rejects passwords that are too long', () => {
    const longPassword = 'A'.repeat(129);
    const result = validatePassword(longPassword);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be less than 128 characters');
  });
});

describe('validateName', () => {
  it('validates correct names', () => {
    expect(validateName('John')).toEqual({ isValid: true });
    expect(validateName('Mary-Jane')).toEqual({ isValid: true });
    expect(validateName("O'Connor")).toEqual({ isValid: true });
  });

  it('rejects empty names', () => {
    expect(validateName('')).toEqual({ 
      isValid: false, 
      error: 'Name is required' 
    });
  });

  it('rejects names that are too short', () => {
    expect(validateName('A')).toEqual({ 
      isValid: false, 
      error: 'Name must be at least 2 characters long' 
    });
  });

  it('rejects names that are too long', () => {
    const longName = 'A'.repeat(51);
    expect(validateName(longName)).toEqual({ 
      isValid: false, 
      error: 'Name must be less than 50 characters' 
    });
  });

  it('rejects names with invalid characters', () => {
    expect(validateName('John123')).toEqual({ 
      isValid: false, 
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
    });
  });
});

describe('validateAddress', () => {
  it('validates correct addresses', () => {
    expect(validateAddress('123 Main St, City, State 12345')).toEqual({ isValid: true });
  });

  it('rejects empty addresses', () => {
    expect(validateAddress('')).toEqual({ 
      isValid: false, 
      error: 'Address is required' 
    });
  });

  it('rejects addresses that are too short', () => {
    expect(validateAddress('123 Main')).toEqual({ 
      isValid: false, 
      error: 'Address must be at least 10 characters long' 
    });
  });

  it('rejects addresses that are too long', () => {
    const longAddress = 'A'.repeat(201);
    expect(validateAddress(longAddress)).toEqual({ 
      isValid: false, 
      error: 'Address must be less than 200 characters' 
    });
  });
});

describe('validateMeasurement', () => {
  it('validates correct measurements', () => {
    expect(validateMeasurement('10.5')).toEqual({ 
      isValid: true, 
      numericValue: 10.5 
    });
  });

  it('rejects empty measurements', () => {
    expect(validateMeasurement('')).toEqual({ 
      isValid: false, 
      error: 'Measurement is required' 
    });
  });

  it('rejects non-numeric measurements', () => {
    expect(validateMeasurement('abc')).toEqual({ 
      isValid: false, 
      error: 'Please enter a valid number' 
    });
  });

  it('rejects negative measurements', () => {
    expect(validateMeasurement('-5')).toEqual({ 
      isValid: false, 
      error: 'Measurement must be greater than 0' 
    });
  });

  it('validates minimum measurement', () => {
    expect(validateMeasurement('5', 10)).toEqual({ 
      isValid: false, 
      error: 'Minimum measurement is 10' 
    });
  });

  it('validates maximum measurement', () => {
    expect(validateMeasurement('15', 5, 10)).toEqual({ 
      isValid: false, 
      error: 'Maximum measurement is 10' 
    });
  });

  it('validates step increments', () => {
    expect(validateMeasurement('7.5', 0, 100, 5)).toEqual({ 
      isValid: false, 
      error: 'Measurement must be in increments of 5' 
    });
  });
});

describe('validateDate', () => {
  it('validates future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    expect(validateDate(dateString)).toEqual({ isValid: true });
  });

  it('rejects past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];
    
    expect(validateDate(dateString)).toEqual({ 
      isValid: false, 
      error: 'Date cannot be in the past' 
    });
  });

  it('rejects invalid date formats', () => {
    expect(validateDate('invalid-date')).toEqual({ 
      isValid: false, 
      error: 'Please enter a valid date' 
    });
  });

  it('rejects empty dates', () => {
    expect(validateDate('')).toEqual({ 
      isValid: false, 
      error: 'Date is required' 
    });
  });
});

describe('validateTime', () => {
  it('validates correct time formats', () => {
    expect(validateTime('10:30')).toEqual({ isValid: true });
    expect(validateTime('23:59')).toEqual({ isValid: true });
  });

  it('rejects invalid time formats', () => {
    expect(validateTime('25:00')).toEqual({ 
      isValid: false, 
      error: 'Please enter a valid time (HH:MM format)' 
    });
    expect(validateTime('10:60')).toEqual({ 
      isValid: false, 
      error: 'Please enter a valid time (HH:MM format)' 
    });
  });

  it('rejects empty times', () => {
    expect(validateTime('')).toEqual({ 
      isValid: false, 
      error: 'Time is required' 
    });
  });
});

describe('formatPhoneNumber', () => {
  it('formats 10-digit numbers', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
  });

  it('formats 11-digit numbers with country code', () => {
    expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
  });

  it('returns original for other formats', () => {
    expect(formatPhoneNumber('123-456-7890')).toBe('123-456-7890');
  });
});

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(123.45)).toBe('$123.45');
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });

  it('formats with custom currency', () => {
    expect(formatCurrency(123.45, 'EUR')).toBe('€123.45');
  });
});

describe('formatDate', () => {
  it('formats dates correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date, 'short')).toContain('Jan 15, 2024');
    expect(formatDate(date, 'long')).toContain('Monday, January 15, 2024');
    expect(formatDate(date, 'time')).toContain('12:00 AM');
  });
});

describe('debounce', () => {
  it('debounces function calls', (done) => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);
    
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
      done();
    }, 150);
  });
});

describe('throttle', () => {
  it('throttles function calls', (done) => {
    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 100);
    
    throttledFn();
    throttledFn();
    throttledFn();
    
    setTimeout(() => {
      expect(mockFn).toHaveBeenCalledTimes(1);
      done();
    }, 50);
  });
});
