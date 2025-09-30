import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, SupportedLanguage, supportedLanguages } from '../translations';
import { reactNativeTranslateService } from '../services/reactNativeTranslateService';

export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  t: (key: string) => string;
  tAuto: (key: string) => Promise<string>;
  translateDynamicText: (text: string) => Promise<string>;
  translateObject: (obj: any) => Promise<any>;
  detectLanguage: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
        setCurrentLanguage(savedLanguage as SupportedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (language: SupportedLanguage) => {
    try {
      setCurrentLanguage(language);
      await AsyncStorage.setItem('selectedLanguage', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[currentLanguage as keyof typeof translations];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English if key not found
          value = translations.en;
          for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
              value = value[k];
            } else {
              // If not found in static translations, return the key as-is
              // This will be handled by the AutoTranslateText component
              return key;
            }
          }
          break;
        }
      }
      
      return typeof value === 'string' ? value : key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  // Enhanced t function that automatically translates text not found in static translations
  const tAuto = async (key: string): Promise<string> => {
    // First try static translation
    const staticTranslation = t(key);
    if (staticTranslation !== key) {
      return staticTranslation;
    }

    // If not found in static translations and not English, translate dynamically
    if (currentLanguage !== 'en') {
      try {
        const translated = await translateDynamicText(key);
        return translated;
      } catch (error) {
        console.error('Auto translation failed:', error);
        return key;
      }
    }

    return key;
  };

  const translateDynamicText = async (text: string): Promise<string> => {
    if (currentLanguage === 'en') {
      return text;
    }

    if (!text.trim()) {
      return text;
    }

    setIsTranslating(true);
    try {
      const result = await reactNativeTranslateService.translateText(text, currentLanguage, 'en');
      return result.translatedText;
    } catch (error) {
      console.error('Google Translate error:', error);
      return text; // Return original on error
    } finally {
      setIsTranslating(false);
    }
  };

  const translateObject = async (obj: any): Promise<any> => {
    if (currentLanguage === 'en') {
      return obj;
    }

    setIsTranslating(true);
    try {
      return await reactNativeTranslateService.translateObject(obj, currentLanguage, 'en');
    } catch (error) {
      console.error('Object translation error:', error);
      return obj; // Return original on error
    } finally {
      setIsTranslating(false);
    }
  };

  const detectLanguage = async (text: string): Promise<string> => {
    try {
      const result = await reactNativeTranslateService.detectLanguage(text);
      return result.language;
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    tAuto,
    translateDynamicText,
    translateObject,
    detectLanguage,
    isTranslating,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};