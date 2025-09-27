/**
 * Analytics Service
 * 
 * Comprehensive analytics and monitoring system for tracking
 * user behavior, performance metrics, and business KPIs.
 */

import { secureLog, isDevelopment, isProduction } from '../config/environment';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserProperties {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface PerformanceEvent {
  metric: string;
  value: number;
  unit: string;
  context?: Record<string, any>;
}

class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized = false;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.startFlushTimer();
    
    secureLog('info', 'Analytics service initialized', {
      sessionId: this.sessionId,
      environment: isDevelopment() ? 'development' : 'production',
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer() {
    if (this.flushTimer) return;
    
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  private stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // Public API methods
  identify(userId: string, properties?: Partial<UserProperties>) {
    this.userId = userId;
    
    const event: AnalyticsEvent = {
      name: 'user_identified',
      properties: {
        userId,
        ...properties,
        sessionId: this.sessionId,
      },
      timestamp: Date.now(),
      userId,
      sessionId: this.sessionId,
    };
    
    this.trackEvent(event);
    
    secureLog('info', 'User identified', { userId, properties });
  }

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };
    
    this.trackEvent(event);
  }

  trackScreen(screenName: string, properties?: Record<string, any>) {
    this.track('screen_viewed', {
      screen_name: screenName,
      ...properties,
    });
  }

  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  trackBusinessEvent(eventName: string, properties?: Record<string, any>) {
    this.track('business_event', {
      event_name: eventName,
      ...properties,
    });
  }

  trackPerformance(metric: string, value: number, unit: string, context?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: 'performance_metric',
      properties: {
        metric,
        value,
        unit,
        context,
        sessionId: this.sessionId,
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };
    
    this.trackEvent(event);
  }

  trackError(error: Error, context?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: 'error_occurred',
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        error_name: error.name,
        context,
        sessionId: this.sessionId,
      },
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };
    
    this.trackEvent(event);
    
    secureLog('error', 'Error tracked', { 
      error: error.message, 
      context 
    });
  }

  trackConversion(conversionType: string, value?: number, properties?: Record<string, any>) {
    this.track('conversion', {
      conversion_type: conversionType,
      value,
      ...properties,
    });
  }

  setUserProperties(properties: Partial<UserProperties>) {
    if (!this.userId) {
      secureLog('warn', 'Cannot set user properties without user ID');
      return;
    }
    
    this.track('user_properties_updated', {
      ...properties,
      userId: this.userId,
    });
  }

  private trackEvent(event: AnalyticsEvent) {
    this.eventQueue.push(event);
    
    // Flush immediately if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
    
    // Log in development
    if (isDevelopment()) {
      secureLog('debug', 'Analytics event tracked', {
        name: event.name,
        properties: event.properties,
      });
    }
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;
    
    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      // In a real implementation, send to analytics service
      await this.sendToAnalyticsService(eventsToFlush);
      
      secureLog('info', 'Analytics events flushed', {
        count: eventsToFlush.length,
      });
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue.unshift(...eventsToFlush);
      
      secureLog('error', 'Failed to flush analytics events', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventCount: eventsToFlush.length,
      });
    }
  }

  private async sendToAnalyticsService(events: AnalyticsEvent[]) {
    // Simulate API call - replace with actual analytics service
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (isDevelopment()) {
      console.log('Analytics events sent:', events);
    }
  }

  // Flush events immediately (useful for app backgrounding)
  async flush() {
    await this.flushEvents();
  }

  // Reset session (useful for user logout)
  reset() {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.eventQueue = [];
    
    secureLog('info', 'Analytics session reset');
  }

  // Cleanup
  destroy() {
    this.stopFlushTimer();
    this.flushEvents();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track(name, properties);
};

export const trackScreen = (screenName: string, properties?: Record<string, any>) => {
  analytics.trackScreen(screenName, properties);
};

export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  analytics.trackUserAction(action, properties);
};

export const trackBusinessEvent = (eventName: string, properties?: Record<string, any>) => {
  analytics.trackBusinessEvent(eventName, properties);
};

export const trackPerformance = (metric: string, value: number, unit: string, context?: Record<string, any>) => {
  analytics.trackPerformance(metric, value, unit, context);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackConversion = (conversionType: string, value?: number, properties?: Record<string, any>) => {
  analytics.trackConversion(conversionType, value, properties);
};
