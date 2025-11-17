/**
 * Booking Data Builder - Refactored with better structure
 * Constructs booking data matching the shared app's format for creating service bookings
 */

// BookingDate type definition
export interface BookingDate {
    id: string;
    date: string;
    time: string;
}

// Types
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
    duration?: number | string;
    minMeasurement?: number;
    maxMeasurement?: number;
}

export interface BuildBookingDataInput {
    customer: Customer;
    service: Service;
    variant: ServiceVariant;
    quantity?: string;
    measurement?: string;
    distance?: string;
    numberOfBoxes?: string;
    date?: string;
    time?: string;
    selectedDates?: BookingDate[];
    serviceTime?: Date;
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
    user_id?: string;
}

// Constants
const RATE_PER_KM = 0.5;
const BOX_PRICE = 2.5;
const VAT_RATE = 0.19;
const DEFAULT_DURATION_HOURS = 2;

// Utility Functions
function parseDuration(duration: any): number | null {
    if (duration === undefined || duration === null) {
        return null;
    }

    if (typeof duration === 'number' && !isNaN(duration) && duration > 0) {
        // If number is less than 24, assume it's hours; otherwise assume minutes
        return duration < 24 ? duration : duration / 60;
    }

    if (typeof duration === 'string') {
        const str = duration.trim().toLowerCase();

        // Handle ranges like "4-10 hours" or "2-5 hours"
        const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)\s*(hour|hours|minute|minutes|min|mins|h|m)/);
        if (rangeMatch && rangeMatch[1] && rangeMatch[2] && rangeMatch[3]) {
            const min = parseInt(rangeMatch[1], 10);
            const max = parseInt(rangeMatch[2], 10);
            const unit = rangeMatch[3];
            const avg = Math.round((min + max) / 2);
            return unit.startsWith('h') ? avg : avg / 60;
        }

        // Handle single values like "4 hours", "120 minutes", "2h", "30m"
        const singleMatch = str.match(/(\d+)\s*(hour|hours|minute|minutes|min|mins|h|m)/);
        if (singleMatch && singleMatch[1] && singleMatch[2]) {
            const value = parseInt(singleMatch[1], 10);
            const unit = singleMatch[2];
            return unit.startsWith('h') ? value : value / 60;
        }

        // Try to parse as a plain number
        const numValue = parseFloat(str);
        if (!isNaN(numValue) && numValue > 0) {
            return numValue < 10 ? numValue : numValue / 60;
        }
    }

    return null;
}

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

function getPricingType(variant: ServiceVariant): 'fixed' | 'per_unit' | 'hourly' {
    if (variant.pricingType) {
        return variant.pricingType;
    }
    if (variant.unitPrice || variant.unitMeasure) {
        return 'per_unit';
    }
    return 'fixed';
}

function isHouseMovingService(service: Service, variant: ServiceVariant): boolean {
    const serviceTitle = service.title.toLowerCase();
    const variantTitle = variant.title.toLowerCase();
    const category = service.category.toLowerCase();

    return (
        serviceTitle.includes('moving') ||
        serviceTitle.includes('house') ||
        category.includes('moving') ||
        variantTitle.includes('moving') ||
        variantTitle.includes('house')
    );
}

function prepareDates(
    date?: string,
    time?: string,
    selectedDates?: BookingDate[]
): {
    bookingDate: string;
    bookingTime: string;
    bookingDates: Array<{ date: string; time: string }>;
} {
    let bookingDate = date || '';
    let bookingTime = time || '';
    let bookingDates: Array<{ date: string; time: string }> = [];

    if (selectedDates && selectedDates.length > 0) {
        bookingDates = selectedDates.map((d) => ({
            date: d.date || '',
            time: d.time || '',
        }));
        bookingDate = selectedDates[0]?.date || date || '';
        bookingTime = selectedDates[0]?.time || time || '';
    } else if (date && time) {
        bookingDate = date;
        bookingTime = time;
        // For single date booking, still include it in booking_dates if it's a weekly cleaning
        // But for now, keep it empty for single date bookings
    }

    return { bookingDate, bookingTime, bookingDates };
}

function calculateDuration(variant: ServiceVariant): { hours: number; minutes: number } {
    const parsedDurationHours = parseDuration(variant.duration);
    const hours = parsedDurationHours !== null ? parsedDurationHours : DEFAULT_DURATION_HOURS;
    const minutes = Math.round(hours * 60);
    return { hours, minutes };
}

