/**
 * Validation utilities for booking form
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateNumericInput(text: string, allowDecimals: boolean = true): ValidationResult {
    if (text === '') {
        return { isValid: true };
    }

    const regex = allowDecimals ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;

    if (!regex.test(text)) {
        return {
            isValid: false,
            error: allowDecimals ? 'Please enter a valid number' : 'Please enter a whole number',
        };
    }

    // Ensure only one decimal point
    const parts = text.split('.');
    if (parts.length > 2) {
        return {
            isValid: false,
            error: 'Invalid number format',
        };
    }

    return { isValid: true };
}

export function validateMeasurement(
    value: string,
    min?: number,
    max?: number
): ValidationResult {
    if (value === '') {
        return { isValid: true };
    }

    const numericResult = validateNumericInput(value, true);
    if (!numericResult.isValid) {
        return numericResult;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
        return {
            isValid: false,
            error: 'Measurement must be greater than 0',
        };
    }

    if (min !== undefined && numValue < min) {
        return {
            isValid: false,
            error: `Measurement must be at least ${min}`,
        };
    }

    if (max !== undefined && numValue > max) {
        return {
            isValid: false,
            error: `Measurement must be at most ${max}`,
        };
    }

    return { isValid: true };
}

export function validateQuantity(value: string): ValidationResult {
    if (value === '') {
        return { isValid: true };
    }

    const numericResult = validateNumericInput(value, true);
    if (!numericResult.isValid) {
        return numericResult;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
        return {
            isValid: false,
            error: 'Quantity must be greater than 0',
        };
    }

    return { isValid: true };
}

export function validateDistance(value: string): ValidationResult {
    if (value === '') {
        return { isValid: false, error: 'Distance is required for moving services' };
    }

    const numericResult = validateNumericInput(value, true);
    if (!numericResult.isValid) {
        return numericResult;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
        return {
            isValid: false,
            error: 'Distance must be greater than 0',
        };
    }

    return { isValid: true };
}

export function validateBoxes(value: string): ValidationResult {
    if (value === '') {
        return { isValid: true }; // Boxes are optional
    }

    const numericResult = validateNumericInput(value, false);
    if (!numericResult.isValid) {
        return numericResult;
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
        return {
            isValid: false,
            error: 'Number of boxes must be 0 or greater',
        };
    }

    return { isValid: true };
}

export function validateDate(date: Date): ValidationResult {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return {
            isValid: false,
            error: 'Please select a date from today onwards',
        };
    }

    return { isValid: true };
}

export function validateTime(time: Date, selectedDate: Date): ValidationResult {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    // If the selected date is today, ensure the time is in the future
    if (selectedDateOnly.getTime() === today.getTime()) {
        const now = new Date();
        const pickedDateTime = new Date(time);
        pickedDateTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

        if (pickedDateTime <= now) {
            return {
                isValid: false,
                error: 'Please select a time after the current time',
            };
        }
    }

    return { isValid: true };
}

export function validateServiceAddress(address: string): ValidationResult {
    if (!address || address.trim() === '') {
        return {
            isValid: false,
            error: 'Service address is required',
        };
    }

    return { isValid: true };
}

