/**
 * Guest Cart Screen
 * 
 * Shows a login prompt for non-authenticated users trying to access cart.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export const GuestCartScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const handleLogin = () => {
    // Navigate to the Auth stack
    navigation.navigate('Auth' as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Ionicons name="cart-outline" size={80} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          {t('auth.loginRequired')}
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('auth.loginToAccessCart')}
        </Text>
        <Button
          mode="contained"
          onPress={handleLogin}
          style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.loginButtonContent}
        >
          {t('auth.signIn')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButton: {
    borderRadius: 8,
    minWidth: 200,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
});
