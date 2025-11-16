/**
 * Booking Data Builder
 * Constructs booking data matching the shared app's format for creating service bookings
 */

import { BookingDate } from '../../../../shared/src/types';

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface Service {
    id: string;
    title: string;
    category: string;
}

export interface ServiceVariant {
    id: string;
    service_id: string;
    title: string;
    description?: string;
    price?: number;
    unitPrice?: number;
    unitMeasure?: string;
    pricingType?: 'fixed' | 'per_unit' | 'hourly';
    duration?: number;
    minMeasurement?: number;
    maxMeasurement?: number;
}

export interface BuildBookingDataInput {
    customer: Customer;
    service: Service;
    variant: ServiceVariant;
    // For fixed pricing
    quantity?: string;
    // For per-unit pricing
    measurement?: string;
    // For house moving services
    distance?: string;
    numberOfBoxes?: string;
    // Date/time
    date?: string;
    time?: string;
    selectedDates?: BookingDate[];
    serviceTime?: Date;
    // Additional
    serviceAddress: string;
    notes?: string;
}

export interface CreateServiceBookingData {
    service_id: string;
    booking_date: string;
    booking_time: string;
    booking_dates?: Array<{ date: string; time: string }>;
    duration_minutes: number;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    service_address: string;
    special_instructions?: string | null;
    total_amount: number;
    payment_method?: string;
    user_inputs?: any;
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

/**
 * Calculate house moving cost breakdown
 */
function calculateHouseMovingCost(
    area: number,
    distance: number,
    rate: number,
    boxes: number = 0
): {
    areaCost: number;
    distanceCost: number;
    boxesCost: number;
    subtotal: number;
    vat: number;
    total: number;
} {
    const RATE_PER_KM = 0.5;
    const BOX_PRICE = 2.5;
    const VAT_RATE = 0.19;

    const areaCost = area * rate;
    const distanceCost = distance * RATE_PER_KM;
    const boxesCost = boxes * BOX_PRICE;
    const subtotal = areaCost + distanceCost + boxesCost;
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;

    return {
        areaCost,
        distanceCost,
        boxesCost,
        subtotal,
        vat,
        total,
    };
}

/**
 * Determine pricing type from variant
 */
function getPricingType(variant: ServiceVariant): 'fixed' | 'per_unit' | 'hourly' {
    if (variant.pricingType) {
        return variant.pricingType;
    }
    if (variant.unitPrice || variant.unitMeasure) {
        return 'per_unit';
    }
    return 'fixed';
}

/**
 * Check if service is house moving
 */
function isHouseMovingService(service: Service, variant: ServiceVariant): boolean {
    return (
        service.title.toLowerCase().includes('moving') ||
        service.title.toLowerCase().includes('house') ||
        service.category.toLowerCase().includes('moving') ||
        variant.title.toLowerCase().includes('moving') ||
        variant.title.toLowerCase().includes('house')
    );
}

/**
 * Build booking data matching the shared app's format
 */
export function buildBookingData(input: BuildBookingDataInput): CreateServiceBookingData {
    const {
        customer,
        service,
        variant,
        quantity = '1',
        measurement = '',
        distance = '',
        numberOfBoxes = '',
        date = '',
        time = '',
        selectedDates = [],
        serviceTime,
        serviceAddress,
        notes,
    } = input;

    // Validate required fields
    if (!serviceAddress || serviceAddress.trim() === '') {
        throw new Error('Service address is required');
    }

    // Determine pricing type
    const pricingType = getPricingType(variant);
    const isHouseMoving = isHouseMovingService(service, variant);

    // Check if multi-day booking (weekly cleaning)
    const isMultiDay = selectedDates.length > 1;
    const hasSelectedDates = selectedDates.length > 0;

    // Prepare dates
    let bookingDate = date;
    let bookingTime = time;
    let bookingDates: Array<{ date: string; time: string }> = [];

    if (hasSelectedDates) {
        // Use selected dates for multi-day or weekly cleaning
        bookingDates = selectedDates.map((d) => ({
            date: d.date || '',
            time: d.time || '',
        }));
        bookingDate = selectedDates[0]?.date || date;
        bookingTime = selectedDates[0]?.time || time;
    } else if (date && time) {
        // Single date booking
        bookingDate = date;
        bookingTime = time;
    }

    // Calculate duration - handle both number and string formats
    // Helper function to parse duration string
    const parseDuration = (duration: any): number | null => {
        if (duration === undefined || duration === null) {
            return null;
        }

        // If it's already a number, return it
        if (typeof duration === 'number' && !isNaN(duration) && duration > 0) {
            return duration;
        }

        // If it's a string, try to parse it
        if (typeof duration === 'string') {
            const str = duration.trim().toLowerCase();

            // Handle ranges like "4-10 hours" or "2-5 hours"
            const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)\s*(hour|hours|minute|minutes|min|mins|h|m)/);
            if (rangeMatch && rangeMatch[1] && rangeMatch[2] && rangeMatch[3]) {
                const min = parseInt(rangeMatch[1], 10);
                const max = parseInt(rangeMatch[2], 10);
                const unit = rangeMatch[3];
                // Use the average of the range
                const avg = Math.round((min + max) / 2);
                return unit.startsWith('h') ? avg : avg / 60; // Return in hours
            }

            // Handle single values like "4 hours", "120 minutes", "2h", "30m"
            const singleMatch = str.match(/(\d+)\s*(hour|hours|minute|minutes|min|mins|h|m)/);
            if (singleMatch && singleMatch[1] && singleMatch[2]) {
                const value = parseInt(singleMatch[1], 10);
                const unit = singleMatch[2];
                return unit.startsWith('h') ? value : value / 60; // Return in hours
            }

            // Try to parse as a plain number
            const numValue = parseFloat(str);
            if (!isNaN(numValue) && numValue > 0) {
                // If less than 10, assume hours; otherwise assume minutes
                return numValue < 10 ? numValue : numValue / 60; // Return in hours
            }
        }

