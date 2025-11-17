/**
 * Hook for managing service variants
 */

import { useState, useEffect } from 'react';
import { adminDataService } from '@/services/adminDataService';

export interface ServiceVariant {
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
    display_order?: number;
    features?: string[];
    is_active?: boolean;
}

export function useServiceVariants(serviceId: string | null) {
    const [variants, setVariants] = useState<ServiceVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (serviceId) {
            fetchVariants();
        } else {
            setVariants([]);
        }
    }, [serviceId]);

    const fetchVariants = async () => {
        if (!serviceId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await adminDataService.getServiceVariants(serviceId);

            if (response.success && response.data) {
                setVariants(response.data);
            } else {
                setVariants([]);
                setError(response.error || 'Failed to fetch variants');
            }
        } catch (err: any) {
            console.error('[useServiceVariants] Error fetching variants:', err);
            setError(err.message || 'Failed to fetch variants');
            setVariants([]);
        } finally {
            setLoading(false);
        }
    };

    const refreshVariants = async () => {
        await fetchVariants();
    };

    return {
        variants,
        loading,
        error,
        refreshVariants,
    };
}

