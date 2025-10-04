import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';

interface Props { 
  title?: string; 
  showBack?: boolean; 
  onBackPress?: () => void;
  showLogo?: boolean;
}

const AppHeader: React.FC<Props> = ({ title, showBack, onBackPress, showLogo }) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <View style={[styles.customHeader, { backgroundColor: theme.colors.surface }]}>
      {showBack ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
          onPress={onBackPress || (() => navigation.goBack())}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      ) : null}
      {showLogo ? (
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/AppIcons/playstore.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          {title ? (
            <Text variant="titleLarge" style={[styles.titleWithLogo, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
          ) : null}
        </View>
      ) : title ? (
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  customHeader: {
    height: 56,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    marginRight: 8,
    paddingVertical: 4,
    paddingRight: 8,
    paddingLeft: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: 24,
  },
  titleWithLogo: {
    flex: 1,
  },
});

export default AppHeader;
