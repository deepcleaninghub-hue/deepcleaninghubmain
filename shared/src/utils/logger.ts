/**
 * Production-safe logger utility
 * Only logs in development/staging, silent in production
 */

import { config } from '../config/environment';

const isDevelopment = config.ENVIRONMENT === 'development' || config.ENVIRONMENT === 'staging';

export const logger = {
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },

    warn: (...args: any[]) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },

    error: (...args: any[]) => {
        // Always log errors, even in production
        console.error(...args);
    },

    debug: (...args: any[]) => {
        if (isDevelopment && config.LOG_LEVEL === 'debug') {
            console.log('[DEBUG]', ...args);
        }
    },
};

// For production builds, suppress all console methods except error
if (!isDevelopment) {
    // @ts-ignore
    console.log = () => { };
    // @ts-ignore
    console.info = () => { };
    // @ts-ignore
    console.warn = () => { };
    // @ts-ignore
    console.debug = () => { };
    // console.error stays active
}

export default logger;

