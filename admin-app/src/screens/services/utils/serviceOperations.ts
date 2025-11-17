/**
 * Service Operations Utilities
 * Handles validation and data building for services and service variants
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface ServiceFormData {
    id?: string;
    title: string;
    description?: string;
    category: string;
    imageUrl?: string;
    pricingType?: 'fixed' | 'per_unit' | 'hourly';
    price?: string;
    unitMeasure?: string;
    displayOrder?: string;
}

export interface ServiceVariantFormData {
    id?: string;
    serviceId: string;
    title: string;
    description?: string;
    price?: string;
    unitPrice?: string;
    unitMeasure?: string;
    duration?: string;
    pricingType?: 'fixed' | 'per_unit' | 'hourly';
    minMeasurement?: string;
    maxMeasurement?: string;
    measurementStep?: string;
    measurementPlaceholder?: string;
    displayOrder?: string;
    features?: string[];
}

export interface ServiceData {
    id: string;
    title: string;
    description?: string;
    category: string;
    image_url?: string;
    pricing_type?: 'fixed' | 'per_unit' | 'hourly';
    price?: number;
    unit_price?: number;
    unit_measure?: string;
    display_order: number;
    is_active: boolean;
}

export interface ServiceVariantData {
    id: string;
    service_id: string;
    title: string;
    description?: string;
    price?: number;
    unit_price?: number;
    unit_measure?: string;
    duration?: number;
    pricing_type?: 'fixed' | 'per_unit' | 'hourly';
    min_measurement?: number;
    max_measurement?: number;
    measurement_step?: number;
    measurement_placeholder?: string;
    display_order: number;
    features?: string[];
    is_active: boolean;
}

/**
 * Generate a URL-friendly ID from a title
 */
function generateId(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Validate service form data
 */
export function validateServiceData(data: ServiceFormData): ValidationResult {
    const errors: string[] = [];

    // Title validation
    if (!data.title || data.title.trim() === '') {
        errors.push('Title is required');
    }

    // Category validation
    if (!data.category || data.category.trim() === '') {
        errors.push('Category is required');
    }

    // Price validation for fixed pricing
    if (data.pricingType === 'fixed') {
        if (!data.price || data.price.trim() === '') {
            errors.push('Price is required for fixed pricing');
        } else {
            const price = parseFloat(data.price);
            if (isNaN(price) || price < 0) {
                errors.push('Price must be a non-negative number');
            }
        }
    }

    // Price and unit measure validation for per_unit pricing
    if (data.pricingType === 'per_unit') {
        if (!data.price || data.price.trim() === '') {
            errors.push('Unit price is required for per-unit pricing');
        } else {
            const price = parseFloat(data.price);
            if (isNaN(price) || price < 0) {
                errors.push('Unit price must be a non-negative number');
            }
        }
        if (!data.unitMeasure || data.unitMeasure.trim() === '') {
            errors.push('Unit measure is required for per-unit pricing');
        }
    }

    // Display order validation
    if (data.displayOrder && data.displayOrder.trim() !== '') {
        const displayOrder = parseFloat(data.displayOrder);
        if (isNaN(displayOrder) || displayOrder < 0) {
            errors.push('Display order must be a non-negative number');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate service variant form data
 */
export function validateServiceVariantData(data: ServiceVariantFormData): ValidationResult {
    const errors: string[] = [];

    // Service ID validation
    if (!data.serviceId || data.serviceId.trim() === '') {
        errors.push('Service ID is required');
    }

    // Title validation
    if (!data.title || data.title.trim() === '') {
        errors.push('Title is required');
    }

    // Price validation
    if (data.price && data.price.trim() !== '') {
        const price = parseFloat(data.price);
        if (isNaN(price) || price < 0) {
            errors.push('Price must be a non-negative number');
        }
    }

    // Unit price validation
    if (data.unitPrice && data.unitPrice.trim() !== '') {
        const unitPrice = parseFloat(data.unitPrice);
        if (isNaN(unitPrice) || unitPrice < 0) {
            errors.push('Unit price must be a non-negative number');
        }
    }

    // Duration validation
    if (data.duration && data.duration.trim() !== '') {
        const duration = parseFloat(data.duration);
        if (isNaN(duration) || duration <= 0) {
            errors.push('Duration must be a positive number');
        }
    }

    // Measurement validation
    if (data.minMeasurement && data.maxMeasurement) {
        const min = parseFloat(data.minMeasurement);
        const max = parseFloat(data.maxMeasurement);
        if (!isNaN(min) && !isNaN(max) && min >= max) {
            errors.push('Minimum measurement must be less than maximum measurement');
        }
    }

    // Display order validation
    if (data.displayOrder && data.displayOrder.trim() !== '') {
        const displayOrder = parseFloat(data.displayOrder);
        if (isNaN(displayOrder) || displayOrder < 0) {
            errors.push('Display order must be a non-negative number');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Build service data for API
 */
export function buildServiceData(data: ServiceFormData): ServiceData {
    const id = data.id || generateId(data.title);

    const serviceData: ServiceData = {
        id,
        title: data.title.trim(),
        ...(data.description && { description: data.description.trim() }),
        category: data.category.trim(),
        ...(data.imageUrl && { image_url: data.imageUrl.trim() }),
        ...(data.pricingType && { pricing_type: data.pricingType }),
        ...(data.unitMeasure && { unit_measure: data.unitMeasure.trim() }),
        display_order: data.displayOrder ? parseInt(data.displayOrder, 10) : 0,
        is_active: true,
    };

    // Add price based on pricing type
    if (data.price && data.price.trim() !== '') {
        const priceValue = parseFloat(data.price);
        if (!isNaN(priceValue) && priceValue >= 0) {
            if (data.pricingType === 'per_unit') {
                serviceData.unit_price = priceValue;
            } else {
                serviceData.price = priceValue;
            }
        }
    }

    return serviceData;
}

/**
 * Build service variant data for API
 */
export function buildServiceVariantData(data: ServiceVariantFormData): ServiceVariantData {
    const id = data.id || generateId(`${data.serviceId}-${data.title}`);

    const variantData: ServiceVariantData = {
        id,
        service_id: data.serviceId.trim(),
        title: data.title.trim(),
        ...(data.description && { description: data.description.trim() }),
        ...(data.price && { price: parseFloat(data.price) }),
        ...(data.unitPrice && { unit_price: parseFloat(data.unitPrice) }),
        ...(data.unitMeasure && { unit_measure: data.unitMeasure.trim() }),
        ...(data.duration && { duration: parseInt(data.duration, 10) }),
        ...(data.pricingType && { pricing_type: data.pricingType }),
        ...(data.minMeasurement && { min_measurement: parseFloat(data.minMeasurement) }),
        ...(data.maxMeasurement && { max_measurement: parseFloat(data.maxMeasurement) }),
        ...(data.measurementStep && { measurement_step: parseFloat(data.measurementStep) }),
        ...(data.measurementPlaceholder && { measurement_placeholder: data.measurementPlaceholder.trim() }),
        display_order: data.displayOrder ? parseInt(data.displayOrder, 10) : 0,
        features: data.features || [],
        is_active: true,
    };

    return variantData;
}

