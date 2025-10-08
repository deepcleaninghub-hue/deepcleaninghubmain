import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, Portal, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppModal } from '../hooks/useAppModal';

interface ForgotPasswordModalProps {
  visible: boolean;
  onDismiss: () => void;
  onEmailSent: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onDismiss,
  onEmailSent,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const { showError, showSuccess } = useAppModal();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '' });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = { email: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = t('auth.emailRequired');
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth.enterValidEmail');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://192.168.29.120:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(t('auth.success'), t('auth.otpSentToEmail'));
        onEmailSent(email.trim());
        onDismiss();
      } else {
        showError(t('auth.error'), data.message || t('auth.failedToSendOTP'));
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showError(t('auth.error'), t('auth.networkError'));
    } finally {
      setLoading(false);
    }
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
            <SafeAreaView style={styles.safeArea}>
              <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
                <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
                  {t('auth.forgotPassword')}
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
                <View style={styles.content}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed" size={48} color={theme.colors.primary} />
                  </View>

                  <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                    {t('auth.forgotPasswordDescription')}
                  </Text>

                  <TextInput
                    label={t('auth.email')}
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!errors.email}
                    style={styles.input}
                    disabled={loading}
                  />
                  {errors.email ? (
                    <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.email}
                    </Text>
                  ) : null}

                  <Button
                    mode="contained"
                    onPress={handleSendOTP}
                    loading={loading}
                    disabled={loading}
                    style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                    contentStyle={styles.buttonContent}
                  >
                    {loading ? t('common.loading') : t('auth.sendOTP')}
                  </Button>
                </View>
              </ScrollView>
            </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    marginBottom: 16,
    marginLeft: 16,
  },
  sendButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});