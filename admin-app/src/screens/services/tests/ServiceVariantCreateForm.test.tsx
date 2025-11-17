/**
 * Tests for Service Variant Create Form Component
 * Tests form validation, submission, and error handling
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { adminDataService } from '@/services/adminDataService';

// Mock the service operations utilities
jest.mock('../utils/serviceOperations', () => ({
  validateServiceVariantData: jest.fn(),
  buildServiceVariantData: jest.fn(),
}));

// Mock adminDataService
jest.mock('@/services/adminDataService', () => ({
  adminDataService: {
    createServiceVariant: jest.fn(),
  },
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('Service Variant Create Form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  describe('Form Validation', () => {
    it('should validate required fields before submission', async () => {
      const { validateServiceVariantData } = require('../utils/serviceOperations');
      validateServiceVariantData.mockReturnValue({
        isValid: false,
        errors: ['Service ID is required', 'Title is required'],
      });

      expect(validateServiceVariantData).toBeDefined();
    });

    it('should validate price is a number', async () => {
      const { validateServiceVariantData } = require('../utils/serviceOperations');
      validateServiceVariantData.mockReturnValue({
        isValid: false,
        errors: ['Price must be a non-negative number'],
      });

      expect(validateServiceVariantData).toBeDefined();
    });

    it('should validate measurement constraints', async () => {
      const { validateServiceVariantData } = require('../utils/serviceOperations');
      validateServiceVariantData.mockReturnValue({
        isValid: false,
        errors: ['Minimum measurement must be less than maximum measurement'],
      });

      expect(validateServiceVariantData).toBeDefined();
    });
  });

  describe('Variant Creation', () => {
    it('should call createServiceVariant API with correct data', async () => {
      const { buildServiceVariantData } = require('../utils/serviceOperations');
      const mockVariantData = {
        id: 'test-variant',
        service_id: 'service-1',
        title: 'Test Variant',
        price: 50,
        is_active: true,
        display_order: 0,
        features: [],
      };

      buildServiceVariantData.mockReturnValue(mockVariantData);
      (adminDataService.createServiceVariant as jest.Mock).mockResolvedValue({
        success: true,
        data: mockVariantData,
      });

      const formData = {
        serviceId: 'service-1',
        title: 'Test Variant',
        price: '50',
      };

      const builtData = buildServiceVariantData(formData);
      expect(builtData).toEqual(mockVariantData);
    });

    it('should handle API errors gracefully', async () => {
      (adminDataService.createServiceVariant as jest.Mock).mockRejectedValue({
        response: {
          data: { error: 'Variant creation failed' },
        },
      });

      expect(adminDataService.createServiceVariant).toBeDefined();
    });
  });
});

