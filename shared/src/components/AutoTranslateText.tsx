/**
 * AutoTranslateText Component
 * 
 * Automatically translates text using Google Translate API
 * Falls back to static translations if available
 */

import React, { useState, useEffect } from 'react';
import { Text, TextProps } from 'react-native';

interface AutoTranslateTextProps extends TextProps {
  children: string;
  fallback?: string;
  showLoading?: boolean;
  loadingText?: string;
  useStaticFirst?: boolean; // Try static translation first, then Google Translate
  t?: (key: string) => string; // Translation function
  translateDynamicText?: (text: string) => Promise<string>; // Dynamic translation function
  currentLanguage?: string; // Current language
}

const AutoTranslateText: React.FC<AutoTranslateTextProps> = ({
  children,
  fallback,
  showLoading = false,
  loadingText = 'Translating...',
  useStaticFirst = true,
  t,
  translateDynamicText,
  currentLanguage = 'en',
  ...textProps
}) => {
  const [translatedText, setTranslatedText] = useState<string>(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      // If English, no translation needed
      if (currentLanguage === 'en') {
        setTranslatedText(children);
        return;
      }

      // Skip if children is empty or only whitespace
      if (!children || !children.trim()) {
        setTranslatedText(children);
        return;
      }

      // Try static translation first if enabled and t function is provided
      if (useStaticFirst && t) {
        const staticTranslation = t(children);
        if (staticTranslation !== children) {
          setTranslatedText(staticTranslation);
          return;
        }
      }

      // Use Google Translate for dynamic translation if function is provided
      if (translateDynamicText) {
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
      } else {
        // If no translation functions provided, just use the original text
        setTranslatedText(children);
      }
    };

    translateText();
  }, [children, currentLanguage, translateDynamicText, t, fallback, useStaticFirst]);

  const displayText = isLoading && showLoading ? loadingText : translatedText;

  return <Text {...textProps}>{displayText}</Text>;
};

AutoTranslateText.displayName = 'AutoTranslateText';

export default AutoTranslateText;