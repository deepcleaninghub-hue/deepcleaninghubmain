/**
 * Data Cache Service
 * Caches frequently accessed data to reduce database calls
 */

import { adminDataService } from './adminDataService';
import { AdminService } from '@/types';

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export interface ServiceCategory {
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
    minMeasurement?: number;
    maxMeasurement?: number;
    measurementStep?: number;
    measurementPlaceholder?: string;
    duration?: number;
    is_active?: boolean;
    display_order?: number;
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class DataCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

    /**
     * Get cached data or fetch if expired/missing
     */
    private async getOrFetch<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl: number = this.DEFAULT_TTL
    ): Promise<T> {
        const cached = this.cache.get(key);
        const now = Date.now();

        // Return cached data if still valid
        if (cached && (now - cached.timestamp) < cached.ttl) {
            return cached.data;
        }

        // Fetch fresh data
        const data = await fetchFn();

        // Cache it
        this.cache.set(key, {
            data,
            timestamp: now,
            ttl,
        });

        return data;
    }

    /**
     * Invalidate cache entry
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get customers (cached)
     */
    async getCustomers(): Promise<Customer[]> {
        return this.getOrFetch('customers', async () => {
            const response = await adminDataService.getMobileUsers();
            const users = response.data || [];

            const customers: Customer[] = users.map((user: any) => {
                const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer';
                return {
                    id: user.id,
                    name,
                    email: user.email || '',
                    phone: user.phone,
                    address: user.address,
                };
            });

            return customers.sort((a, b) => a.name.localeCompare(b.name));
        });
    }

    /**
     * Get service categories (cached)
     */
    async getServiceCategories(): Promise<ServiceCategory[]> {
        return this.getOrFetch('categories', async () => {
            const response = await adminDataService.getServices();
            const services = response.data || [];

            const uniqueCategories = [...new Set(
                services.map((s: AdminService) => s.category).filter(Boolean)
            )];

            return uniqueCategories.map((category) => {
                const id = category.toLowerCase().replace(/\s+/g, '-');
                return {
                    id,
                    title: category,
                    category: category,
                };
            });
        });
    }

    /**
     * Get services by category (cached)
     */
    async getServicesByCategory(category: string): Promise<AdminService[]> {
        const cacheKey = `services:${category}`;
        return this.getOrFetch(cacheKey, async () => {
            const response = await adminDataService.getServices(category);
            return response.data || [];
        });
    }

    /**
     * Get all services (cached)
     */
    async getAllServices(): Promise<AdminService[]> {
        return this.getOrFetch('services:all', async () => {
            const response = await adminDataService.getServices();
            return response.data || [];
        });
    }

    /**
     * Get service variants by service ID (cached)
     */
    async getServiceVariants(serviceId: string): Promise<ServiceVariant[]> {
        const cacheKey = `variants:${serviceId}`;
        return this.getOrFetch(cacheKey, async () => {
            const response = await adminDataService.getServiceVariants(serviceId);
            return response.data || [];
        });
    }

    /**
     * Refresh customers cache
     */
    async refreshCustomers(): Promise<Customer[]> {
        this.invalidate('customers');
        return this.getCustomers();
    }

    /**
     * Refresh categories cache
     */
    async refreshCategories(): Promise<ServiceCategory[]> {
        this.invalidate('categories');
        this.invalidate('services:all'); // Also invalidate services cache
        return this.getServiceCategories();
    }

    /**
     * Refresh services cache for a category
     */
    async refreshServices(category: string): Promise<AdminService[]> {
        this.invalidate(`services:${category}`);
        return this.getServicesByCategory(category);
    }

    /**
     * Refresh variants cache for a service
     */
    async refreshVariants(serviceId: string): Promise<ServiceVariant[]> {
        this.invalidate(`variants:${serviceId}`);
        return this.getServiceVariants(serviceId);
    }
}

export const dataCache = new DataCache();

