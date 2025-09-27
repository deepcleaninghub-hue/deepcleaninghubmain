/**
 * Offline Support Hook
 * 
 * Provides comprehensive offline functionality with caching,
 * sync capabilities, and offline state management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { secureLog } from '../config/environment';

interface OfflineData {
  timestamp: number;
  data: any;
  version: string;
}

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface UseOfflineSupportReturn {
  isOnline: boolean;
  isOffline: boolean;
  isReconnecting: boolean;
  syncQueue: SyncQueueItem[];
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>) => void;
  syncData: () => Promise<void>;
  getCachedData: <T>(key: string) => Promise<T | null>;
  setCachedData: <T>(key: string, data: T, version?: string) => Promise<void>;
  clearCache: () => Promise<void>;
  isDataStale: (key: string, maxAge?: number) => Promise<boolean>;
}

const CACHE_PREFIX = 'offline_cache_';
const SYNC_QUEUE_KEY = 'sync_queue';
const CACHE_VERSION = '1.0.0';
const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30 seconds

export const useOfflineSupport = (): UseOfflineSupportReturn => {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected && state.isInternetReachable;
      
      setIsOnline(isNowOnline || false);
      
      if (wasOffline && isNowOnline) {
        setIsReconnecting(true);
        syncData().finally(() => setIsReconnecting(false));
      }
    });

    return unsubscribe;
  }, [isOnline]);

  // Monitor app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;
      
      if (nextAppState === 'active' && isOnline) {
        syncData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isOnline]);

  // Load sync queue on mount
  useEffect(() => {
    loadSyncQueue();
  }, []);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline) {
      startAutoSync();
    } else {
      stopAutoSync();
    }

    return () => stopAutoSync();
  }, [isOnline]);

  const loadSyncQueue = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        const queue = JSON.parse(stored);
        setSyncQueue(queue);
        secureLog('info', 'Loaded sync queue', { count: queue.length });
      }
    } catch (error) {
      secureLog('error', 'Failed to load sync queue', { error });
    }
  }, []);

  const saveSyncQueue = useCallback(async (queue: SyncQueueItem[]) => {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      setSyncQueue(queue);
    } catch (error) {
      secureLog('error', 'Failed to save sync queue', { error });
    }
  }, []);

  const addToSyncQueue = useCallback(async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>) => {
    const syncItem: SyncQueueItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    const newQueue = [...syncQueue, syncItem];
    await saveSyncQueue(newQueue);
    
    secureLog('info', 'Added item to sync queue', { 
      action: item.action, 
      endpoint: item.endpoint 
    });
  }, [syncQueue, saveSyncQueue]);

  const syncData = useCallback(async () => {
    if (!isOnline || syncQueue.length === 0) return;

    secureLog('info', 'Starting data sync', { queueLength: syncQueue.length });
    
    const successfulSyncs: string[] = [];
    const failedSyncs: SyncQueueItem[] = [];

    for (const item of syncQueue) {
      try {
        // Simulate API call - replace with actual HTTP client
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Mark as successful
        successfulSyncs.push(item.id);
        secureLog('info', 'Synced item successfully', { id: item.id });
      } catch (error) {
        const updatedItem = { ...item, retries: item.retries + 1 };
        
        if (updatedItem.retries < MAX_RETRIES) {
          failedSyncs.push(updatedItem);
        } else {
          secureLog('error', 'Item failed after max retries', { 
            id: item.id, 
            retries: updatedItem.retries 
          });
        }
      }
    }

    // Update sync queue
    const remainingQueue = syncQueue.filter(
      item => !successfulSyncs.includes(item.id)
    ).concat(failedSyncs);

    await saveSyncQueue(remainingQueue);
    
    secureLog('info', 'Sync completed', { 
      successful: successfulSyncs.length,
      failed: failedSyncs.length,
      remaining: remainingQueue.length
    });
  }, [isOnline, syncQueue, saveSyncQueue]);

  const startAutoSync = useCallback(() => {
    if (syncIntervalRef.current) return;
    
    syncIntervalRef.current = setInterval(() => {
      if (appStateRef.current === 'active' && isOnline) {
        syncData();
      }
    }, SYNC_INTERVAL);
  }, [isOnline, syncData]);

  const stopAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  const getCachedData = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (cached) {
        const offlineData: OfflineData = JSON.parse(cached);
        return offlineData.data as T;
      }
      return null;
    } catch (error) {
      secureLog('error', 'Failed to get cached data', { key, error });
      return null;
    }
  }, []);

  const setCachedData = useCallback(async <T>(
    key: string, 
    data: T, 
    version: string = CACHE_VERSION
  ): Promise<void> => {
    try {
      const offlineData: OfflineData = {
        timestamp: Date.now(),
        data,
        version,
      };
      
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`, 
        JSON.stringify(offlineData)
      );
      
      secureLog('info', 'Cached data', { key, version });
    } catch (error) {
      secureLog('error', 'Failed to cache data', { key, error });
    }
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        secureLog('info', 'Cleared cache', { count: cacheKeys.length });
      }
    } catch (error) {
      secureLog('error', 'Failed to clear cache', { error });
    }
  }, []);

  const isDataStale = useCallback(async (
    key: string, 
    maxAge: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<boolean> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return true;
      
      const offlineData: OfflineData = JSON.parse(cached);
      const age = Date.now() - offlineData.timestamp;
      
      return age > maxAge;
    } catch (error) {
      secureLog('error', 'Failed to check data staleness', { key, error });
      return true;
    }
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    isReconnecting,
    syncQueue,
    addToSyncQueue,
    syncData,
    getCachedData,
    setCachedData,
    clearCache,
    isDataStale,
  };
};
