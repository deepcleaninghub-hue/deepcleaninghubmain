/**
 * Hook for managing services by category
 */

import { useState, useEffect } from 'react';
import { adminDataService } from '@/services/adminDataService';
import { AdminService } from '@/types';

export function useServices(category?: string) {
    const [services, setServices] = useState<AdminService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await adminDataService.getServices(category);

                if (response.success && response.data) {
                    setServices(response.data);
                } else {
                    setServices([]);
                    setError(response.error || 'Failed to fetch services');
                }
            } catch (err: any) {
                console.error('[useServices] Error fetching services:', err);
                setError(err.message || 'Failed to fetch services');
                setServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [category]);

    const refreshServices = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await adminDataService.getServices(category);

            if (response.success && response.data) {
                setServices(response.data);
            } else {
                setServices([]);
                setError(response.error || 'Failed to fetch services');
            }
        } catch (err: any) {
            console.error('[useServices] Error refreshing services:', err);
            setError(err.message || 'Failed to refresh services');
        } finally {
            setLoading(false);
        }
    };

    return {
        services,
        loading,
        error,
        refreshServices,
    };
}

