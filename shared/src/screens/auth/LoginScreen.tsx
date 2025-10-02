/**
 * Login Screen
 * 
 * A clean, accessible login screen with proper validation and error handling.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateEmail, validatePassword } from '../../utils/validation';
import { AuthStackScreenProps } from '../../navigation/types';
import AppModal from '../../components/common/AppModal';
import { useAppModal } from '../../hooks/useAppModal';
import { ForgotPasswordModal } from '../../components/ForgotPasswordModal';
import { OTPVerificationModal } from '../../components/OTPVerificationModal';
import { NewPasswordModal } from '../../components/NewPasswordModal';

type Props = AuthStackScreenProps<'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { signIn, loading } = useAuth();
  const { t, languageChangeKey } = useLanguage();
  const { modalConfig, visible, hideModal, showError } = useAppModal();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginFailed, setIsLoginFailed] = useState(false);
  
  // Forgot password flow states
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [otpVerificationVisible, setOtpVerificationVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  
  // Refs for focusing next field
  const passwordInputRef = useRef<any>(null);

  const validateForm = useCallback(() => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired');
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('auth.enterValidEmail');
      isValid = false;
    }

    // Password validation - only check if not empty for login
    if (!formData.password.trim()) {
      newErrors.password = t('auth.passwordRequired');
      isValid = false;
    }
    // Remove password format validation for login - let authentication handle it

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear login failed state when user starts typing
    if (isLoginFailed) {
      setIsLoginFailed(false);
    }
  }, [errors, isLoginFailed]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoginFailed(false); // Reset login failed state
    setErrors({ email: '', password: '' }); // Clear any existing errors

    const success = await signIn(formData.email.trim(), formData.password);
    if (success) {
      // Navigation will be handled by the auth context
      console.log('Login successful');
      setIsLoginFailed(false);
    } else {
      setIsLoginFailed(true);
      // Set authentication error message
      setErrors(prev => ({
        ...prev,
        password: t('auth.wrongCredentials')
      }));
    }
  }, [formData, validateForm, signIn, t]);

  // Forgot password flow handlers
  const handleForgotPassword = () => {
    setForgotPasswordVisible(true);
  };

  const handleEmailSent = (email: string) => {
    setForgotPasswordEmail(email);
    setOtpVerificationVisible(true);
  };

  const handleOTPVerified = () => {
    setNewPasswordVisible(true);
  };

  const handlePasswordReset = () => {
    // Reset all modals
    setForgotPasswordVisible(false);
    setOtpVerificationVisible(false);
    setNewPasswordVisible(false);
    setForgotPasswordEmail('');
    
    // Show success message
    showError(t('auth.success'), t('auth.passwordResetComplete'));
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordVisible(false);
    setForgotPasswordEmail('');
  };

  const handleCloseOTP = () => {
    setOtpVerificationVisible(false);
    setForgotPasswordEmail('');
  };

  const handleCloseNewPassword = () => {
    setNewPasswordVisible(false);
    setForgotPasswordEmail('');
  };

  const handleSignUp = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

  return (
    <SafeAreaView key={`login-${languageChangeKey}`} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="home" size={60} color={theme.colors.primary} />
            </View>
            <Text 
              variant="headlineMedium" 
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              {t('auth.welcomeBack')}
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              {t('auth.signInToAccount')}
            </Text>
          </View>

          {/* Login Form */}
          <Surface 
            style={[styles.formCard, { backgroundColor: theme.colors.surface }]} 
            elevation={2}
          >
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label={t('auth.email')}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    passwordInputRef.current?.focus();
                  }}
                  error={!!errors.email}
                  left={<TextInput.Icon icon="email" />}
                  style={styles.input}
                  testID="email-input"
                  accessibilityLabel={t('auth.email')}
                  accessibilityHint={t('auth.enterEmail')}
                />
                {errors.email ? (
                  <Text 
                    style={[styles.errorText, { color: theme.colors.error }]}
                    testID="email-error"
                  >
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={passwordInputRef}
                  label={t('auth.password')}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  autoCorrect={false}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={handleLogin}
                  error={!!errors.password}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  testID="password-input"
                  accessibilityLabel={t('auth.password')}
                  accessibilityHint={t('auth.enterPassword')}
                />
                {errors.password ? (
                  <Text 
                    style={[styles.errorText, { color: theme.colors.error }]}
                    testID="password-error"
                  >
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              {/* Forgot Password Link */}
              <Button
                mode="text"
                onPress={handleForgotPassword}
                style={styles.forgotPasswordButton}
                labelStyle={{ color: theme.colors.primary }}
                testID="forgot-password-button"
              >
                {t('auth.forgotPassword')}
              </Button>

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                testID="login-button"
              >
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>

              {/* Login Failed Message */}
              {isLoginFailed && (
                <View style={styles.errorContainer}>
                  <Text 
                    variant="bodyMedium" 
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {t('auth.wrongCredentials')}
                  </Text>
                </View>
              )}

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text 
                  variant="bodyMedium" 
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {t('auth.noAccount')}{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={handleSignUp}
                  style={styles.signUpButton}
                  labelStyle={{ color: theme.colors.primary }}
                  testID="signup-button"
                >
                  {t('auth.signUp')}
                </Button>
              </View>
            </View>
          </Surface>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* App Modal */}
      <AppModal
        visible={visible}
        onDismiss={hideModal}
        title={modalConfig?.title || ''}
        message={modalConfig?.message || ''}
        type={modalConfig?.type}
        showCancel={modalConfig?.showCancel}
        confirmText={modalConfig?.confirmText}
        cancelText={modalConfig?.cancelText}
        onConfirm={modalConfig?.onConfirm}
        onCancel={modalConfig?.onCancel}
        icon={modalConfig?.icon}
      />

      {/* Forgot Password Modals */}
      <ForgotPasswordModal
        visible={forgotPasswordVisible}
        onDismiss={handleCloseForgotPassword}
        onEmailSent={handleEmailSent}
      />

      <OTPVerificationModal
        visible={otpVerificationVisible}
        onDismiss={handleCloseOTP}
        onOTPVerified={handleOTPVerified}
        email={forgotPasswordEmail}
      />

      <NewPasswordModal
        visible={newPasswordVisible}
        onDismiss={handleCloseNewPassword}
        onPasswordReset={handlePasswordReset}
        email={forgotPasswordEmail}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  formCard: {
    borderRadius: 16,
    marginBottom: 20,
  },
  formContainer: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  loginButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signUpButton: {
    marginLeft: -8,
  },
});
