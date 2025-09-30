/**
 * useTranslatedText Hook
 * 
 * Hook for getting translated text with automatic Google Translate fallback
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const useTranslatedText = (text: string, fallback?: string) => {
  const { t, translateDynamicText, currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      // If English, no translation needed
      if (currentLanguage === 'en') {
        setTranslatedText(text);
        return;
      }

      // Try static translation first
      const staticTranslation = t(text);
      if (staticTranslation !== text) {
        setTranslatedText(staticTranslation);
        return;
      }

      // Use Google Translate for dynamic translation
      setIsLoading(true);
      try {
        const translated = await translateDynamicText(text);
        setTranslatedText(translated || fallback || text);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(fallback || text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, currentLanguage, translateDynamicText, t, fallback]);

  return { translatedText, isLoading };
};
