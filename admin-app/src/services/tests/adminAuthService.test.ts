import { adminAuthService } from '../adminAuthService';
import { httpClient } from '../httpClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('../httpClient');
jest.mock('@react-native-async-storage/async-storage');

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('adminAuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        it('signs in successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        user: {
                            id: '1',
                            name: 'Admin',
                            email: 'admin@example.com',
                            phone: '+1234567890',
                            role: 'admin',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                        token: 'test-token',
                    },
                },
            };

            mockHttpClient.post.mockResolvedValue(mockResponse as any);

            const result = await adminAuthService.signIn('admin@example.com', 'password');

            expect(result.success).toBe(true);
            expect(result.data?.admin.email).toBe('admin@example.com');
            expect(result.data?.token).toBe('test-token');
        });

        it('handles sign in failure', async () => {
            const mockResponse = {
                data: {
                    success: false,
                    error: 'Invalid credentials',
                },
            };

            mockHttpClient.post.mockResolvedValue(mockResponse as any);

            const result = await adminAuthService.signIn('admin@example.com', 'wrong');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid credentials');
        });

        it('handles network timeout', async () => {
            const error = {
                code: 'ECONNABORTED',
                message: 'timeout',
            };

            mockHttpClient.post.mockRejectedValue(error);

            const result = await adminAuthService.signIn('admin@example.com', 'password');

            expect(result.success).toBe(false);
            expect(result.error).toContain('timeout');
        });

        it('handles network errors', async () => {
            const error = {
                code: 'ERR_NETWORK',
                message: 'Network Error',
            };

            mockHttpClient.post.mockRejectedValue(error);

            const result = await adminAuthService.signIn('admin@example.com', 'password');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Network error');
        });
    });

    describe('signOut', () => {
        it('signs out successfully', async () => {
            mockHttpClient.post.mockResolvedValue({
                data: { success: true, message: 'Signed out' },
            } as any);

            const result = await adminAuthService.signOut();

            expect(result.success).toBe(true);
        });

        it('handles sign out errors gracefully', async () => {
            mockHttpClient.post.mockRejectedValue(new Error('Network error'));

            const result = await adminAuthService.signOut();

            // Should still return success as logout is primarily client-side
            expect(result.success).toBe(true);
        });
    });

    describe('getCurrentAdmin', () => {
        it('gets current admin successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        id: '1',
                        name: 'Admin',
                        email: 'admin@example.com',
                        role: 'admin',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                },
            };

            mockHttpClient.get.mockResolvedValue(mockResponse as any);

            const result = await adminAuthService.getCurrentAdmin();

            expect(result.email).toBe('admin@example.com');
            expect(result.role).toBe('admin');
        });

        it('throws error on failure', async () => {
            mockHttpClient.get.mockResolvedValue({
                data: { success: false },
            } as any);

            await expect(adminAuthService.getCurrentAdmin()).rejects.toThrow();
        });
    });

    describe('updateProfile', () => {
        it('updates profile successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        id: '1',
                        name: 'Updated Admin',
                        email: 'admin@example.com',
                        role: 'admin',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    message: 'Profile updated',
                },
            };

            mockHttpClient.put.mockResolvedValue(mockResponse as any);

            const result = await adminAuthService.updateProfile({ name: 'Updated Admin' });

            expect(result.success).toBe(true);
            expect(result.data?.name).toBe('Updated Admin');
        });

        it('handles update failure', async () => {
            mockHttpClient.put.mockRejectedValue({
                response: {
                    data: { error: 'Update failed' },
                },
            });

            const result = await adminAuthService.updateProfile({ name: 'Test' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Update failed');
        });
    });

    describe('refreshToken', () => {
        it('refreshes token successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        admin: {
                            id: '1',
                            email: 'admin@example.com',
                        },
                        token: 'new-token',
                    },
                },
            };

            mockHttpClient.post.mockResolvedValue(mockResponse as any);

            const result = await adminAuthService.refreshToken();

            expect(result.success).toBe(true);
            expect(result.data?.token).toBe('new-token');
        });

        it('falls back to demo token if refresh fails', async () => {
            mockAsyncStorage.getItem.mockResolvedValue('demo-token');
            mockHttpClient.post.mockRejectedValue(new Error('Refresh failed'));

            const result = await adminAuthService.refreshToken();

            expect(result.success).toBe(true);
            expect(result.data?.token).toBe('demo-token');
        });
    });

    describe('forgotPassword', () => {
        it('sends forgot password request', async () => {
            mockHttpClient.post.mockResolvedValue({
                data: { success: true, message: 'Email sent' },
            } as any);

            const result = await adminAuthService.forgotPassword('admin@example.com');

            expect(result.success).toBe(true);
        });

        it('handles forgot password errors', async () => {
            mockHttpClient.post.mockRejectedValue(new Error('Network error'));

            const result = await adminAuthService.forgotPassword('admin@example.com');

            expect(result.success).toBe(false);
        });
    });

    describe('resetPassword', () => {
        it('resets password successfully', async () => {
            mockHttpClient.post.mockResolvedValue({
                data: { success: true, message: 'Password reset' },
            } as any);

            const result = await adminAuthService.resetPassword('token', 'newpassword');

            expect(result.success).toBe(true);
        });

        it('handles reset password errors', async () => {
            mockHttpClient.post.mockRejectedValue(new Error('Network error'));

            const result = await adminAuthService.resetPassword('token', 'newpassword');

            expect(result.success).toBe(false);
        });
    });
});

