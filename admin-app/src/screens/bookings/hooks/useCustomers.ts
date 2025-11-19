/**
 * Hook for fetching and managing customers
 * Now uses data cache to avoid repeated DB calls
 */

import { useState, useEffect } from 'react';
import { dataCache } from '@/services/dataCache';
import type { Customer } from '@/services/dataCache';

export type { Customer };

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch customers from cache
            const cachedCustomers = await dataCache.getCustomers();
            setCustomers(cachedCustomers);
        } catch (err: any) {
            console.error('[useCustomers] Error loading customers:', err);
            setError(err.message || 'Failed to load customers');
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const filterCustomers = (query: string): Customer[] => {
        if (!query.trim()) {
            return customers;
        }

        const lowerQuery = query.toLowerCase();
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(lowerQuery) ||
            customer.email.toLowerCase().includes(lowerQuery) ||
            customer.phone?.toLowerCase().includes(lowerQuery) ||
            customer.id.toLowerCase().includes(lowerQuery)
        );
    };

    return {
        customers,
        loading,
        error,
        loadCustomers,
        filterCustomers,
    };
}