function calculatePrice(
    variant: ServiceVariant,
    pricingType: 'fixed' | 'per_unit' | 'hourly',
    quantity: string,
    measurement: string,
    isHouseMoving: boolean,
    distance: string,
    numberOfBoxes: string
): {
    totalAmount: number;
    areaSqm: number | null;
    distanceKm: number | null;
    boxesCount: number;
    areaCost: number | null;
    distanceCost: number | null;
    boxesCost: number;
    subtotalBeforeVat: number | null;
    vatAmount: number | null;
    measurementValue: number | null;
    measurementUnit: string | null;
    unitPrice: number | null;
    quantityValue: number | null;
    userInputs: any;
} {
    let totalAmount = 0;
    let areaSqm: number | null = null;
    let distanceKm: number | null = null;
    let boxesCount = 0;
    let areaCost: number | null = null;
    let distanceCost: number | null = null;
    let boxesCost = 0;
    let subtotalBeforeVat: number | null = null;
    let vatAmount: number | null = null;
    let measurementValue: number | null = null;
    let measurementUnit: string | null = null;
    let unitPrice: number | null = null;
    let quantityValue: number | null = null;

    const userInputs: any = {
        pricingType: pricingType,
    };

    if (isHouseMoving) {
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
        const measurementNum = parseFloat(measurement || '0');
        const unitPriceValue = variant.unitPrice || variant.price || 0;

        measurementValue = measurementNum > 0 ? measurementNum : null;
        measurementUnit = variant.unitMeasure || null;
        unitPrice = unitPriceValue > 0 ? unitPriceValue : null;
        totalAmount = measurementNum * unitPriceValue;

        userInputs.measurement = measurementNum;
        userInputs.unit_measure = measurementUnit;
    } else {
        const quantityNum = parseFloat(quantity || '1');
        const price = variant.price || 0;

        quantityValue = quantityNum;
        totalAmount = quantityNum * price;

        userInputs.quantity = quantityNum;
    }

    return {
        totalAmount,
        areaSqm,
        distanceKm,
        boxesCount,
        areaCost,
        distanceCost,
        boxesCost,
        subtotalBeforeVat,
        vatAmount,
        measurementValue,
        measurementUnit,
        unitPrice,
        quantityValue,
        userInputs,
    };
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

    // Determine pricing type and service type
    const pricingType = getPricingType(variant);
    const isHouseMoving = isHouseMovingService(service, variant);

    // Prepare dates
    const { bookingDate, bookingTime, bookingDates } = prepareDates(date, time, selectedDates);
    // Multi-day is only true if there are more than 1 dates
    // But booking_dates should include all selected dates (even if just 1)
    const isMultiDay = bookingDates.length > 1;

    // Calculate duration
    const { hours: durationHours, minutes: durationMinutes } = calculateDuration(variant);

    // Calculate price and related fields
    const priceData = calculatePrice(
        variant,
        pricingType,
        quantity,
        measurement,
        isHouseMoving,
        distance,
        numberOfBoxes
    );

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
            area: priceData.areaSqm,
            distance: priceData.distanceKm,
            boxes: priceData.boxesCount,
            areaCost: priceData.areaCost,
            distanceCost: priceData.distanceCost,
            boxesCost: priceData.boxesCost,
            subtotal: priceData.subtotalBeforeVat,
            vat: priceData.vatAmount,
            total: priceData.totalAmount,
        }
        : null;

    // Build cost breakdown
    const costBreakdown = isHouseMoving
        ? {
            area: priceData.areaCost,
            distance: priceData.distanceCost,
            boxes: priceData.boxesCost,
            subtotal: priceData.subtotalBeforeVat,
            vat: priceData.vatAmount,
            vatRate: VAT_RATE,
            total: priceData.totalAmount,
        }
        : null;

    // Build selected dates for multi-day bookings
    const selectedDatesData = bookingDates.length > 0
        ? bookingDates.map((d) => ({
            date: d.date || '',
            time: d.time || '',
        }))
        : null;

    // Construct the booking data
    const bookingData: CreateServiceBookingData = {
        service_id: variant.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        booking_dates: bookingDates.length > 0 ? bookingDates : [],
        duration_minutes: durationMinutes,
        customer_name: customer.name,
        customer_email: customer.email,
        ...(customer.phone && { customer_phone: customer.phone }),
        service_address: serviceAddress.trim(),
        special_instructions: notes && notes.trim() ? notes.trim() : null,
        total_amount: priceData.totalAmount,
        payment_method: 'pending',
        user_inputs: priceData.userInputs,
        service_variant_data: serviceVariantData,
        moving_service_data: movingServiceData,
        cost_breakdown: costBreakdown,
        booking_type: 'standard',
        is_house_moving: isHouseMoving,
        area_sqm: priceData.areaSqm,
        distance_km: priceData.distanceKm,
        number_of_boxes: priceData.boxesCount,
        boxes_cost: priceData.boxesCost,
        area_cost: priceData.areaCost,
        distance_cost: priceData.distanceCost,
        subtotal_before_vat: priceData.subtotalBeforeVat,
        vat_amount: priceData.vatAmount,
        vat_rate: VAT_RATE,
        service_duration_hours: durationHours,
        measurement_value: priceData.measurementValue,
        measurement_unit: priceData.measurementUnit,
        unit_price: priceData.unitPrice,
        pricing_type: pricingType,
        selected_dates: selectedDatesData,
        is_multi_day_booking: isMultiDay,
        user_id: customer.id,
    };

    return bookingData;
}

