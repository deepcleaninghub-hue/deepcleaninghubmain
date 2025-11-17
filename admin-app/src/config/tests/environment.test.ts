import { API_BASE_URL, ENVIRONMENT } from '../environment';

describe('environment', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('exports API_BASE_URL', () => {
        expect(API_BASE_URL).toBeDefined();
        expect(typeof API_BASE_URL).toBe('string');
    });

    it('exports ENVIRONMENT', () => {
        expect(ENVIRONMENT).toBeDefined();
        expect(['development', 'production']).toContain(ENVIRONMENT);
    });

    it('uses default development URL when EXPO_PUBLIC_ENVIRONMENT is not production', () => {
        delete process.env.EXPO_PUBLIC_ENVIRONMENT;
        delete process.env.EXPO_PUBLIC_API_BASE_URL;

        jest.resetModules();
        const { API_BASE_URL: url } = require('../environment');

        expect(url).toContain('http://');
    });

    it('uses custom API URL when EXPO_PUBLIC_API_BASE_URL is set', () => {
        process.env.EXPO_PUBLIC_API_BASE_URL = 'https://custom-api.example.com/api';

        jest.resetModules();
        const { API_BASE_URL: url } = require('../environment');

        expect(url).toBe('https://custom-api.example.com/api');
    });

    it('uses production URL when EXPO_PUBLIC_ENVIRONMENT is production', () => {
        process.env.EXPO_PUBLIC_ENVIRONMENT = 'production';
        delete process.env.EXPO_PUBLIC_API_BASE_URL;

        jest.resetModules();
        const { API_BASE_URL: url } = require('../environment');

        expect(url).toContain('https://');
    });
});

