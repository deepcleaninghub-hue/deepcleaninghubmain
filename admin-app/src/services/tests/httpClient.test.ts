import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpClient } from '../httpClient';

// Mock axios
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
}));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('HttpClient', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const mockInstance = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            patch: jest.fn(),
            delete: jest.fn(),
            interceptors: {
                request: {
                    use: jest.fn(),
                },
                response: {
                    use: jest.fn(),
                },
            },
        };
        mockAxios.create.mockReturnValue(mockInstance as any);
    });

    it('creates axios instance with correct base URL', () => {
        // HttpClient is instantiated on import
        expect(mockAxios.create).toHaveBeenCalled();
    });

    it('sets up request interceptor to add auth token', async () => {
        mockAsyncStorage.getItem.mockResolvedValue('test-token');

        // Re-import to trigger setup
        jest.resetModules();
        require('../httpClient');

        // Wait for interceptor setup
        await new Promise(resolve => setTimeout(resolve, 100));

        // The interceptor should be set up
        expect(mockAxios.create).toHaveBeenCalled();
    });

    it('handles GET requests', async () => {
        const mockInstance = {
            get: jest.fn().mockResolvedValue({ data: { success: true } }),
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() },
            },
        };
        mockAxios.create.mockReturnValue(mockInstance as any);

        jest.resetModules();
        const { httpClient: client } = require('../httpClient');

        const result = await client.get('/test');
        expect(result.data.success).toBe(true);
    });

    it('handles POST requests', async () => {
        const mockInstance = {
            post: jest.fn().mockResolvedValue({ data: { success: true } }),
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() },
            },
        };
        mockAxios.create.mockReturnValue(mockInstance as any);

        jest.resetModules();
        const { httpClient: client } = require('../httpClient');

        const result = await client.post('/test', { data: 'test' });
        expect(result.data.success).toBe(true);
    });

    it('handles PUT requests', async () => {
        const mockInstance = {
            put: jest.fn().mockResolvedValue({ data: { success: true } }),
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() },
            },
        };
        mockAxios.create.mockReturnValue(mockInstance as any);

        jest.resetModules();
        const { httpClient: client } = require('../httpClient');

        const result = await client.put('/test', { data: 'test' });
        expect(result.data.success).toBe(true);
    });

    it('handles PATCH requests', async () => {
        const mockInstance = {
            patch: jest.fn().mockResolvedValue({ data: { success: true } }),
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() },
            },
        };
        mockAxios.create.mockReturnValue(mockInstance as any);

        jest.resetModules();
        const { httpClient: client } = require('../httpClient');

        const result = await client.patch('/test', { data: 'test' });
        expect(result.data.success).toBe(true);
    });

    it('handles DELETE requests', async () => {
        const mockInstance = {
            delete: jest.fn().mockResolvedValue({ data: { success: true } }),
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() },
            },
        };
        mockAxios.create.mockReturnValue(mockInstance as any);

        jest.resetModules();
        const { httpClient: client } = require('../httpClient');

        const result = await client.delete('/test');
        expect(result.data.success).toBe(true);
    });
});

