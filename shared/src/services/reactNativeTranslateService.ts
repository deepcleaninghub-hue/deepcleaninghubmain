/**
 * React Native Compatible Google Translate Service
 * 
 * Uses direct HTTP calls to Google Translate API instead of the Node.js library
 * This avoids the Node.js module compatibility issues in React Native
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Google Translate API configuration
const GOOGLE_TRANSLATE_API_KEY = 'AIzaSyDhrsm-7m96Po0Awx9mANDqio-91gHJVPc';
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

class ReactNativeTranslateService {
  private memoryCache = new Map<string, { translation: string; timestamp: number }>();
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MEMORY_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes for memory cache
  private pendingTranslations = new Map<string, Promise<TranslationResult>>();
  private translationQueue = new Map<string, NodeJS.Timeout>();

  /**
   * Translate text to target language
   */
  async translateText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    if (!text.trim()) {
      return { translatedText: text };
    }

    // Check memory cache first (fastest)
    const memoryCacheKey = this.getMemoryCacheKey(text, targetLanguage, sourceLanguage);
    const memoryCached = this.getMemoryCachedTranslation(memoryCacheKey);
    if (memoryCached) {
      // Only log cache hits in development
      if (__DEV__) {
        // Memory cache hit - silent
      }
      return { translatedText: memoryCached };
    }

    // Check if there's already a pending translation for this text
    if (this.pendingTranslations.has(memoryCacheKey)) {
      return this.pendingTranslations.get(memoryCacheKey)!;
    }

    // Check persistent cache (AsyncStorage)
    const cacheKey = this.getCacheKey(text, targetLanguage, sourceLanguage);
    const cached = await this.getCachedTranslation(cacheKey);
    if (cached) {
      // Only log cache hits in development
      if (__DEV__) {
        // Persistent cache hit - silent
      }
      // Store in memory cache for faster access
      this.setMemoryCachedTranslation(memoryCacheKey, cached);
      return { translatedText: cached };
    }

    // Create a promise for this translation and store it
    const translationPromise = this.performTranslation(text, targetLanguage, sourceLanguage, memoryCacheKey, cacheKey);
    this.pendingTranslations.set(memoryCacheKey, translationPromise);
    
    try {
      const result = await translationPromise;
      return result;
    } finally {
      // Clean up the pending translation
      this.pendingTranslations.delete(memoryCacheKey);
    }
  }

  private async performTranslation(
    text: string,
    targetLanguage: string,
    sourceLanguage: string | undefined,
    memoryCacheKey: string,
    cacheKey: string
  ): Promise<TranslationResult> {
    // Only log in development and for unique texts
    if (__DEV__ && !this.memoryCache.has(memoryCacheKey)) {
      // API call - silent
    }
    
    try {
      const url = `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          source: sourceLanguage || 'auto',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Translation API error');
      }

      const translation = data.data.translations[0].translatedText;
      const detectedLanguage = data.data.translations[0].detectedSourceLanguage;
      
      // Cache the translation in both memory and persistent storage
      this.setMemoryCachedTranslation(memoryCacheKey, translation);
      await this.cacheTranslation(cacheKey, translation);

      return {
        translatedText: translation,
        detectedLanguage: detectedLanguage,
      };
    } catch (error) {
      console.error('Google Translate API error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    if (!text.trim()) {
      return { language: 'en', confidence: 0 };
    }

    try {
      const url = `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: 'en', // Need target language for detection
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Language detection API error');
      }

      const detection = data.data.translations[0].detectedSourceLanguage;
      return {
        language: detection,
        confidence: 0.95, // Google Translate doesn't provide confidence in this API
      };
    } catch (error) {
      console.error('Language detection error:', error);
      return { language: 'en', confidence: 0 };
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(
    texts: string[], 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<TranslationResult[]> {
    if (texts.length === 0) return [];

    const results: TranslationResult[] = [];
    const textsToTranslate: { text: string; index: number }[] = [];

    // Check cache for each text first
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text || !text.trim()) {
        results[i] = { translatedText: text || '' };
        continue;
      }

      // Check memory cache first
      const memoryCacheKey = this.getMemoryCacheKey(text, targetLanguage, sourceLanguage);
      const memoryCached = this.getMemoryCachedTranslation(memoryCacheKey);
      if (memoryCached) {
        results[i] = { translatedText: memoryCached };
        continue;
      }

      // Check persistent cache
      const cacheKey = this.getCacheKey(text, targetLanguage, sourceLanguage);
      const cached = await this.getCachedTranslation(cacheKey);
      if (cached) {
        results[i] = { translatedText: cached };
        // Store in memory cache
        this.setMemoryCachedTranslation(memoryCacheKey, cached);
        continue;
      }

      // Add to batch for API translation
      textsToTranslate.push({ text, index: i });
    }

    // Translate remaining texts in batch
    if (textsToTranslate.length > 0) {
      if (__DEV__) {
        // Batch API call - silent
      }
      
      try {
        const url = `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: textsToTranslate.map(item => item.text),
            target: targetLanguage,
            source: sourceLanguage || 'auto',
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || 'Batch translation API error');
        }

        const translations = data.data.translations;
        
        // Cache and store results
        textsToTranslate.forEach(({ text, index }, i) => {
          const translation = translations[i].translatedText;
          results[index] = { translatedText: translation };
          
          // Cache in both memory and persistent storage
          const memoryCacheKey = this.getMemoryCacheKey(text, targetLanguage, sourceLanguage);
          this.setMemoryCachedTranslation(memoryCacheKey, translation);
          
          const cacheKey = this.getCacheKey(text, targetLanguage, sourceLanguage);
          this.cacheTranslation(cacheKey, translation);
        });
      } catch (error) {
        console.error('Batch translation error:', error);
        throw new Error(`Batch translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  /**
   * Translate an object with nested properties
   */
  async translateObject(
    obj: any, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<any> {
    if (typeof obj === 'string') {
      const result = await this.translateText(obj, targetLanguage, sourceLanguage);
      return result.translatedText;
    }

    if (Array.isArray(obj)) {
      const translatedArray = await Promise.all(
        obj.map(item => this.translateObject(item, targetLanguage, sourceLanguage))
      );
      return translatedArray;
    }

    if (obj && typeof obj === 'object') {
      const translatedObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        translatedObj[key] = await this.translateObject(value, targetLanguage, sourceLanguage);
      }
      return translatedObj;
    }

    return obj;
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      
      // Clear persistent cache
      const keys = await AsyncStorage.getAllKeys();
      const translationKeys = keys.filter(key => key.startsWith('translation_'));
      await AsyncStorage.multiRemove(translationKeys);
      
      // All caches cleared - silent
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache size information
   */
  async getCacheSize(): Promise<{ memory: number; persistent: number }> {
    const memorySize = this.memoryCache.size;
    
    let persistentSize = 0;
    try {
      const keys = await AsyncStorage.getAllKeys();
      const translationKeys = keys.filter(key => key.startsWith('translation_'));
      persistentSize = translationKeys.length;
    } catch (error) {
      console.error('Error getting cache size:', error);
    }

    return { memory: memorySize, persistent: persistentSize };
  }

  // Private helper methods
  private getCacheKey(text: string, targetLanguage: string, sourceLanguage?: string): string {
    const source = sourceLanguage || 'auto';
    return `translation_${source}_${targetLanguage}_${this.hashString(text)}`;
  }

  private getMemoryCacheKey(text: string, targetLanguage: string, sourceLanguage?: string): string {
    const source = sourceLanguage || 'auto';
    return `${source}_${targetLanguage}_${this.hashString(text)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async getCachedTranslation(key: string): Promise<string | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const { translation, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_EXPIRY) {
          return translation;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  }

  private async cacheTranslation(key: string, translation: string): Promise<void> {
    try {
      const cacheData = {
        translation,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching translation:', error);
    }
  }

  private getMemoryCachedTranslation(key: string): string | null {
    const cached = this.memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.MEMORY_CACHE_EXPIRY) {
      return cached.translation;
    }
    if (cached) {
      this.memoryCache.delete(key);
    }
    return null;
  }

  private setMemoryCachedTranslation(key: string, translation: string): void {
    this.memoryCache.set(key, {
      translation,
      timestamp: Date.now(),
    });
  }

  // Memory cache management
  clearMemoryCache(): void {
    this.memoryCache.clear();
  }

  getMemoryCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
    };
  }

  cleanExpiredMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp >= this.MEMORY_CACHE_EXPIRY) {
        this.memoryCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const reactNativeTranslateService = new ReactNativeTranslateService();
export default reactNativeTranslateService;
