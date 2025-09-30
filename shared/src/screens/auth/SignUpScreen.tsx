/**
 * Sign Up Screen
 * 
 * A clean, accessible sign up screen with proper validation.
 */

import React, { useState, useCallback } from 'react';
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
import { validateEmail, validatePassword, validateName } from '../../utils/validation';
import { AuthStackScreenProps } from '../../navigation/types';

type Props = AuthStackScreenProps<'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { signUp, loading } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = { firstName: '', lastName: '', email: '', phone: '', address: '', password: '', confirmPassword: '' };
    let isValid = true;

    // First name validation
    const firstNameValidation = validateName(formData.firstName);
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.error || t('auth.invalidFirstName');
      isValid = false;
    }

    // Last name validation
    const lastNameValidation = validateName(formData.lastName);
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.error || t('auth.invalidLastName');
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired');
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('auth.enterValidEmail');
      isValid = false;
    }

    // Phone validation (required)
    if (!formData.phone.trim()) {
      newErrors.phone = t('auth.phoneRequired');
      isValid = false;
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = t('auth.enterValidPhone');
      isValid = false;
    }

    // Address validation (required)
    if (!formData.address.trim()) {
      newErrors.address = t('auth.addressRequired');
      isValid = false;
    } else if (formData.address.trim().length < 10) {
      newErrors.address = t('auth.enterCompleteAddress');
      isValid = false;
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = t('auth.passwordRequired');
      isValid = false;
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] || t('auth.invalidPassword');
        isValid = false;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSignUp = useCallback(async () => {
    if (!validateForm()) return;

    const success = await signUp(
      formData.email.trim(),
      formData.password,
      formData.firstName.trim(),
      formData.lastName.trim(),
      formData.phone.trim(),
      formData.address.trim()
    );
    
    if (success) {
      // Navigation will be handled by the auth context
      console.log('Sign up successful');
    }
  }, [formData, validateForm, signUp]);

  const handleSignIn = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
              <Ionicons name="person-add" size={60} color={theme.colors.primary} />
            </View>
            <Text 
              variant="headlineMedium" 
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              {t('auth.createAccount')}
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              {t('auth.joinDeepCleaningHub')}
            </Text>
          </View>

          {/* Sign Up Form */}
          <Surface 
            style={[styles.formCard, { backgroundColor: theme.colors.surface }]} 
            elevation={2}
          >
            <View style={styles.formContainer}>
              {/* Name Fields */}
              <View style={styles.nameRow}>
                <View style={[styles.inputContainer, styles.nameInput]}>
                  <TextInput
                    label={t('auth.firstName')}
                    value={formData.firstName}
                    onChangeText={(text) => handleInputChange('firstName', text)}
                    mode="outlined"
                    autoCapitalize="words"
                    autoComplete="given-name"
                    error={!!errors.firstName}
                    left={<TextInput.Icon icon="account" />}
                    style={styles.input}
                    testID="first-name-input"
                  />
                  {errors.firstName ? (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.firstName}
                    </Text>
                  ) : null}
                </View>
                
                <View style={[styles.inputContainer, styles.nameInput]}>
                  <TextInput
                    label={t('auth.lastName')}
                    value={formData.lastName}
                    onChangeText={(text) => handleInputChange('lastName', text)}
                    mode="outlined"
                    autoCapitalize="words"
                    autoComplete="family-name"
                    error={!!errors.lastName}
                    left={<TextInput.Icon icon="account" />}
                    style={styles.input}
                    testID="last-name-input"
                  />
                  {errors.lastName ? (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.lastName}
                    </Text>
                  ) : null}
                </View>
              </View>

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
                  error={!!errors.email}
                  left={<TextInput.Icon icon="email" />}
                  style={styles.input}
                  testID="email-input"
                />
                {errors.email ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label={t('auth.phone')}
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  mode="outlined"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  error={!!errors.phone}
                  left={<TextInput.Icon icon="phone" />}
                  style={styles.input}
                  testID="phone-input"
                />
                {errors.phone ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.phone}
                  </Text>
                ) : null}
              </View>

              {/* Address Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label={t('auth.address')}
                  value={formData.address}
                  onChangeText={(text) => handleInputChange('address', text)}
                  mode="outlined"
                  autoCapitalize="words"
                  autoComplete="street-address"
                  multiline
                  numberOfLines={2}
                  error={!!errors.address}
                  left={<TextInput.Icon icon="map-marker" />}
                  style={styles.input}
                  testID="address-input"
                />
                {errors.address ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.address}
                  </Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label={t('auth.password')}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  autoCorrect={false}
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
                />
                {errors.password ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label={t('auth.confirmPassword')}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  mode="outlined"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  autoCorrect={false}
                  error={!!errors.confirmPassword}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  style={styles.input}
                  testID="confirm-password-input"
                />
                {errors.confirmPassword ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.confirmPassword}
                  </Text>
                ) : null}
              </View>

              {/* Sign Up Button */}
              <Button
                mode="contained"
                onPress={handleSignUp}
                loading={loading}
                disabled={loading}
                style={styles.signUpButton}
                contentStyle={styles.buttonContent}
                testID="signup-button"
              >
                {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
              </Button>

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text 
                  variant="bodyMedium" 
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {t('auth.alreadyHaveAccount')}{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={handleSignIn}
                  style={styles.signInButton}
                  labelStyle={{ color: theme.colors.primary }}
                  testID="signin-button"
                >
                  {t('auth.signIn')}
                </Button>
              </View>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
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
    shadowColor: '#000',
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    backgroundColor: 'transparent',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  signUpButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signInButton: {
    marginLeft: -8,
  },
});
