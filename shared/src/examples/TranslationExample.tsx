/**
 * Translation Example Component
 * 
 * Demonstrates how to use the Google Translate integration
 */

import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useGoogleTranslate } from '../hooks/useGoogleTranslate';
import { useLanguage } from '../contexts/LanguageContext';
import { AutoTranslateText } from '../components/AutoTranslateText';

export const TranslationExample: React.FC = () => {
  const { translate, translateData, detect, isTranslating } = useGoogleTranslate();
  const { currentLanguage, setLanguage } = useLanguage();
  const [customText, setCustomText] = useState('Hello, this is a test message!');
  const [translatedText, setTranslatedText] = useState('');

  const handleTranslateText = async () => {
    try {
      const result = await translate(customText);
      setTranslatedText(result);
    } catch (error) {
      Alert.alert('Translation Error', 'Failed to translate text');
    }
  };

  const handleDetectLanguage = async () => {
    try {
      const language = await detect(customText);
      Alert.alert('Language Detection', `Detected language: ${language}`);
    } catch (error) {
      Alert.alert('Detection Error', 'Failed to detect language');
    }
  };

  const handleTranslateObject = async () => {
    try {
      const testObject = {
        title: 'Welcome to DeepClean',
        description: 'Professional cleaning services',
        features: ['Eco-friendly', 'Reliable', 'Affordable'],
      };
      
      const translated = await translateData(testObject);
      console.log('Translated object:', translated);
      Alert.alert('Object Translation', 'Check console for translated object');
    } catch (error) {
      Alert.alert('Translation Error', 'Failed to translate object');
    }
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation Examples</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Language: {currentLanguage}</Text>
        <View style={styles.buttonRow}>
          <Button title="English" onPress={() => changeLanguage('en')} />
          <Button title="Spanish" onPress={() => changeLanguage('es')} />
          <Button title="French" onPress={() => changeLanguage('fr')} />
          <Button title="German" onPress={() => changeLanguage('de')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auto-Translate Text Component</Text>
        <AutoTranslateText style={styles.autoText}>
          This text will automatically translate when you change the language!
        </AutoTranslateText>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Translation</Text>
        <Text style={styles.label}>Text to translate:</Text>
        <Text style={styles.input}>{customText}</Text>
        
        <View style={styles.buttonRow}>
          <Button 
            title="Translate" 
            onPress={handleTranslateText}
            disabled={isTranslating}
          />
          <Button 
            title="Detect Language" 
            onPress={handleDetectLanguage}
            disabled={isTranslating}
          />
        </View>
        
        {translatedText ? (
          <View style={styles.resultContainer}>
            <Text style={styles.label}>Translated:</Text>
            <Text style={styles.result}>{translatedText}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Object Translation</Text>
        <Button 
          title="Translate Test Object" 
          onPress={handleTranslateObject}
          disabled={isTranslating}
        />
      </View>

      {isTranslating && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Translating...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    fontSize: 16,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  resultContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 5,
  },
  result: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  autoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TranslationExample;
