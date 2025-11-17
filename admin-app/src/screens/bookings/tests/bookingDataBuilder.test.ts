/**
 * Comprehensive tests for booking data builder
 * Tests all pricing types, edge cases, and data validation
 */

import { buildBookingData } from '../utils/bookingDataBuilder';

describe('buildBookingData - Comprehensive Tests', () => {
  const mockCustomer = {
    id: 'customer-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
  };

  const mockService = {
    id: 'service-123',
    title: 'Normal Cleaning',
    category: 'Cleaning',
  };

  const baseVariant = {
    id: 'variant-123',
    service_id: 'service-123',
    title: 'Standard Cleaning',
    description: 'Standard cleaning per square meter',
    price: 50,
    duration: 120,
  };

  describe('Fixed Pricing Bookings', () => {
    const fixedVariant = {
      ...baseVariant,
      pricingType: 'fixed' as const,
      price: 100,
    };

    it('should build correct booking data for fixed pricing with quantity 1', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: fixedVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.service_id).toBe(fixedVariant.id);
      expect(result.booking_date).toBe('2024-01-15');
      expect(result.booking_time).toBe('14:30');
      expect(result.duration_minutes).toBe(120);
      expect(result.customer_name).toBe('John Doe');
      expect(result.customer_email).toBe('john@example.com');
      expect(result.customer_phone).toBe('+1234567890');
      expect(result.total_amount).toBe(100);
      expect(result.pricing_type).toBe('fixed');
      expect(result.user_inputs.quantity).toBe(1);
      expect(result.user_inputs.pricingType).toBe('fixed');
      expect(result.is_house_moving).toBe(false);
      expect(result.is_multi_day_booking).toBe(false);
    });

    it('should calculate total correctly for multiple quantities', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: fixedVariant,
        quantity: '3',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.total_amount).toBe(300);
      expect(result.user_inputs.quantity).toBe(3);
    });

    it('should handle decimal quantities', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: fixedVariant,
        quantity: '2.5',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.total_amount).toBe(250);
      expect(result.user_inputs.quantity).toBe(2.5);
    });

    it('should default to quantity 1 when empty string provided', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: fixedVariant,
        quantity: '',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.total_amount).toBe(100);
      expect(result.user_inputs.quantity).toBe(1);
    });

    it('should handle zero quantity gracefully', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: fixedVariant,
        quantity: '0',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.total_amount).toBe(0);
      expect(result.user_inputs.quantity).toBe(0);
    });
  });

  describe('Per-Unit Pricing Bookings', () => {
    const perUnitVariant = {
      ...baseVariant,
      pricingType: 'per_unit' as const,
      price: 50,
      unitPrice: 5,
      unitMeasure: 'sqm',
      minMeasurement: 10,
      maxMeasurement: 500,
    };

    it('should build correct booking data for per-unit pricing', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: perUnitVariant,
        measurement: '25.5',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.service_id).toBe(perUnitVariant.id);
      expect(result.total_amount).toBe(127.5); // 25.5 * 5
      expect(result.pricing_type).toBe('per_unit');
      expect(result.user_inputs.measurement).toBe(25.5);
      expect(result.user_inputs.unit_measure).toBe('sqm');
      expect(result.measurement_value).toBe(25.5);
      expect(result.measurement_unit).toBe('sqm');
      expect(result.unit_price).toBe(5);
      expect(result.is_house_moving).toBe(false);
    });

    it('should handle minimum measurement', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: perUnitVariant,
        measurement: '5', // Below minimum
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.measurement_value).toBe(5);
      expect(result.total_amount).toBe(25);
    });

    it('should handle maximum measurement', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: perUnitVariant,
        measurement: '600', // Above maximum
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.measurement_value).toBe(600);
      expect(result.total_amount).toBe(3000);
    });

    it('should handle empty measurement string', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: perUnitVariant,
        measurement: '',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.measurement_value).toBeNull();
      expect(result.total_amount).toBe(0);
    });

    it('should infer per_unit pricing from unitPrice and unitMeasure', () => {
      const variantWithoutPricingType = {
        ...baseVariant,
        unitPrice: 10,
        unitMeasure: 'items',
        // No pricingType specified
      };

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: variantWithoutPricingType,
        measurement: '20',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.pricing_type).toBe('per_unit');
      expect(result.total_amount).toBe(200);
    });
  });

  describe('House Moving Service Bookings', () => {
    const movingService = {
      ...mockService,
      title: 'House Moving',
      category: 'Moving',
    };

    const movingVariant = {
      ...baseVariant,
      id: 'moving-variant-1',
      title: 'House Moving Service',
      pricingType: 'per_unit' as const,
      price: 10,
      unitPrice: 10,
      unitMeasure: 'sqm',
    };

    it('should build correct booking data for house moving with all fields', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: movingService,
        variant: movingVariant,
        measurement: '50',
        distance: '25.5',
        numberOfBoxes: '10',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.is_house_moving).toBe(true);
      expect(result.area_sqm).toBe(50);
      expect(result.distance_km).toBe(25.5);
      expect(result.number_of_boxes).toBe(10);
      expect(result.area_cost).toBe(500); // 50 * 10
      expect(result.distance_cost).toBe(12.75); // 25.5 * 0.5
      expect(result.boxes_cost).toBe(25); // 10 * 2.5
      expect(result.subtotal_before_vat).toBe(537.75);
      expect(result.vat_amount).toBeCloseTo(102.17, 2);
      expect(result.total_amount).toBeCloseTo(639.92, 2);
      expect(result.vat_rate).toBe(0.19);
      expect(result.moving_service_data).toBeTruthy();
      expect(result.cost_breakdown).toBeTruthy();
    });

    it('should handle house moving without boxes', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: movingService,
        variant: movingVariant,
        measurement: '50',
        distance: '25.5',
        numberOfBoxes: '',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.number_of_boxes).toBe(0);
      expect(result.boxes_cost).toBe(0);
      expect(result.subtotal_before_vat).toBe(512.75);
      expect(result.vat_amount).toBeCloseTo(97.42, 2);
      expect(result.total_amount).toBeCloseTo(610.17, 2);
    });

    it('should handle house moving with fixed pricing', () => {
      const fixedMovingVariant = {
        ...movingVariant,
        pricingType: 'fixed' as const,
        price: 500,
      };
      // Remove optional properties for fixed pricing
      delete (fixedMovingVariant as any).unitPrice;
      delete (fixedMovingVariant as any).unitMeasure;

      const result = buildBookingData({
        customer: mockCustomer,
        service: movingService,
        variant: fixedMovingVariant,
        quantity: '1',
        distance: '30',
        numberOfBoxes: '5',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.area_sqm).toBe(1); // quantity used as area
      expect(result.area_cost).toBe(500);
      expect(result.distance_cost).toBe(15); // 30 * 0.5
      expect(result.boxes_cost).toBe(12.5); // 5 * 2.5
      expect(result.subtotal_before_vat).toBe(527.5);
    });

    it('should detect house moving from service title', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: { ...mockService, title: 'House Moving Service' },
        variant: movingVariant,
        measurement: '50',
        distance: '25',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.is_house_moving).toBe(true);
    });

    it('should detect house moving from variant title', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: { ...movingVariant, title: 'Moving Service' },
        measurement: '50',
        distance: '25',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.is_house_moving).toBe(true);
    });

    it('should detect house moving from category', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: { ...mockService, category: 'Moving' },
        variant: movingVariant,
        measurement: '50',
        distance: '25',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.is_house_moving).toBe(true);
    });
  });

  describe('Weekly Cleaning (Multi-Day) Bookings', () => {
    const weeklyVariant = {
      ...baseVariant,
      id: 'weekly-cleaning',
      title: 'Weekly Cleaning',
    };

    const weeklyService = {
      ...mockService,
      title: 'Weekly Cleaning',
    };

    it('should build correct booking data for weekly cleaning with multiple dates', () => {
      const selectedDates = [
        { date: '2024-01-15', time: '10:00', id: '1' },
        { date: '2024-01-22', time: '10:00', id: '2' },
        { date: '2024-01-29', time: '10:00', id: '3' },
      ];

      const result = buildBookingData({
        customer: mockCustomer,
        service: weeklyService,
        variant: weeklyVariant,
        quantity: '1',
        selectedDates,
        serviceTime: new Date('2024-01-15T10:00:00'),
        serviceAddress: '123 Main St',
      });

      expect(result.is_multi_day_booking).toBe(true);
      expect(result.booking_dates).toHaveLength(3);
      expect(result.booking_dates![0]).toEqual({ date: '2024-01-15', time: '10:00' });
      expect(result.booking_dates![1]).toEqual({ date: '2024-01-22', time: '10:00' });
      expect(result.booking_dates![2]).toEqual({ date: '2024-01-29', time: '10:00' });
      expect(result.selected_dates).toEqual([
        { date: '2024-01-15', time: '10:00' },
        { date: '2024-01-22', time: '10:00' },
        { date: '2024-01-29', time: '10:00' },
      ]);
      expect(result.booking_date).toBe('2024-01-15');
      expect(result.booking_time).toBe('10:00');
    });

    it('should handle single date for weekly cleaning (not multi-day)', () => {
      const selectedDates = [
        { date: '2024-01-15', time: '10:00', id: '1' },
      ];

      const result = buildBookingData({
        customer: mockCustomer,
        service: weeklyService,
        variant: weeklyVariant,
        quantity: '1',
        selectedDates,
        serviceTime: new Date('2024-01-15T10:00:00'),
        serviceAddress: '123 Main St',
      });

      expect(result.is_multi_day_booking).toBe(false);
      expect(result.booking_dates).toHaveLength(1);
    });

    it('should fallback to date/time when selectedDates is empty', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: weeklyService,
        variant: weeklyVariant,
        quantity: '1',
        selectedDates: [],
        date: '2024-01-15',
        time: '10:00',
        serviceAddress: '123 Main St',
      });

      expect(result.booking_date).toBe('2024-01-15');
      expect(result.booking_time).toBe('10:00');
      expect(result.booking_dates).toEqual([]);
    });
  });

  describe('Duration Parsing', () => {
    it('should parse numeric duration in minutes', () => {
      const variant = {
        ...baseVariant,
        duration: 180,
      };

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.duration_minutes).toBe(180);
      expect(result.service_duration_hours).toBe(3);
    });

    it('should parse duration string "4 hours"', () => {
      const variant = {
        ...baseVariant,
        duration: '4 hours' as any,
      };

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.service_duration_hours).toBe(4);
      expect(result.duration_minutes).toBe(240);
    });

    it('should parse duration string "120 minutes"', () => {
      const variant = {
        ...baseVariant,
        duration: '120 minutes' as any,
      };

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.service_duration_hours).toBe(2);
      expect(result.duration_minutes).toBe(120);
    });

    it('should parse duration range "4-6 hours"', () => {
      const variant = {
        ...baseVariant,
        duration: '4-6 hours' as any,
      };

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.service_duration_hours).toBe(5); // Average of 4 and 6
      expect(result.duration_minutes).toBe(300);
    });

    it('should default to 2 hours when duration is missing', () => {
      const variant = {
        ...baseVariant,
      };
      // Remove duration property instead of setting to undefined
      delete (variant as any).duration;

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.service_duration_hours).toBe(2);
      expect(result.duration_minutes).toBe(120);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should require service address', () => {
      expect(() => {
        buildBookingData({
          customer: mockCustomer,
          service: mockService,
          variant: baseVariant,
          quantity: '1',
          date: '2024-01-15',
          time: '14:30',
          serviceAddress: '',
        });
      }).toThrow('Service address is required');
    });

    it('should require service address (whitespace only)', () => {
      expect(() => {
        buildBookingData({
          customer: mockCustomer,
          service: mockService,
          variant: baseVariant,
          quantity: '1',
          date: '2024-01-15',
          time: '14:30',
          serviceAddress: '   ',
        });
      }).toThrow('Service address is required');
    });

    it('should handle missing customer phone', () => {
      const customerWithoutPhone = {
        id: mockCustomer.id,
        name: mockCustomer.name,
        email: mockCustomer.email,
        // phone is optional, don't include it
      };

      const result = buildBookingData({
        customer: customerWithoutPhone,
        service: mockService,
        variant: baseVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.customer_phone).toBeUndefined();
    });

    it('should handle missing notes', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: baseVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.special_instructions).toBeNull();
    });

    it('should include notes when provided', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: baseVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
        notes: 'Please call before arrival',
      });

      expect(result.special_instructions).toBe('Please call before arrival');
    });

    it('should include user_id from customer', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: baseVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect((result as any).user_id).toBe('customer-123');
    });
  });

  describe('Data Structure Validation', () => {
    it('should include all required fields', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: baseVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
        notes: 'Test',
      });

      // Required fields
      expect(result).toHaveProperty('service_id');
      expect(result).toHaveProperty('booking_date');
      expect(result).toHaveProperty('booking_time');
      expect(result).toHaveProperty('duration_minutes');
      expect(result).toHaveProperty('customer_name');
      expect(result).toHaveProperty('customer_email');
      expect(result).toHaveProperty('service_address');
      expect(result).toHaveProperty('total_amount');
      expect(result).toHaveProperty('payment_method');
      expect(result).toHaveProperty('pricing_type');
      expect(result).toHaveProperty('user_inputs');
      expect(result).toHaveProperty('service_variant_data');
      expect(result).toHaveProperty('booking_type');
      expect(result).toHaveProperty('is_house_moving');
      expect(result).toHaveProperty('is_multi_day_booking');
    });

    it('should include service_variant_data with correct structure', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: baseVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.service_variant_data).toEqual({
        id: baseVariant.id,
        title: baseVariant.title,
        description: baseVariant.description,
        price: baseVariant.price,
        unitPrice: undefined,
        unitMeasure: undefined,
        pricingType: 'fixed',
        duration: baseVariant.duration,
      });
    });

    it('should set payment_method to pending', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: baseVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.payment_method).toBe('pending');
    });

    it('should set booking_type to standard', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: baseVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.booking_type).toBe('standard');
    });
  });

  describe('Price Calculation Edge Cases', () => {
    it('should handle zero price variant', () => {
      const zeroPriceVariant = {
        ...baseVariant,
        price: 0,
      };

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: zeroPriceVariant,
        quantity: '5',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.total_amount).toBe(0);
    });

    it('should handle missing price with fallback to 0', () => {
      const noPriceVariant = {
        ...baseVariant,
      };
      // Remove price property instead of setting to undefined
      delete (noPriceVariant as any).price;

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: noPriceVariant,
        quantity: '1',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.total_amount).toBe(0);
    });

    it('should handle very large quantities', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: { ...baseVariant, price: 100 },
        quantity: '1000',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.total_amount).toBe(100000);
    });

    it('should handle very large measurements', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: {
          ...baseVariant,
          unitPrice: 10,
          unitMeasure: 'sqm',
        },
        measurement: '10000',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      expect(result.total_amount).toBe(100000);
    });
  });
});