        return null;
    };

    // Parse duration from variant
    const parsedDurationHours = parseDuration(variant.duration);
    const durationHours = parsedDurationHours !== null ? parsedDurationHours : 2; // Default 2 hours
    const durationMinutes = Math.round(durationHours * 60);

    // Calculate total amount and related fields
    let totalAmount = 0;
    let areaSqm: number | null = null;
    let distanceKm: number | null = null;
    let boxesCount = 0;
    let areaCost: number | null = null;
    let distanceCost: number | null = null;
    let boxesCost = 0;
    let subtotalBeforeVat: number | null = null;
    let vatAmount: number | null = null;
    const vatRate = 0.19;
    let measurementValue: number | null = null;
    let measurementUnit: string | null = null;
    let unitPrice: number | null = null;
    let quantityValue: number | null = null;

    // Build user inputs
    const userInputs: any = {
        pricingType: pricingType,
    };

    if (isHouseMoving) {
        // House moving service calculation
        const area = pricingType === 'per_unit' ? parseFloat(measurement || '0') : parseFloat(quantity || '1');
        const distanceValue = parseFloat(distance || '0');
        const boxesValue = parseFloat(numberOfBoxes || '0');

        areaSqm = area;
        distanceKm = distanceValue;
        boxesCount = boxesValue;

        const rate = pricingType === 'per_unit' ? (variant.unitPrice || variant.price || 0) : (variant.price || 0);
        const movingCost = calculateHouseMovingCost(area, distanceValue, rate, boxesValue);

        areaCost = movingCost.areaCost;
        distanceCost = movingCost.distanceCost;
        boxesCost = movingCost.boxesCost;
        subtotalBeforeVat = movingCost.subtotal;
        vatAmount = movingCost.vat;
        totalAmount = movingCost.total;

        if (pricingType === 'per_unit') {
            measurementValue = area;
            measurementUnit = variant.unitMeasure || 'sqm';
            unitPrice = variant.unitPrice || variant.price || null;
            userInputs.measurement = area;
            userInputs.unit_measure = measurementUnit;
        } else {
            quantityValue = area;
            userInputs.quantity = area;
        }

        userInputs.distance = distanceValue;
        userInputs.boxes = boxesValue;
        userInputs.area = area;
    } else if (pricingType === 'per_unit') {
        // Per-unit pricing
        const measurementNum = parseFloat(measurement || '0');
        const unitPriceValue = variant.unitPrice || variant.price || 0;

        measurementValue = measurementNum > 0 ? measurementNum : null;
        measurementUnit = variant.unitMeasure || null;
        unitPrice = unitPriceValue > 0 ? unitPriceValue : null;
        totalAmount = measurementNum * unitPriceValue;

        userInputs.measurement = measurementNum;
        userInputs.unit_measure = measurementUnit;
    } else {
        // Fixed pricing
        const quantityNum = parseFloat(quantity || '1');
        const price = variant.price || 0;

        quantityValue = quantityNum;
        totalAmount = quantityNum * price;

        userInputs.quantity = quantityNum;
    }

    // Build service variant data
    const serviceVariantData = {
        id: variant.id,
        title: variant.title,
        description: variant.description,
        price: variant.price,
        unitPrice: variant.unitPrice,
        unitMeasure: variant.unitMeasure,
        pricingType: pricingType,
        duration: variant.duration,
    };

    // Build moving service data if applicable
    const movingServiceData = isHouseMoving
        ? {
            area: areaSqm,
            distance: distanceKm,
            boxes: boxesCount,
            areaCost,
            distanceCost,
            boxesCost,
            subtotal: subtotalBeforeVat,
            vat: vatAmount,
            total: totalAmount,
        }
        : null;

    // Build cost breakdown
    const costBreakdown = isHouseMoving
        ? {
            area: areaCost,
            distance: distanceCost,
            boxes: boxesCost,
            subtotal: subtotalBeforeVat,
            vat: vatAmount,
            vatRate: vatRate,
            total: totalAmount,
        }
        : null;

    // Build selected dates for multi-day bookings
    const selectedDatesData = hasSelectedDates
        ? selectedDates.map((d) => ({
            date: d.date || '',
            time: d.time || '',
        }))
        : null;

    // Construct the booking data
    // Note: user_id is included for admin bookings (when admin creates booking for a customer)
    // For regular user bookings, the backend will use req.user.id
    const bookingData: CreateServiceBookingData & { user_id?: string } = {
        service_id: variant.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        booking_dates: isMultiDay ? bookingDates : [],
        duration_minutes: durationMinutes,
        customer_name: customer.name,
        customer_email: customer.email,
        ...(customer.phone && { customer_phone: customer.phone }),
        service_address: serviceAddress,
        ...(notes && { special_instructions: notes }),
        total_amount: totalAmount,
        payment_method: 'pending',
        user_inputs: userInputs,
        service_variant_data: serviceVariantData,
        moving_service_data: movingServiceData,
        cost_breakdown: costBreakdown,
        booking_type: 'standard',
        is_house_moving: isHouseMoving,
        area_sqm: areaSqm,
        distance_km: distanceKm,
        number_of_boxes: boxesCount,
        boxes_cost: boxesCost,
        area_cost: areaCost,
        distance_cost: distanceCost,
        subtotal_before_vat: subtotalBeforeVat,
        vat_amount: vatAmount,
        vat_rate: vatRate,
        service_duration_hours: durationHours,
        measurement_value: measurementValue,
        measurement_unit: measurementUnit,
        unit_price: unitPrice,
        pricing_type: pricingType,
        selected_dates: selectedDatesData,
        is_multi_day_booking: isMultiDay,
        // Include user_id for admin bookings (customer's ID)
        user_id: customer.id,
    };

    return bookingData;
}

