/**
 * Bundle Optimization Utilities
 * 
 * Advanced bundle optimization techniques for React Native applications
 * including code splitting, lazy loading, and performance monitoring.
 */

import { secureLog, isDevelopment } from '../config/environment';

export interface BundleMetrics {
  totalSize: number;
  jsSize: number;
  assetsSize: number;
  modulesCount: number;
  chunksCount: number;
  loadTime: number;
  parseTime: number;
  executeTime: number;
}

export interface OptimizationConfig {
  enableCodeSplitting: boolean;
  enableLazyLoading: boolean;
  enableTreeShaking: boolean;
  enableMinification: boolean;
  enableCompression: boolean;
  maxChunkSize: number;
  preloadThreshold: number;
  cacheStrategy: 'memory' | 'disk' | 'hybrid';
}

class BundleOptimizationManager {
  private config: OptimizationConfig = {
    enableCodeSplitting: true,
    enableLazyLoading: true,
    enableTreeShaking: true,
    enableMinification: true,
    enableCompression: true,
    maxChunkSize: 250 * 1024, // 250KB
    preloadThreshold: 0.8, // 80% of viewport
    cacheStrategy: 'hybrid',
  };

  private metrics: BundleMetrics = {
    totalSize: 0,
    jsSize: 0,
    assetsSize: 0,
    modulesCount: 0,
    chunksCount: 0,
    loadTime: 0,
    parseTime: 0,
    executeTime: 0,
  };

  private loadedChunks: Set<string> = new Set();
  private preloadedChunks: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  // Lazy loading utilities
  createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ): React.LazyExoticComponent<T> {
    if (!this.config.enableLazyLoading) {
      // Return synchronous component if lazy loading is disabled
      return importFn().then(module => module.default) as any;
    }

    return React.lazy(importFn);
  }

  // Code splitting utilities
  splitRoute(routeName: string, importFn: () => Promise<any>) {
    if (!this.config.enableCodeSplitting) {
      return importFn();
    }

    const chunkName = `route_${routeName}`;
    
    if (this.loadedChunks.has(chunkName)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(chunkName)) {
      return this.loadingPromises.get(chunkName);
    }

    const loadingPromise = this.loadChunk(chunkName, importFn);
    this.loadingPromises.set(chunkName, loadingPromise);

    return loadingPromise;
  }

  private async loadChunk(chunkName: string, importFn: () => Promise<any>) {
    const startTime = Date.now();
    
    try {
      secureLog('info', 'Loading chunk', { chunkName });
      
      const module = await importFn();
      this.loadedChunks.add(chunkName);
      
      const loadTime = Date.now() - startTime;
      this.updateMetrics({ loadTime });
      
      secureLog('info', 'Chunk loaded successfully', { 
        chunkName, 
        loadTime: `${loadTime}ms` 
      });
      
      return module;
    } catch (error) {
      secureLog('error', 'Failed to load chunk', { 
        chunkName, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    } finally {
      this.loadingPromises.delete(chunkName);
    }
  }

  // Preloading utilities
  preloadChunk(chunkName: string, importFn: () => Promise<any>) {
    if (this.preloadedChunks.has(chunkName) || this.loadedChunks.has(chunkName)) {
      return Promise.resolve();
    }

    secureLog('info', 'Preloading chunk', { chunkName });
    
    const preloadPromise = this.loadChunk(chunkName, importFn);
    this.preloadedChunks.add(chunkName);
    
    return preloadPromise;
  }

  // Bundle analysis
  analyzeBundle(): BundleMetrics {
    if (isDevelopment()) {
      // In development, return mock metrics
      return {
        totalSize: 2 * 1024 * 1024, // 2MB
        jsSize: 1.5 * 1024 * 1024, // 1.5MB
        assetsSize: 0.5 * 1024 * 1024, // 500KB
        modulesCount: 150,
        chunksCount: 8,
        loadTime: 1200,
        parseTime: 800,
        executeTime: 400,
      };
    }

    return { ...this.metrics };
  }

  // Performance monitoring
  startPerformanceMonitoring() {
    if (typeof performance === 'undefined') return;

    // Monitor bundle load time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (entry.entryType === 'navigation') {
          this.updateMetrics({
            loadTime: entry.loadEventEnd - entry.loadEventStart,
            parseTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            executeTime: entry.loadEventEnd - entry.domContentLoadedEventEnd,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
  }

  // Cache management
  async clearCache() {
    try {
      // Clear loaded chunks
      this.loadedChunks.clear();
      this.preloadedChunks.clear();
      this.loadingPromises.clear();
      
      // Clear any stored cache
      if (typeof caches !== 'undefined') {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
      
      secureLog('info', 'Bundle cache cleared');
    } catch (error) {
      secureLog('error', 'Failed to clear cache', { error });
    }
  }

  // Memory management
  optimizeMemory() {
    // Clear unused chunks
    const unusedChunks = Array.from(this.loadedChunks).filter(
      chunk => !this.isChunkInUse(chunk)
    );
    
    unusedChunks.forEach(chunk => {
      this.loadedChunks.delete(chunk);
      secureLog('info', 'Removed unused chunk', { chunk });
    });
    
    // Force garbage collection if available
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }

  private isChunkInUse(chunkName: string): boolean {
    // Simple heuristic - in a real app, you'd track actual usage
    return chunkName.includes('route_') || chunkName.includes('component_');
  }

  // Update metrics
  private updateMetrics(updates: Partial<BundleMetrics>) {
    this.metrics = { ...this.metrics, ...updates };
  }

  // Configuration management
  updateConfig(newConfig: Partial<OptimizationConfig>) {
    this.config = { ...this.config, ...newConfig };
    secureLog('info', 'Bundle optimization config updated', { config: this.config });
  }

  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  // Get loaded chunks
  getLoadedChunks(): string[] {
    return Array.from(this.loadedChunks);
  }

  // Get preloaded chunks
  getPreloadedChunks(): string[] {
    return Array.from(this.preloadedChunks);
  }

  // Check if chunk is loaded
  isChunkLoaded(chunkName: string): boolean {
    return this.loadedChunks.has(chunkName);
  }

  // Get loading statistics
  getLoadingStats() {
    return {
      loadedChunks: this.loadedChunks.size,
      preloadedChunks: this.preloadedChunks.size,
      loadingPromises: this.loadingPromises.size,
      metrics: this.metrics,
    };
  }
}

// Export singleton instance
export const bundleOptimizationManager = new BundleOptimizationManager();

// Export convenience functions
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => bundleOptimizationManager.createLazyComponent(importFn, fallback);

export const splitRoute = (routeName: string, importFn: () => Promise<any>) => 
  bundleOptimizationManager.splitRoute(routeName, importFn);

export const preloadChunk = (chunkName: string, importFn: () => Promise<any>) => 
  bundleOptimizationManager.preloadChunk(chunkName, importFn);

export const analyzeBundle = () => bundleOptimizationManager.analyzeBundle();
export const clearCache = () => bundleOptimizationManager.clearCache();
export const optimizeMemory = () => bundleOptimizationManager.optimizeMemory();
export const updateOptimizationConfig = (config: Partial<OptimizationConfig>) => 
  bundleOptimizationManager.updateConfig(config);
export const getOptimizationConfig = () => bundleOptimizationManager.getConfig();
export const getLoadingStats = () => bundleOptimizationManager.getLoadingStats();

// Initialize performance monitoring
bundleOptimizationManager.startPerformanceMonitoring();

// Memory optimization on app background
if (typeof AppState !== 'undefined') {
  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'background') {
      bundleOptimizationManager.optimizeMemory();
    }
  });
}
