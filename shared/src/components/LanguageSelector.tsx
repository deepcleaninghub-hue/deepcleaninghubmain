import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme, Portal, Searchbar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { supportedLanguages, SupportedLanguage } from '../translations';
import { googleTranslateService } from '../services/googleTranslateService';

interface LanguageSelectorProps {
  visible: boolean;
  onDismiss: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onDismiss,
}) => {
  const theme = useTheme();
  const { currentLanguage, setLanguage, t, isTranslating } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentLanguage as SupportedLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTranslatingLanguage, setIsTranslatingLanguage] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [filteredLanguages, setFilteredLanguages] = useState(supportedLanguages);

  // Filter languages based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = supportedLanguages.filter(lang => 
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLanguages(filtered);
    } else {
      setFilteredLanguages(supportedLanguages);
    }
  }, [searchQuery]);

  const handleLanguageSelect = async (language: SupportedLanguage) => {
    if (language === currentLanguage) {
      onDismiss();
      return;
    }

    setSelectedLanguage(language);
    setIsTranslatingLanguage(true);
    setTranslationProgress(0);

    try {
      // Simulate translation progress
      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Set the language (this will trigger translation of all text)
      await setLanguage(language);
      
      // Complete the progress
      clearInterval(progressInterval);
      setTranslationProgress(100);
      
      // Wait a moment to show completion
      setTimeout(() => {
        setIsTranslatingLanguage(false);
        setTranslationProgress(0);
        onDismiss();
      }, 500);

    } catch (error) {
      console.error('Language change error:', error);
      setIsTranslatingLanguage(false);
      setTranslationProgress(0);
    }
  };

  const getLanguageDisplayName = (language: any) => {
    if (language.nativeName && language.nativeName !== language.name) {
      return `${language.name} (${language.nativeName})`;
    }
    return language.name;
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
              {t('language.selectLanguage')}
            </Text>
            <Button
              mode="text"
              onPress={onDismiss}
              icon="close"
              textColor={theme.colors.primary}
            >
              {t('common.close')}
            </Button>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.languageList}>
              {supportedLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    {
                      backgroundColor: selectedLanguage === language.code
                        ? theme.colors.primaryContainer
                        : theme.colors.surface,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                  onPress={() => handleLanguageSelect(language.code as SupportedLanguage)}
                >
                  <View style={styles.languageItemContent}>
                    <Text style={styles.flag}>{language.flag}</Text>
                    <View style={styles.languageInfo}>
                      <Text
                        variant="titleMedium"
                        style={[
                          styles.languageName,
                          {
                            color: selectedLanguage === language.code
                              ? theme.colors.onPrimaryContainer
                              : theme.colors.onSurface,
                          },
                        ]}
                      >
                        {language.name}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={[
                          styles.languageCode,
                          {
                            color: selectedLanguage === language.code
                              ? theme.colors.onPrimaryContainer
                              : theme.colors.onSurfaceVariant,
                          },
                        ]}
                      >
                        {language.code.toUpperCase()}
                      </Text>
                    </View>
                    {selectedLanguage === language.code && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.colors.outline }]}>
            <Button
              mode="contained"
              onPress={onDismiss}
              style={[styles.doneButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
            >
              {t('common.done')}
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
    marginHorizontal: 20,
    marginBottom: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  languageList: {
    padding: 20,
  },
  languageItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  languageCode: {
    opacity: 0.7,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  doneButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default LanguageSelector;
