/**
 * Login Screen
 * 
 * A clean, accessible login screen with proper validation and error handling.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
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
import { validateEmail, validatePassword } from '../../utils/validation';
import { AuthStackScreenProps } from '../../navigation/types';

type Props = AuthStackScreenProps<'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { signIn, loading } = useAuth();

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

  const validateForm = useCallback(() => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] || 'Invalid password';
        isValid = false;
      }
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
    
    // Clear login failed state when user starts typing
    if (isLoginFailed) {
      setIsLoginFailed(false);
    }
  }, [errors, isLoginFailed]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoginFailed(false); // Reset login failed state
    const success = await signIn(formData.email.trim(), formData.password);
    if (success) {
      // Navigation will be handled by the auth context
      console.log('Login successful');
      setIsLoginFailed(false);
    } else {
      setIsLoginFailed(true);
    }
  }, [formData, validateForm, signIn]);

  const handleSignUp = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

  const handleForgotPassword = useCallback(() => {
    // TODO: Implement forgot password flow
    Alert.alert('Forgot Password', 'Password reset functionality will be implemented soon.');
  }, []);

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
              <Ionicons name="home" size={60} color={theme.colors.primary} />
            </View>
            <Text 
              variant="headlineMedium" 
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              Welcome Back
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              Sign in to your Deep Cleaning Hub account
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
                  label="Email"
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
                  accessibilityLabel="Email address"
                  accessibilityHint="Enter your email address"
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
                  label="Password"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
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
                  accessibilityLabel="Password"
                  accessibilityHint="Enter your password"
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
                Forgot Password?
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Login Failed Message */}
              {isLoginFailed && (
                <View style={styles.errorContainer}>
                  <Text 
                    variant="bodyMedium" 
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    Wrong email or password. Please check your credentials and try again.
                  </Text>
                </View>
              )}

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text 
                  variant="bodyMedium" 
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Don't have an account?{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={handleSignUp}
                  style={styles.signUpButton}
                  labelStyle={{ color: theme.colors.primary }}
                  testID="signup-button"
                >
                  Sign Up
                </Button>
              </View>
            </View>
          </Surface>

          {/* Demo Credentials */}
          <Card style={[styles.demoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
              <Text 
                variant="titleSmall" 
                style={[styles.demoTitle, { color: theme.colors.onSurfaceVariant }]}
              >
                Demo Credentials
              </Text>
              <Text 
                variant="bodySmall" 
                style={[styles.demoText, { color: theme.colors.onSurfaceVariant }]}
              >
                For testing: Use any email and password (6+ chars)
              </Text>
            </Card.Content>
          </Card>
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
  demoCard: {
    borderRadius: 8,
  },
  demoTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  demoText: {
    lineHeight: 16,
  },
});
