/**
 * Performance Monitoring Hook
 * 
 * Provides comprehensive performance monitoring and optimization
 * for React Native applications.
 */

import { useEffect, useRef, useCallback } from 'react';
import { InteractionManager, Dimensions } from 'react-native';
import { secureLog, isDevelopment } from '../config/environment';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  bundleSize: number;
  networkLatency: number;
}

interface PerformanceThresholds {
  maxRenderTime: number;
  minFrameRate: number;
  maxMemoryUsage: number;
  maxNetworkLatency: number;
}

interface UsePerformanceMonitoringReturn {
  startTiming: (label: string) => void;
  endTiming: (label: string) => void;
  measureRender: <T>(fn: () => T) => T;
  measureAsync: <T>(fn: () => Promise<T>, label: string) => Promise<T>;
  getMetrics: () => PerformanceMetrics;
  isPerformanceGood: () => boolean;
  logPerformance: () => void;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxRenderTime: 16, // 60fps = 16ms per frame
  minFrameRate: 55, // Minimum acceptable FPS
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  maxNetworkLatency: 2000, // 2 seconds
};

export const usePerformanceMonitoring = (
  thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS
): UsePerformanceMonitoringReturn => {
  const timersRef = useRef<Map<string, number>>(new Map());
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 60,
    bundleSize: 0,
    networkLatency: 0,
  });
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(Date.now());
  const performanceObserverRef = useRef<any>(null);

  // Monitor frame rate
  useEffect(() => {
    let animationFrameId: number;
    
    const measureFrameRate = () => {
      const now = Date.now();
      const deltaTime = now - lastFrameTimeRef.current;
      
      if (deltaTime > 0) {
        const currentFrameRate = 1000 / deltaTime;
        metricsRef.current.frameRate = currentFrameRate;
        lastFrameTimeRef.current = now;
        frameCountRef.current++;
      }
      
      animationFrameId = requestAnimationFrame(measureFrameRate);
    };
    
    animationFrameId = requestAnimationFrame(measureFrameRate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Monitor memory usage (if available)
  useEffect(() => {
    if (isDevelopment()) {
      const checkMemoryUsage = () => {
        try {
          // @ts-ignore - performance.memory is not in React Native types
          if (performance.memory) {
            // @ts-ignore
            metricsRef.current.memoryUsage = performance.memory.usedJSHeapSize;
          }
        } catch (error) {
          // Memory monitoring not available
        }
      };
      
      const interval = setInterval(checkMemoryUsage, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const startTiming = useCallback((label: string) => {
    timersRef.current.set(label, Date.now());
  }, []);

  const endTiming = useCallback((label: string) => {
    const startTime = timersRef.current.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      timersRef.current.delete(label);
      
      if (isDevelopment()) {
        secureLog('debug', `Performance: ${label}`, { duration: `${duration}ms` });
      }
      
      // Update relevant metrics
      if (label.includes('render')) {
        metricsRef.current.renderTime = duration;
      } else if (label.includes('network')) {
        metricsRef.current.networkLatency = duration;
      }
    }
  }, []);

  const measureRender = useCallback(<T>(fn: () => T): T => {
    startTiming('render');
    const result = fn();
    endTiming('render');
    return result;
  }, [startTiming, endTiming]);

  const measureAsync = useCallback(async <T>(
    fn: () => Promise<T>, 
    label: string
  ): Promise<T> => {
    startTiming(label);
    try {
      const result = await fn();
      endTiming(label);
      return result;
    } catch (error) {
      endTiming(label);
      throw error;
    }
  }, [startTiming, endTiming]);

  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current };
  }, []);

  const isPerformanceGood = useCallback((): boolean => {
    const metrics = metricsRef.current;
    
    return (
      metrics.renderTime <= thresholds.maxRenderTime &&
      metrics.frameRate >= thresholds.minFrameRate &&
      metrics.memoryUsage <= thresholds.maxMemoryUsage &&
      metrics.networkLatency <= thresholds.maxNetworkLatency
    );
  }, [thresholds]);

  const logPerformance = useCallback(() => {
    const metrics = getMetrics();
    const isGood = isPerformanceGood();
    
    secureLog('info', 'Performance Metrics', {
      ...metrics,
      isGood,
      screenSize: Dimensions.get('window'),
      thresholds,
    });
  }, [getMetrics, isPerformanceGood, thresholds]);

  // Log performance periodically in development
  useEffect(() => {
    if (isDevelopment()) {
      const interval = setInterval(logPerformance, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [logPerformance]);

  return {
    startTiming,
    endTiming,
    measureRender,
    measureAsync,
    getMetrics,
    isPerformanceGood,
    logPerformance,
  };
};
