/**
 * Google Translate API Service
 * 
 * Handles all translation operations using Google Translate API
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

class GoogleTranslateService {
  private memoryCache = new Map<string, { translation: string; timestamp: number }>();
  private readonly CACHE_PREFIX = 'gt_cache_';
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MEMORY_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes for memory cache

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
      console.log('🚀 Memory cache hit');
      return { translatedText: memoryCached };
    }

    // Check persistent cache (AsyncStorage)
    const cacheKey = this.getCacheKey(text, targetLanguage, sourceLanguage);
    const cached = await this.getCachedTranslation(cacheKey);
    if (cached) {
      console.log('💾 Persistent cache hit');
      // Store in memory cache for faster access
      this.setMemoryCachedTranslation(memoryCacheKey, cached);
      return { translatedText: cached };
    }

    console.log('🌐 API call for:', text.substring(0, 50) + '...');
    try {
      const response = await fetch(GOOGLE_TRANSLATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          source: sourceLanguage || 'auto',
          key: GOOGLE_TRANSLATE_API_KEY,
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
      const response = await fetch(GOOGLE_TRANSLATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          key: GOOGLE_TRANSLATE_API_KEY,
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
      console.log(`🌐 Batch API call for ${textsToTranslate.length} texts`);
      
      try {
        const options: any = {
          from: sourceLanguage,
          to: targetLanguage,
        };

        const textsToTranslateArray = textsToTranslate.map(item => item.text);
        const translations = [];
        for (const text of textsToTranslateArray) {
          const result = await this.translateText(text, targetLanguage, sourceLanguage);
          translations.push(result.translatedText);
        }
        
        // Process results and cache them
        for (let i = 0; i < textsToTranslate.length; i++) {
          const item = textsToTranslate[i];
          if (!item) continue;
          const { text, index } = item;
          const translation = translations[i] || text;
          
          // Cache the translation
          const memoryCacheKey = this.getMemoryCacheKey(text, targetLanguage, sourceLanguage || 'en');
          const cacheKey = this.getCacheKey(text, targetLanguage, sourceLanguage || 'en');
          
          this.setMemoryCachedTranslation(memoryCacheKey, translation);
          await this.cacheTranslation(cacheKey, translation);
          
          results[index] = {
            translatedText: translation,
            detectedLanguage: sourceLanguage || 'en',
          };
        }
      } catch (error) {
        console.error('Batch translation error:', error);
        // Fill in failed translations with original text
        for (const { text, index } of textsToTranslate) {
          if (!results[index]) {
            results[index] = { translatedText: text };
          }
        }
        throw new Error(`Batch translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    try {
      // Return a basic list of supported languages
      return [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' },
        { code: 'nl', name: 'Dutch' },
        { code: 'pl', name: 'Polish' },
      ];
    } catch (error) {
      console.error('Get languages error:', error);
      return [];
    }
  }

  /**
   * Translate an entire object recursively
   */
  async translateObject(
    obj: any, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<any> {
    if (typeof obj === 'string') {
      return await this.translateText(obj, targetLanguage, sourceLanguage);
    }

    if (Array.isArray(obj)) {
      const translatedArray = [];
      for (const item of obj) {
        translatedArray.push(await this.translateObject(item, targetLanguage, sourceLanguage));
      }
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
   * Get cached translation
   */
  private async getCachedTranslation(cacheKey: string): Promise<string | null> {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { translation, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_EXPIRY) {
          return translation;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Cache retrieval error:', error);
    }
    return null;
  }

  /**
   * Cache translation
   */
  private async cacheTranslation(cacheKey: string, translation: string): Promise<void> {
    try {
      const cacheData = {
        translation,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(text: string, targetLanguage: string, sourceLanguage?: string): string {
    const source = sourceLanguage || 'auto';
    return `${this.CACHE_PREFIX}${source}_${targetLanguage}_${this.hashString(text)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clear translation cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith(this.CACHE_PREFIX)).length;
    } catch (error) {
      console.error('Cache size error:', error);
      return 0;
    }
  }

  /**
   * Get memory cache key
   */
  private getMemoryCacheKey(text: string, targetLanguage: string, sourceLanguage?: string): string {
    const source = sourceLanguage || 'auto';
    return `mem_${source}_${targetLanguage}_${this.hashString(text)}`;
  }

  /**
   * Get memory cached translation
   */
  private getMemoryCachedTranslation(key: string): string | null {
    const cached = this.memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.MEMORY_CACHE_EXPIRY) {
      return cached.translation;
    }
    // Remove expired entry
    if (cached) {
      this.memoryCache.delete(key);
    }
    return null;
  }

  /**
   * Set memory cached translation
   */
  private setMemoryCachedTranslation(key: string, translation: string): void {
    this.memoryCache.set(key, {
      translation,
      timestamp: Date.now()
    });
  }

  /**
   * Clear memory cache
   */
  clearMemoryCache(): void {
    this.memoryCache.clear();
    console.log('🧹 Memory cache cleared');
  }

  /**
   * Get memory cache stats
   */
  getMemoryCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys())
    };
  }

  /**
   * Clean expired memory cache entries
   */
  cleanExpiredMemoryCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > this.MEMORY_CACHE_EXPIRY) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired memory cache entries`);
    }
  }
}

export const googleTranslateService = new GoogleTranslateService();
export default googleTranslateService;
