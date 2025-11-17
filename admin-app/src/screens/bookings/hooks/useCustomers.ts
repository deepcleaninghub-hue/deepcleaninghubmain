/**
 * Hook for fetching and managing customers
 */

import { useState, useEffect, useMemo } from 'react';
import { adminDataService } from '@/services/adminDataService';
import { AdminBooking } from '@/types';

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError(null);

            const bookingsResponse = await adminDataService.getBookings();
            const bookings = bookingsResponse.data || [];

            const customerMap = new Map<string, { bookings: AdminBooking[] }>();

            bookings.forEach((booking: AdminBooking) => {
                const customerId = booking.user_id;

                if (!customerId || customerId === 'unknown') {
                    return;
                }

                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(customerId)) {
                    return;
                }

                if (!customerMap.has(customerId)) {
                    customerMap.set(customerId, { bookings: [] });
                }

                const customerData = customerMap.get(customerId)!;
                customerData.bookings.push(booking);
            });

            const customerList: Customer[] = [];
            for (const [id, data] of customerMap.entries()) {
                const firstBooking = data.bookings[0];
                if (!firstBooking) continue;

                const user = firstBooking.mobile_users;
                const name = user
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || firstBooking.customer_name || 'Customer'
                    : firstBooking.customer_name || 'Customer';

                customerList.push({
                    id,
                    name,
                    email: user?.email || firstBooking.customer_email || '',
                    phone: user?.phone || firstBooking.customer_phone || '',
                });
            }

            customerList.sort((a, b) => a.name.localeCompare(b.name));

            setCustomers(customerList);
        } catch (err: any) {
            console.error('[useCustomers] Error loading customers:', err);
            setError(err.message || 'Failed to load customers');
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

