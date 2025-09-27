/**
 * Cart Context
 * 
 * Centralized cart state management with caching, optimistic updates,
 * and proper error handling.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpClient } from '../services/httpClient';
import { secureLog, config } from '../config/environment';
import { CartItem, CartSummary, Service, CartContextType } from '../types';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

// Cache configuration
const CART_CACHE_KEY = 'cart_items_cache';
const CART_CACHE_TIME_KEY = 'cart_items_cache_time';
const SERVICES_CACHE_KEY = 'services_cache';
const SERVICES_CACHE_TIME_KEY = 'services_cache_time';

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    totalItems: 0,
    totalPrice: 0,
    subtotal: 0,
  });
  const [serviceCategories, setServiceCategories] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize cart when user changes
  useEffect(() => {
    const initializeCart = async () => {
      if (user && isAuthenticated && !initialized) {
        setInitialized(true);
        await Promise.all([
          refreshCart(),
          refreshServiceCategories(),
        ]);
      } else if (!isAuthenticated) {
        // Clear cart when user logs out
        setCartItems([]);
        setCartSummary({
          totalItems: 0,
          totalPrice: 0,
          subtotal: 0,
        });
        setServiceCategories([]);
        setInitialized(false);
        await clearCache();
      }
    };

    initializeCart();
  }, [user?.id, isAuthenticated, initialized]);

  const clearCache = async () => {
    try {
      await AsyncStorage.multiRemove([
        CART_CACHE_KEY,
        CART_CACHE_TIME_KEY,
        SERVICES_CACHE_KEY,
        SERVICES_CACHE_TIME_KEY,
      ]);
    } catch (error) {
      secureLog('error', 'Error clearing cache', { error });
    }
  };

  const refreshCart = useCallback(async (forceRefresh = false) => {
    console.log('🔄 refreshCart called', { forceRefresh, user: !!user, isAuthenticated });
    
    if (!user || !isAuthenticated) {
      secureLog('info', 'No user or not authenticated, skipping cart refresh');
      return;
    }
    
    try {
      // Check cache first
      if (!forceRefresh) {
        const [cachedData, cacheTime] = await Promise.all([
          AsyncStorage.getItem(CART_CACHE_KEY),
          AsyncStorage.getItem(CART_CACHE_TIME_KEY),
        ]);
        
        if (cachedData && cacheTime) {
          const timeDiff = Date.now() - parseInt(cacheTime);
          if (timeDiff < config.CACHE_DURATION) {
            const { items, summary } = JSON.parse(cachedData);
            setCartItems(items || []);
            setCartSummary(summary || { totalItems: 0, totalPrice: 0, subtotal: 0 });
            return;
          }
        }
      }
      
      setLoading(true);
      const [items, summary] = await Promise.all([
        getCartItems(),
        getCartSummary(),
      ]);
      
      const cartData = {
        items: items || [],
        summary: summary || { totalItems: 0, totalPrice: 0, subtotal: 0 },
      };
      
      setCartItems(cartData.items);
      setCartSummary(cartData.summary);
      
      // Cache the data
      await Promise.all([
        AsyncStorage.setItem(CART_CACHE_KEY, JSON.stringify(cartData)),
        AsyncStorage.setItem(CART_CACHE_TIME_KEY, Date.now().toString()),
      ]);
      
    } catch (error) {
      secureLog('error', 'Error refreshing cart', { error });
      setCartItems([]);
      setCartSummary({ totalItems: 0, totalPrice: 0, subtotal: 0 });
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  const refreshServiceCategories = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first
      if (!forceRefresh) {
        const [cachedServices, cacheTime] = await Promise.all([
          AsyncStorage.getItem(SERVICES_CACHE_KEY),
          AsyncStorage.getItem(SERVICES_CACHE_TIME_KEY),
        ]);
        
        if (cachedServices && cacheTime) {
          const timeDiff = Date.now() - parseInt(cacheTime);
          if (timeDiff < config.CACHE_DURATION) {
            const services = JSON.parse(cachedServices);
            setServiceCategories(services);
            return;
          }
        }
      }
      
      const services = await getServices();
      setServiceCategories(services);
      
      // Cache the services
      await Promise.all([
        AsyncStorage.setItem(SERVICES_CACHE_KEY, JSON.stringify(services)),
        AsyncStorage.setItem(SERVICES_CACHE_TIME_KEY, Date.now().toString()),
      ]);
      
    } catch (error) {
      secureLog('error', 'Error refreshing service categories', { error });
    }
  }, []);

  const getCartItems = async (): Promise<CartItem[]> => {
    try {
      const response = await httpClient.get<{ success: boolean; data: CartItem[] }>('/cart/items');
      return response.success ? response.data || [] : [];
    } catch (error) {
      secureLog('error', 'Error fetching cart items', { error });
      return [];
    }
  };

  const getCartSummary = async (): Promise<CartSummary> => {
    try {
      const response = await httpClient.get<{ success: boolean; data: CartSummary }>('/cart/summary');
      return response.success ? response.data || { totalItems: 0, totalPrice: 0, subtotal: 0 } : { totalItems: 0, totalPrice: 0, subtotal: 0 };
    } catch (error) {
      secureLog('error', 'Error fetching cart summary', { error });
      return { totalItems: 0, totalPrice: 0, subtotal: 0 };
    }
  };

  const getServices = async (): Promise<Service[]> => {
    try {
      const response = await httpClient.get<{ success: boolean; data: Service[] }>('/services');
      return response.success ? response.data || [] : [];
    } catch (error) {
      secureLog('error', 'Error fetching services', { error });
      return [];
    }
  };

  const isServiceInCart = useCallback((serviceId: string): boolean => {
    return cartItems.some(item => item.serviceId === serviceId);
  }, [cartItems]);

  const addToCart = useCallback(async (service: Service, calculatedPrice?: number, userInputs?: any): Promise<boolean> => {
    if (!user || !isAuthenticated) {
      Alert.alert('Error', 'Please login to add items to cart');
      return false;
    }

    try {
      setLoading(true);

      if (isServiceInCart(service.id)) {
        Alert.alert('Already in Cart', `${service.title} is already in your cart.`);
        return false;
      }

      const cartItemData = {
        service_id: service.id,
        quantity: 1,
        user_inputs: userInputs || {},
        calculated_price: calculatedPrice || service.price || 0,
      };

      const response = await httpClient.post<{ success: boolean; data: CartItem }>('/cart/items', cartItemData);
      
      if (response.success) {
        await refreshCart(true); // Force refresh to clear cache
        Alert.alert('Success', `${service.title} added to cart!`);
        return true;
      } else {
        Alert.alert('Error', 'Failed to add item to cart');
        return false;
      }
    } catch (error) {
      secureLog('error', 'Error adding to cart', { error, serviceId: service.id });
      Alert.alert('Error', 'Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, isServiceInCart, refreshCart]);

  const removeFromCart = useCallback(async (cartItemId: string): Promise<boolean> => {
    if (!user || !isAuthenticated) return false;
    
    try {
      setLoading(true);
      const response = await httpClient.delete<{ success: boolean }>(`/cart/items/${cartItemId}`);
      
      if (response.success) {
        await refreshCart(true); // Force refresh to clear cache
        return true;
      } else {
        Alert.alert('Error', 'Failed to remove item from cart');
        return false;
      }
    } catch (error) {
      secureLog('error', 'Error removing from cart', { error, cartItemId });
      Alert.alert('Error', 'Failed to remove item from cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, refreshCart]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number): Promise<boolean> => {
    if (!user || !isAuthenticated) return false;
    
    if (quantity < 1) {
      return removeFromCart(cartItemId);
    }

    try {
      setLoading(true);
      const response = await httpClient.put<{ success: boolean }>(`/cart/items/${cartItemId}`, { quantity });
      
      if (response.success) {
        await refreshCart(true); // Force refresh to clear cache
        return true;
      } else {
        Alert.alert('Error', 'Failed to update quantity');
        return false;
      }
    } catch (error) {
      secureLog('error', 'Error updating quantity', { error, cartItemId, quantity });
      Alert.alert('Error', 'Failed to update quantity');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, removeFromCart, refreshCart]);

  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!user || !isAuthenticated) return false;

    try {
      setLoading(true);
      const response = await httpClient.delete<{ success: boolean }>('/cart/clear');
      
      if (response.success) {
        setCartItems([]);
        setCartSummary({
          totalItems: 0,
          totalPrice: 0,
          subtotal: 0,
        });
        
        await clearCache();
        Alert.alert('Success', 'Cart cleared successfully');
        return true;
      } else {
        Alert.alert('Error', 'Failed to clear cart');
        return false;
      }
    } catch (error) {
      secureLog('error', 'Error clearing cart', { error });
      Alert.alert('Error', 'Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Memoize context value to prevent unnecessary re-renders
  const value: CartContextType = useMemo(() => ({
    cartItems,
    cartSummary,
    serviceCategories,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    refreshServiceCategories,
    isServiceInCart,
  }), [
    cartItems,
    cartSummary,
    serviceCategories,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    refreshServiceCategories,
    isServiceInCart,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
