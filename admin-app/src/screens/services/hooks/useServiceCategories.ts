/**
 * Hook for fetching service categories dynamically from database
 */

import { useState, useEffect } from 'react';
import { adminDataService } from '@/services/adminDataService';
import { AdminService } from '@/types';

export interface ServiceCategory {
    id: string;
    title: string;
    category: string;
    image?: any;
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
                    // Extract unique categories from services
                    const uniqueCategories = [...new Set(
                        response.data.map((s: AdminService) => s.category).filter(Boolean)
                    )];

                    // Map to category objects with images
                    const categoryImages: { [key: string]: any } = {
                        'Cleaning': require('../../../../assets/services/cleaning-image.jpeg'),
                        'Furniture Assembly': require('../../../../assets/services/furniture-image.jpeg'),
                        'Furniture Disassembly': require('../../../../assets/services/furniture-image.jpeg'),
                        'Moving': require('../../../../assets/services/moving.jpeg'),
                        'Office Setup': require('../../../../assets/services/office-setup-image.jpeg'),
                        'House Painting': require('../../../../assets/services/paint-image.jpeg'),
                    };

                    const categoryList: ServiceCategory[] = uniqueCategories.map((category) => {
                        const id = category.toLowerCase().replace(/\s+/g, '-');
                        return {
                            id,
                            title: category,
                            category: category,
                            image: categoryImages[category],
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

