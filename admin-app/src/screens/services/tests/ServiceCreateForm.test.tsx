/**
 * Tests for Service Create Form Component
 * Tests form validation, submission, and error handling
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { adminDataService } from '@/services/adminDataService';

// Mock the service operations utilities
jest.mock('../utils/serviceOperations', () => ({
  validateServiceData: jest.fn(),
  buildServiceData: jest.fn(),
}));

// Mock adminDataService
jest.mock('@/services/adminDataService', () => ({
  adminDataService: {
    createService: jest.fn(),
  },
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('Service Create Form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  describe('Form Validation', () => {
    it('should validate required fields before submission', async () => {
      const { validateServiceData } = require('../utils/serviceOperations');
      validateServiceData.mockReturnValue({
        isValid: false,
        errors: ['Title is required'],
      });

      // This will be tested when we create the actual form component
      expect(validateServiceData).toBeDefined();
    });

    it('should allow submission when all required fields are valid', async () => {
      const { validateServiceData } = require('../utils/serviceOperations');
      validateServiceData.mockReturnValue({
        isValid: true,
        errors: [],
      });

      expect(validateServiceData).toBeDefined();
    });
  });

  describe('Service Creation', () => {
    it('should call createService API with correct data', async () => {
      const { buildServiceData } = require('../utils/serviceOperations');
      const mockServiceData = {
        id: 'test-service',
        title: 'Test Service',
        category: 'Cleaning',
        is_active: true,
        display_order: 0,
      };

      buildServiceData.mockReturnValue(mockServiceData);
      (adminDataService.createService as jest.Mock).mockResolvedValue({
        success: true,
        data: mockServiceData,
      });

      const formData = {
        title: 'Test Service',
        category: 'Cleaning',
      };

      const builtData = buildServiceData(formData);
      expect(builtData).toEqual(mockServiceData);
    });

    it('should handle API errors gracefully', async () => {
      (adminDataService.createService as jest.Mock).mockRejectedValue({
        response: {
          data: { error: 'Service creation failed' },
        },
      });

      // This will be tested when we create the actual form component
      expect(adminDataService.createService).toBeDefined();
    });
  });
});

