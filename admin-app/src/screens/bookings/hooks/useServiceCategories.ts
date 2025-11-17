/**
 * Hook for fetching and managing service categories
 */

import { useState, useEffect } from 'react';
import { adminDataService } from '@/services/adminDataService';
import { AdminService } from '@/types';

export interface ServiceCategory {
    id: string;
    title: string;
    category: string;
}

export function useServiceCategories() {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await adminDataService.getServices();

                if (response.success && response.data) {
                    const uniqueCategories = [...new Set(
                        response.data.map((s: AdminService) => s.category).filter(Boolean)
                    )];

                    const categoryList: ServiceCategory[] = uniqueCategories.map((category) => {
                        const id = category.toLowerCase().replace(/\s+/g, '-');
                        return {
                            id,
                            title: category,
                            category: category,
                        };
                    });

                    setCategories(categoryList);
                } else {
                    setCategories([]);
                }
            } catch (err: any) {
                console.error('[useServiceCategories] Error fetching categories:', err);
                setError(err.message || 'Failed to fetch categories');
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
}

