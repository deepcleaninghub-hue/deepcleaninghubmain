import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, Portal, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppModal } from '../hooks/useAppModal';

interface NewPasswordModalProps {
  visible: boolean;
  onDismiss: () => void;
  onPasswordReset: () => void;
  email: string;
}

export const NewPasswordModal: React.FC<NewPasswordModalProps> = ({
  visible,
  onDismiss,
  onPasswordReset,
  email,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const { showError, showSuccess } = useAppModal();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = { password: '', confirmPassword: '' };
    let isValid = true;

    if (!password.trim()) {
      newErrors.password = t('auth.passwordRequired');
      isValid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = t('auth.passwordRequirements');
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('http://13.211.76.43:5001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          newPassword: password.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(t('auth.success'), t('auth.passwordResetSuccess'));
        onPasswordReset();
        onDismiss();
      } else {
        showError(t('auth.error'), data.message || t('auth.failedToResetPassword'));
      }
    } catch (error) {
      console.error('Error resetting password:', error);
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
                  {t('auth.setNewPassword')}
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
                    <Ionicons name="key" size={48} color={theme.colors.primary} />
                  </View>

                  <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                    {t('auth.setNewPasswordDescription')}
                  </Text>

                  <TextInput
                    label={t('auth.newPassword')}
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    error={!!errors.password}
                    style={styles.input}
                    disabled={loading}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  {errors.password ? (
                    <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.password}
                    </Text>
                  ) : null}

                  <TextInput
                    label={t('auth.confirmNewPassword')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    style={styles.input}
                    disabled={loading}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                  />
                  {errors.confirmPassword ? (
                    <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.confirmPassword}
                    </Text>
                  ) : null}

                  <View style={[styles.passwordRequirements, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text variant="bodySmall" style={[styles.requirementsTitle, { color: theme.colors.onSurfaceVariant }]}>
                      {t('auth.passwordRequirements')}:
                    </Text>
                    <Text variant="bodySmall" style={[styles.requirement, { color: theme.colors.onSurfaceVariant }]}>
                      • {t('auth.minimum8Characters')}
                    </Text>
                    <Text variant="bodySmall" style={[styles.requirement, { color: theme.colors.onSurfaceVariant }]}>
                      • {t('auth.oneUppercaseLetter')}
                    </Text>
                    <Text variant="bodySmall" style={[styles.requirement, { color: theme.colors.onSurfaceVariant }]}>
                      • {t('auth.oneLowercaseLetter')}
                    </Text>
                    <Text variant="bodySmall" style={[styles.requirement, { color: theme.colors.onSurfaceVariant }]}>
                      • {t('auth.oneNumber')}
                    </Text>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    loading={loading}
                    disabled={loading}
                    style={[styles.resetButton, { backgroundColor: theme.colors.primary }]}
                    contentStyle={styles.buttonContent}
                  >
                    {loading ? t('common.loading') : t('auth.resetPassword')}
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
  passwordRequirements: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  requirement: {
    marginBottom: 4,
  },
  resetButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
