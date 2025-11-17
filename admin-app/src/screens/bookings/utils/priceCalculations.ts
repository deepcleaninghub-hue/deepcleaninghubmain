/**
 * Price calculation utilities
 */

export interface ServiceVariant {
    id: string;
    service_id: string;
    title: string;
    price?: number;
    unitPrice?: number;
    unitMeasure?: string;
    pricingType?: 'fixed' | 'per_unit' | 'hourly';
}

export interface MovingCostBreakdown {
    areaCost: number;
    distanceCost: number;
    boxesCost: number;
    subtotal: number;
    vat: number;
    total: number;
    ratePerKm: number;
    boxPrice: number;
    vatRate: number;
}

const RATE_PER_KM = 0.5;
const BOX_PRICE = 2.5;
const VAT_RATE = 0.19;

export function calculateHouseMovingCost(
    area: number,
    distance: number,
    rate: number,
    boxes: number = 0
): MovingCostBreakdown {
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
        ratePerKm: RATE_PER_KM,
        boxPrice: BOX_PRICE,
        vatRate: VAT_RATE,
    };
}

export function getPricingType(variant: ServiceVariant | null): 'fixed' | 'per_unit' | 'hourly' {
    if (!variant) return 'fixed';
    if (variant.pricingType) return variant.pricingType;
    if (variant.unitPrice || variant.unitMeasure) return 'per_unit';
    return 'fixed';
}

export function calculateTotalPrice(
    variant: ServiceVariant | null,
    pricingType: 'fixed' | 'per_unit' | 'hourly',
    quantity: string,
    measurement: string,
    distance: string,
    numberOfBoxes: string,
    isHouseMoving: boolean
): number {
    if (!variant) return 0;

    if (isHouseMoving) {
        const area = pricingType === 'per_unit'
            ? parseFloat(measurement || '0')
            : parseFloat(quantity || '1');
        const distanceValue = parseFloat(distance) || 0;
        const boxesValue = parseFloat(numberOfBoxes) || 0;
        const rate = pricingType === 'per_unit'
            ? (variant.unitPrice || variant.price || 0)
            : (variant.price || 0);

        const movingCost = calculateHouseMovingCost(area, distanceValue, rate, boxesValue);
        return movingCost.total;
    }

    if (pricingType === 'per_unit') {
        const measurementValue = parseFloat(measurement || '0');
        return measurementValue * (variant.unitPrice || variant.price || 0);
    }

    // Fixed pricing
    return (variant.price || 0) * parseFloat(quantity || '1');
}

