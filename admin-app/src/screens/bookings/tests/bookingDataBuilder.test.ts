/**
 * Test cases for booking data builder
 * Tests the logic that constructs booking data matching the shared app format
 */

import { buildBookingData } from '../bookingDataBuilder';

describe('buildBookingData', () => {
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

  const mockServiceVariant = {
    id: 'variant-123',
    service_id: 'service-123',
    title: 'Standard Cleaning',
    description: 'Standard cleaning per square meter',
    price: 50,
    unitPrice: 5,
    unitMeasure: 'sqm',
    pricingType: 'per_unit' as const,
    duration: 120,
    minMeasurement: 10,
    maxMeasurement: 500,
  };

  describe('Fixed Pricing Bookings', () => {
    it('should build correct booking data for fixed pricing service', () => {
      const variant = {
        ...mockServiceVariant,
        pricingType: 'fixed' as const,
        price: 100,
        unitPrice: undefined,
        unitMeasure: undefined,
      };

      const input = {
        customer: mockCustomer,
        service: mockService,
        variant,
        quantity: '2',
        date: '2024-01-15',
        time: '14:30',
        notes: 'Test notes',
      };

      const result = buildBookingData(input);

      expect(result.service_id).toBe(variant.id);
      expect(result.booking_date).toBe('2024-01-15');
      expect(result.booking_time).toBe('14:30');
      expect(result.duration_minutes).toBe(120);
      expect(result.customer_name).toBe('John Doe');
      expect(result.customer_email).toBe('john@example.com');
      expect(result.customer_phone).toBe('+1234567890');
      expect(result.total_amount).toBe(200); // 2 * 100
      expect(result.pricing_type).toBe('fixed');
      expect(result.user_inputs).toEqual({
        quantity: 2,
        pricingType: 'fixed',
      });
      expect(result.measurement_value).toBeNull();
      expect(result.is_house_moving).toBe(false);
    });

    it('should handle decimal quantities for fixed pricing', () => {
      const variant = {
        ...mockServiceVariant,
        pricingType: 'fixed' as const,
        price: 100,
      };

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant,
        quantity: '2.5',
        date: '2024-01-15',
        time: '14:30',
      });

      expect(result.total_amount).toBe(250); // 2.5 * 100
      expect(result.user_inputs.quantity).toBe(2.5);
    });
  });

  describe('Per-Unit Pricing Bookings', () => {
    it('should build correct booking data for per-unit pricing service', () => {
      const input = {
        customer: mockCustomer,
        service: mockService,
        variant: mockServiceVariant,
        measurement: '25.5',
        date: '2024-01-15',
        time: '14:30',
        notes: 'Test notes',
      };

      const result = buildBookingData(input);

      expect(result.service_id).toBe(mockServiceVariant.id);
      expect(result.total_amount).toBe(127.5); // 25.5 * 5
      expect(result.pricing_type).toBe('per_unit');
      expect(result.user_inputs).toEqual({
        measurement: 25.5,
        unit_measure: 'sqm',
        pricingType: 'per_unit',
      });
      expect(result.measurement_value).toBe(25.5);
      expect(result.measurement_unit).toBe('sqm');
      expect(result.unit_price).toBe(5);
      expect(result.quantity).toBeUndefined();
    });

    it('should handle minimum measurement validation', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: mockServiceVariant,
        measurement: '5', // Below minimum
        date: '2024-01-15',
        time: '14:30',
      });

      // Should still build data, validation happens at form level
      expect(result.measurement_value).toBe(5);
    });
  });

  describe('House Moving Service Bookings', () => {
    const movingVariant = {
      ...mockServiceVariant,
      pricingType: 'per_unit' as const,
      price: 10,
      unitPrice: 10,
      unitMeasure: 'sqm',
    };

    it('should build correct booking data for house moving service with all fields', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: { ...mockService, title: 'House Moving' },
        variant: movingVariant,
        measurement: '50',
        distance: '25.5',
        numberOfBoxes: '10',
        date: '2024-01-15',
        time: '14:30',
      });

      expect(result.is_house_moving).toBe(true);
      expect(result.area_sqm).toBe(50);
      expect(result.distance_km).toBe(25.5);
      expect(result.number_of_boxes).toBe(10);
      expect(result.area_cost).toBe(500); // 50 * 10
      expect(result.distance_cost).toBe(12.75); // 25.5 * 0.5
      expect(result.boxes_cost).toBe(25); // 10 * 2.5
      expect(result.subtotal_before_vat).toBe(537.75);
      expect(result.vat_amount).toBe(102.17); // 19% of 537.75
      expect(result.total_amount).toBeCloseTo(639.92, 2);
      expect(result.vat_rate).toBe(0.19);
    });

    it('should handle house moving without boxes', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: { ...mockService, title: 'House Moving' },
        variant: movingVariant,
        measurement: '50',
        distance: '25.5',
        numberOfBoxes: '',
        date: '2024-01-15',
        time: '14:30',
      });

      expect(result.number_of_boxes).toBe(0);
      expect(result.boxes_cost).toBe(0);
      expect(result.subtotal_before_vat).toBe(512.75); // 500 + 12.75
    });

    it('should calculate VAT correctly for moving services', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: { ...mockService, title: 'House Moving' },
        variant: movingVariant,
        measurement: '100',
        distance: '50',
        numberOfBoxes: '20',
        date: '2024-01-15',
        time: '14:30',
      });

      const expectedSubtotal = 1000 + 25 + 50; // area + distance + boxes
      expect(result.subtotal_before_vat).toBe(expectedSubtotal);
      expect(result.vat_amount).toBeCloseTo(expectedSubtotal * 0.19, 2);
      expect(result.total_amount).toBeCloseTo(expectedSubtotal * 1.19, 2);
    });
  });

  describe('Weekly Cleaning (Multi-Day) Bookings', () => {
    const weeklyVariant = {
      ...mockServiceVariant,
      id: 'weekly-cleaning',
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
        service: { ...mockService, title: 'Weekly Cleaning' },
        variant: weeklyVariant,
        quantity: '1',
        selectedDates,
        serviceTime: new Date('2024-01-15T10:00:00'),
      });

      expect(result.is_multi_day_booking).toBe(true);
      expect(result.booking_dates).toHaveLength(3);
      expect(result.booking_dates[0]).toEqual({ date: '2024-01-15', time: '10:00' });
      expect(result.selected_dates).toEqual(selectedDates.map(d => ({ date: d.date, time: d.time })));
      expect(result.booking_date).toBe('2024-01-15');
      expect(result.booking_time).toBe('10:00');
    });

    it('should handle single date for weekly cleaning', () => {
      const selectedDates = [
        { date: '2024-01-15', time: '10:00', id: '1' },
      ];

      const result = buildBookingData({
        customer: mockCustomer,
        service: { ...mockService, title: 'Weekly Cleaning' },
        variant: weeklyVariant,
        quantity: '1',
        selectedDates,
        serviceTime: new Date('2024-01-15T10:00:00'),
      });

      expect(result.is_multi_day_booking).toBe(false);
      expect(result.booking_dates).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing customer phone', () => {
      const customerWithoutPhone = {
        ...mockCustomer,
        phone: undefined,
      };

      const result = buildBookingData({
        customer: customerWithoutPhone,
        service: mockService,
        variant: mockServiceVariant,
        measurement: '25',
        date: '2024-01-15',
        time: '14:30',
      });

      expect(result.customer_phone).toBeUndefined();
    });

    it('should handle missing notes', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: mockServiceVariant,
        measurement: '25',
        date: '2024-01-15',
        time: '14:30',
      });

      expect(result.special_instructions).toBeNull();
    });

    it('should handle empty quantity string', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: { ...mockServiceVariant, pricingType: 'fixed' as const },
        quantity: '',
        date: '2024-01-15',
        time: '14:30',
      });

      // Should default to 1
      expect(result.total_amount).toBe(mockServiceVariant.price || 0);
      expect(result.user_inputs.quantity).toBe(1);
    });

    it('should handle empty measurement string', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: mockServiceVariant,
        measurement: '',
        date: '2024-01-15',
        time: '14:30',
      });

      expect(result.measurement_value).toBeNull();
      expect(result.total_amount).toBe(0);
    });

    it('should handle variant without duration', () => {
      const variantWithoutDuration = {
        ...mockServiceVariant,
        duration: undefined,
      };

      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: variantWithoutDuration,
        measurement: '25',
        date: '2024-01-15',
        time: '14:30',
      });

      // Should default to 120 minutes (2 hours)
      expect(result.duration_minutes).toBe(120);
    });
  });

  describe('Service Address', () => {
    it('should require service address for booking', () => {
      expect(() => {
        buildBookingData({
          customer: mockCustomer,
          service: mockService,
          variant: mockServiceVariant,
          measurement: '25',
          date: '2024-01-15',
          time: '14:30',
          serviceAddress: '', // Empty address
        });
      }).toThrow('Service address is required');
    });

    it('should include service address in booking data', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: mockServiceVariant,
        measurement: '25',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St, Berlin, 10115, Germany',
      });

      expect(result.service_address).toBe('123 Main St, Berlin, 10115, Germany');
    });
  });

  describe('Data Structure Validation', () => {
    it('should include all required fields for standard booking', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: mockServiceVariant,
        measurement: '25',
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
      expect(result).toHaveProperty('booking_type');
      expect(result).toHaveProperty('is_house_moving');
      expect(result).toHaveProperty('is_multi_day_booking');

      // Optional fields
      expect(result).toHaveProperty('special_instructions');
      expect(result).toHaveProperty('customer_phone');
    });

    it('should match CreateServiceBookingData interface structure', () => {
      const result = buildBookingData({
        customer: mockCustomer,
        service: mockService,
        variant: mockServiceVariant,
        measurement: '25',
        date: '2024-01-15',
        time: '14:30',
        serviceAddress: '123 Main St',
      });

      // Verify structure matches shared app's CreateServiceBookingData
      expect(typeof result.service_id).toBe('string');
      expect(typeof result.booking_date).toBe('string');
      expect(typeof result.booking_time).toBe('string');
      expect(typeof result.duration_minutes).toBe('number');
      expect(typeof result.customer_name).toBe('string');
      expect(typeof result.customer_email).toBe('string');
      expect(typeof result.service_address).toBe('string');
      expect(typeof result.total_amount).toBe('number');
      expect(Array.isArray(result.booking_dates) || result.booking_dates === undefined).toBe(true);
      expect(typeof result.user_inputs).toBe('object');
    });
  });
});

