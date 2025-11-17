import { adminDataService } from '../adminDataService';
import { httpClient } from '../httpClient';

// Mock httpClient
jest.mock('../httpClient');

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('adminDataService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getBookings', () => {
        it('fetches bookings successfully', async () => {
            const mockBookings = [
                {
                    id: '1',
                    serviceId: 's1',
                    customerId: 'c1',
                    date: '2024-01-15',
                    time: '10:00',
                    status: 'pending' as const,
                },
            ];

            mockHttpClient.get.mockResolvedValue({
                data: { success: true, data: mockBookings },
            } as any);

            const result = await adminDataService.getBookings();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockBookings);
        });

        it('handles fetch errors', async () => {
            mockHttpClient.get.mockRejectedValue(new Error('Network error'));

            const result = await adminDataService.getBookings();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to fetch bookings');
        });
    });

    describe('getServices', () => {
        it('fetches services successfully', async () => {
            const mockServices = [
                {
                    id: '1',
                    title: 'Cleaning',
                    description: 'Test',
                    category: 'Cleaning',
                    isActive: true,
                    pricingType: 'fixed' as const,
                },
            ];

            mockHttpClient.get.mockResolvedValue({
                data: { success: true, data: mockServices },
            } as any);

            const result = await adminDataService.getServices();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockServices);
        });

        it('returns empty array on error', async () => {
            mockHttpClient.get.mockRejectedValue(new Error('Network error'));

            const result = await adminDataService.getServices();

            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
        });
    });

    describe('getService', () => {
        it('fetches single service successfully', async () => {
            const mockService = {
                id: '1',
                title: 'Cleaning',
                description: 'Test',
                category: 'Cleaning',
                isActive: true,
                pricingType: 'fixed' as const,
            };

            mockHttpClient.get.mockResolvedValue({
                data: { success: true, data: mockService },
            } as any);

            const result = await adminDataService.getService('1');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockService);
        });

        it('handles fetch errors', async () => {
            mockHttpClient.get.mockRejectedValue(new Error('Network error'));

            const result = await adminDataService.getService('1');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to fetch service');
        });
    });

    describe('createService', () => {
        it('creates service successfully', async () => {
            const newService = {
                title: 'New Service',
                description: 'Test',
                category: 'Cleaning',
                isActive: true,
                pricingType: 'fixed' as const,
            };

            mockHttpClient.post.mockResolvedValue({
                data: { success: true, data: { id: '1', ...newService } },
            } as any);

            const result = await adminDataService.createService(newService);

            expect(result.success).toBe(true);
            expect(result.data?.title).toBe('New Service');
        });

        it('handles creation errors', async () => {
            mockHttpClient.post.mockRejectedValue(new Error('Network error'));

            const result = await adminDataService.createService({} as any);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to create service');
        });
    });

    describe('updateService', () => {
        it('updates service successfully', async () => {
            const updates = { title: 'Updated Service' };

            mockHttpClient.put.mockResolvedValue({
                data: { success: true, data: { id: '1', ...updates } },
            } as any);

            const result = await adminDataService.updateService('1', updates);

            expect(result.success).toBe(true);
        });

        it('handles update errors', async () => {
            mockHttpClient.put.mockRejectedValue(new Error('Network error'));

            const result = await adminDataService.updateService('1', {});

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to update service');
        });
    });

    describe('deleteService', () => {
        it('deletes service successfully', async () => {
            mockHttpClient.delete.mockResolvedValue({
                data: { success: true },
            } as any);

            const result = await adminDataService.deleteService('1');

            expect(result.success).toBe(true);
        });

        it('handles deletion errors', async () => {
            mockHttpClient.delete.mockRejectedValue(new Error('Network error'));

            const result = await adminDataService.deleteService('1');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to delete service');
        });
    });

    describe('getBooking', () => {
        it('fetches single booking successfully', async () => {
            const mockBooking = {
                id: '1',
                serviceId: 's1',
                customerId: 'c1',
                date: '2024-01-15',
                time: '10:00',
                status: 'pending' as const,
            };

            mockHttpClient.get.mockResolvedValue({
                data: { success: true, data: mockBooking },
            } as any);

            const result = await adminDataService.getBooking('1');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockBooking);
        });

        it('handles fetch errors', async () => {
            mockHttpClient.get.mockRejectedValue(new Error('Network error'));

            const result = await adminDataService.getBooking('1');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to fetch booking');
        });
    });

    describe('updateBooking', () => {
        it('updates booking successfully', async () => {
            const updates = { status: 'confirmed' as const };

            mockHttpClient.put.mockResolvedValue({
                data: { success: true, data: { id: '1', ...updates } },
            } as any);

            const result = await adminDataService.updateBooking('1', updates);

            expect(result.success).toBe(true);
        });

        it('handles update errors', async () => {
            mockHttpClient.put.mockRejectedValue(new Error('Network error'));

            const result = await adminDataService.updateBooking('1', {});

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to update booking.');
        });
    });

    describe('updateBookingStatus', () => {
        it('updates booking status successfully', async () => {
            mockHttpClient.patch.mockResolvedValue({
                data: { success: true, data: { id: '1', status: 'confirmed' } },
            } as any);

            const result = await adminDataService.updateBookingStatus({
                bookingId: '1',
                status: 'confirmed',
            });

            expect(result.success).toBe(true);
        });

        it('handles status update errors', async () => {
            mockHttpClient.patch.mockRejectedValue(new Error('Network error'));

            const result = await adminDataService.updateBookingStatus({
                bookingId: '1',
                status: 'confirmed',
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to update booking status.');
        });
    });

    describe('createBooking', () => {
        it('creates booking successfully', async () => {
            const bookingData = {
                service_id: '1',
                booking_date: '2024-01-15',
                booking_time: '10:00',
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                service_address: '123 Main St',
                total_amount: 100,
            };

            mockHttpClient.post.mockResolvedValue({
                data: { success: true, data: { id: '1', ...bookingData } },
            } as any);

            const result = await adminDataService.createBooking(bookingData);

            expect(result.success).toBe(true);
        });

        it('handles creation errors', async () => {
            mockHttpClient.post.mockRejectedValue({
                response: {
                    data: { error: 'Validation failed' },
                },
            });

            const result = await adminDataService.createBooking({} as any);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Validation failed');
        });
    });
});

