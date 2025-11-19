/**
 * Network Connectivity Test Utility
 * Helps diagnose network connectivity issues
 */

import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/environment';

export async function testNetworkConnectivity(): Promise<{
    success: boolean;
    error?: string;
    details?: any;
}> {
    try {
        console.log('🔍 Testing network connectivity...');
        console.log('📱 Platform:', Platform.OS, Platform.Version);
        console.log('🌐 API Base URL:', API_BASE_URL);

        // Try a simple fetch request
        const testUrl = `${API_BASE_URL.replace('/api', '')}/health`;
        console.log('🔗 Testing URL:', testUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(testUrl, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            clearTimeout(timeoutId);

            console.log('✅ Network test successful:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
            });

            return {
                success: true,
                details: {
                    status: response.status,
                    statusText: response.statusText,
                },
            };
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            throw fetchError;
        }
    } catch (error: any) {
        console.error('❌ Network test failed:', {
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack,
        });

        return {
            success: false,
            error: error.message || 'Network test failed',
            details: {
                name: error.name,
                code: error.code,
                message: error.message,
            },
        };
    }
}

