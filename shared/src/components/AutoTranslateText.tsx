/**
 * AutoTranslateText Component
 * 
 * Automatically translates text using Google Translate API
 * Falls back to static translations if available
 */

import React, { useState, useEffect } from 'react';
import { Text, TextProps } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface AutoTranslateTextProps extends TextProps {
  children: string;
  fallback?: string;
  showLoading?: boolean;
  loadingText?: string;
  useStaticFirst?: boolean; // Try static translation first, then Google Translate
}

export const AutoTranslateText: React.FC<AutoTranslateTextProps> = ({
  children,
  fallback,
  showLoading = false,
  loadingText = 'Translating...',
  useStaticFirst = true,
  ...textProps
}) => {
  const { t, translateDynamicText, currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      // If English, no translation needed
      if (currentLanguage === 'en') {
        setTranslatedText(children);
        return;
      }

      // Try static translation first if enabled
      if (useStaticFirst) {
        const staticTranslation = t(children);
        if (staticTranslation !== children) {
          setTranslatedText(staticTranslation);
          return;
        }
      }

      // Use Google Translate for dynamic translation
      setIsLoading(true);
      try {
        const translated = await translateDynamicText(children);
        setTranslatedText(translated || fallback || children);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(fallback || children);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [children, currentLanguage, translateDynamicText, t, fallback, useStaticFirst]);

  const displayText = isLoading && showLoading ? loadingText : translatedText;

  return <Text {...textProps}>{displayText}</Text>;
};

export default AutoTranslateText;