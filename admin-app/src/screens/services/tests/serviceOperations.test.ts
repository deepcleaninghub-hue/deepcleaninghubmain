/**
 * Tests for service operations (create, update, delete)
 * Tests the utility functions for service management
 */

import { validateServiceData, validateServiceVariantData, buildServiceData, buildServiceVariantData } from '../utils/serviceOperations';

describe('Service Operations - Validation', () => {
    describe('validateServiceData', () => {
        it('should validate required fields', () => {
            const result = validateServiceData({
                title: '',
                category: 'Cleaning',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Title is required');
        });

        it('should validate title is not empty', () => {
            const result = validateServiceData({
                title: '   ',
                category: 'Cleaning',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Title is required');
        });

        it('should validate category is required', () => {
            const result = validateServiceData({
                title: 'Test Service',
                category: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Category is required');
        });

        it('should pass validation for valid service data', () => {
            const result = validateServiceData({
                title: 'Test Service',
                category: 'Cleaning',
                description: 'Test description',
            });

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate display order is a number', () => {
            const result = validateServiceData({
                title: 'Test Service',
                category: 'Cleaning',
                displayOrder: 'not-a-number',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('Display order'))).toBe(true);
        });
    });

    describe('validateServiceVariantData', () => {
        it('should validate required fields', () => {
            const result = validateServiceVariantData({
                serviceId: '',
                title: 'Test Variant',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Service ID is required');
        });

        it('should validate title is required', () => {
            const result = validateServiceVariantData({
                serviceId: 'service-1',
                title: '',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Title is required');
        });

        it('should validate price is a number when provided', () => {
            const result = validateServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
                price: 'not-a-number',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('Price'))).toBe(true);
        });

        it('should validate unit price is a number when provided', () => {
            const result = validateServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
                unitPrice: 'invalid',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('Unit price'))).toBe(true);
        });

        it('should validate min measurement is less than max measurement', () => {
            const result = validateServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
                minMeasurement: '100',
                maxMeasurement: '50',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('minimum') || e.includes('maximum'))).toBe(true);
        });

        it('should pass validation for valid variant data', () => {
            const result = validateServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
                description: 'Test description',
                price: '50',
                duration: '120',
            });

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
});

describe('Service Operations - Data Building', () => {
    describe('buildServiceData', () => {
        it('should build service data with required fields', () => {
            const result = buildServiceData({
                title: 'Test Service',
                category: 'Cleaning',
            });

            expect(result.title).toBe('Test Service');
            expect(result.category).toBe('Cleaning');
            expect(result.is_active).toBe(true);
        });

        it('should include optional fields when provided', () => {
            const result = buildServiceData({
                title: 'Test Service',
                category: 'Cleaning',
                description: 'Test description',
                imageUrl: 'https://example.com/image.jpg',
                pricingType: 'per_unit',
                unitMeasure: 'sqm',
                displayOrder: '5',
            });

            expect(result.description).toBe('Test description');
            expect(result.image_url).toBe('https://example.com/image.jpg');
            expect(result.pricing_type).toBe('per_unit');
            expect(result.unit_measure).toBe('sqm');
            expect(result.display_order).toBe(5);
        });

        it('should generate ID if not provided', () => {
            const result = buildServiceData({
                title: 'Test Service',
                category: 'Cleaning',
            });

            expect(result.id).toBeTruthy();
            expect(typeof result.id).toBe('string');
        });

        it('should use provided ID if given', () => {
            const customId = 'custom-service-id';
            const result = buildServiceData({
                id: customId,
                title: 'Test Service',
                category: 'Cleaning',
            });

            expect(result.id).toBe(customId);
        });

        it('should default display_order to 0', () => {
            const result = buildServiceData({
                title: 'Test Service',
                category: 'Cleaning',
            });

            expect(result.display_order).toBe(0);
        });
    });

    describe('buildServiceVariantData', () => {
        it('should build variant data with required fields', () => {
            const result = buildServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
            });

            expect(result.service_id).toBe('service-1');
            expect(result.title).toBe('Test Variant');
            expect(result.is_active).toBe(true);
        });

        it('should include optional fields when provided', () => {
            const result = buildServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
                description: 'Test description',
                price: '50',
                unitPrice: '5',
                unitMeasure: 'sqm',
                duration: '120',
                pricingType: 'per_unit',
                minMeasurement: '10',
                maxMeasurement: '100',
                measurementStep: '5',
                measurementPlaceholder: 'Enter area',
                displayOrder: '3',
            });

            expect(result.description).toBe('Test description');
            expect(result.price).toBe(50);
            expect(result.unit_price).toBe(5);
            expect(result.unit_measure).toBe('sqm');
            expect(result.duration).toBe(120);
            expect(result.pricing_type).toBe('per_unit');
            expect(result.min_measurement).toBe(10);
            expect(result.max_measurement).toBe(100);
            expect(result.measurement_step).toBe(5);
            expect(result.measurement_placeholder).toBe('Enter area');
            expect(result.display_order).toBe(3);
        });

        it('should handle features array', () => {
            const features = ['Feature 1', 'Feature 2'];
            const result = buildServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
                features,
            });

            expect(result.features).toEqual(features);
        });

        it('should default features to empty array', () => {
            const result = buildServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
            });

            expect(result.features).toEqual([]);
        });

        it('should generate ID if not provided', () => {
            const result = buildServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
            });

            expect(result.id).toBeTruthy();
            expect(typeof result.id).toBe('string');
        });

        it('should default display_order to 0', () => {
            const result = buildServiceVariantData({
                serviceId: 'service-1',
                title: 'Test Variant',
            });

            expect(result.display_order).toBe(0);
        });
    });
});

