import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme, Portal, Searchbar, Chip, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { supportedLanguages, SupportedLanguage } from '../translations';
import { reactNativeTranslateService } from '../services/reactNativeTranslateService';

interface LanguageSelectorProps {
  visible: boolean;
  onDismiss: () => void;
}

export const EnhancedLanguageSelector: React.FC<LanguageSelectorProps> = ({
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

    // Dismiss the modal immediately to prevent flash
    onDismiss();
    
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
      }, 200);

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

  const getPopularLanguages = () => {
    const popularCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru'];
    return supportedLanguages.filter(lang => popularCodes.includes(lang.code));
  };

  const getRegionalLanguages = () => {
    const regionalCodes = ['en-GB', 'en-AU', 'en-CA', 'es-AR', 'es-MX', 'pt-BR', 'fr-CA', 'zh-TW', 'zh-HK'];
    return supportedLanguages.filter(lang => regionalCodes.includes(lang.code));
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
        <View style={styles.modalOverlay}>
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
              disabled={isTranslatingLanguage}
            >
              {t('common.close')}
            </Button>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search languages..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              inputStyle={{ color: theme.colors.onSurface }}
              iconColor={theme.colors.onSurfaceVariant}
              editable={!isTranslatingLanguage}
            />
          </View>

          {/* Translation Progress */}
          {isTranslatingLanguage && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginLeft: 8 }}>
                  Translating app to {supportedLanguages.find(l => l.code === selectedLanguage)?.name}...
                </Text>
              </View>
              <ProgressBar 
                progress={translationProgress / 100} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 }}>
                {translationProgress}% complete
              </Text>
            </View>
          )}

          {/* Language Count */}
          <View style={styles.countContainer}>
            <Chip 
              mode="outlined" 
              compact
              style={styles.countChip}
            >
              {filteredLanguages.length} languages
            </Chip>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.languageList}>
              {/* Popular Languages Section */}
              {!searchQuery && (
                <>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Popular Languages
                  </Text>
                  {getPopularLanguages().map((language) => (
                    <TouchableOpacity
                      key={language.code}
                      style={[
                        styles.languageItem,
                        {
                          backgroundColor: selectedLanguage === language.code
                            ? theme.colors.primaryContainer
                            : theme.colors.surface,
                          borderColor: theme.colors.outline,
                          opacity: isTranslatingLanguage ? 0.6 : 1,
                        },
                      ]}
                      onPress={() => handleLanguageSelect(language.code as SupportedLanguage)}
                      disabled={isTranslatingLanguage}
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
                            {getLanguageDisplayName(language)}
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
                </>
              )}

              {/* All Languages Section */}
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {searchQuery ? 'Search Results' : 'All Languages'}
              </Text>
              {filteredLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    {
                      backgroundColor: selectedLanguage === language.code
                        ? theme.colors.primaryContainer
                        : theme.colors.surface,
                      borderColor: theme.colors.outline,
                      opacity: isTranslatingLanguage ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => handleLanguageSelect(language.code as SupportedLanguage)}
                  disabled={isTranslatingLanguage}
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
                        {getLanguageDisplayName(language)}
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
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '15%',
    paddingBottom: '15%',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    maxHeight: '85%',
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    elevation: 0,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  countChip: {
    alignSelf: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  languageList: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontWeight: '500',
  },
  languageCode: {
    marginTop: 2,
  },
});

export default EnhancedLanguageSelector;
