/**
 * Custom hook for Google Translate integration
 * 
 * Provides easy access to translation functions throughout the app
 */

import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const useGoogleTranslate = () => {
  const { 
    currentLanguage, 
    translateDynamicText, 
    translateObject, 
    detectLanguage, 
    isTranslating 
  } = useLanguage();

  /**
   * Translate a single text string
   */
  const translate = useCallback(async (text: string): Promise<string> => {
    return await translateDynamicText(text);
  }, [translateDynamicText]);

  /**
   * Translate an entire object/array recursively
   */
  const translateData = useCallback(async (data: any): Promise<any> => {
    return await translateObject(data);
  }, [translateObject]);

  /**
   * Detect the language of text
   */
  const detect = useCallback(async (text: string): Promise<string> => {
    return await detectLanguage(text);
  }, [detectLanguage]);

  /**
   * Translate multiple texts in batch
   */
  const translateBatch = useCallback(async (texts: string[]): Promise<string[]> => {
    const results = await Promise.all(texts.map(text => translate(text)));
    return results;
  }, [translate]);

  /**
   * Translate with fallback - if translation fails, return original
   */
  const translateWithFallback = useCallback(async (text: string, fallback?: string): Promise<string> => {
    try {
      const translated = await translate(text);
      return translated || fallback || text;
    } catch (error) {
      console.error('Translation with fallback failed:', error);
      return fallback || text;
    }
  }, [translate]);

  /**
   * Check if text needs translation (not English or already translated)
   */
  const needsTranslation = useCallback((text: string): boolean => {
    return currentLanguage !== 'en' && text.trim().length > 0;
  }, [currentLanguage]);

  /**
   * Get translation status
   */
  const getTranslationStatus = useCallback(() => {
    return {
      isTranslating,
      currentLanguage,
      isEnglish: currentLanguage === 'en',
    };
  }, [isTranslating, currentLanguage]);

  return {
    // Core functions
    translate,
    translateData,
    detect,
    translateBatch,
    translateWithFallback,
    
    // Utility functions
    needsTranslation,
    getTranslationStatus,
    
    // State
    isTranslating,
    currentLanguage,
  };
};

export default useGoogleTranslate;
