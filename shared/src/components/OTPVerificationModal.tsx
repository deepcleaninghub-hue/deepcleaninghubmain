import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Modal, TextInput as RNTextInput } from 'react-native';
import { Text, Button, useTheme, Portal, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppModal } from '../hooks/useAppModal';
import { API_BASE_URL } from '../config/environment';

interface OTPVerificationModalProps {
  visible: boolean;
  onDismiss: () => void;
  onOTPVerified: () => void;
  email: string;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  visible,
  onDismiss,
  onOTPVerified,
  email,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const { showError, showSuccess } = useAppModal();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<RNTextInput[]>([]);

  useEffect(() => {
    if (visible) {
      setTimeLeft(60);
      setCanResend(false);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [visible]);

  const handleOTPChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError(t('auth.enterCompleteOTP'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          otp: otpString 
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(t('auth.success'), t('auth.otpVerified'));
        onOTPVerified();
        onDismiss();
      } else {
        setError(data.message || t('auth.invalidOTP'));
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(t('auth.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(t('auth.success'), t('auth.otpResent'));
        setTimeLeft(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setError('');
        
        // Start timer again
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        showError(t('auth.error'), data.message || t('auth.failedToResendOTP'));
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      showError(t('auth.error'), t('auth.networkError'));
    } finally {
      setResendLoading(false);
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
                  {t('auth.verifyOTP')}
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

              <View style={styles.content}>
                <View style={styles.iconContainer}>
                  <Ionicons name="mail" size={48} color={theme.colors.primary} />
                </View>

                <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                  {t('auth.otpSentTo')} {email}
                </Text>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <RNTextInput
                      key={index}
                      ref={(ref) => {
                        if (ref) inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        { 
                          borderColor: error ? theme.colors.error : theme.colors.outline,
                          color: theme.colors.onSurface,
                          backgroundColor: theme.colors.surface,
                        }
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOTPChange(value, index)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {error ? (
                  <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                    {error}
                  </Text>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleVerifyOTP}
                  loading={loading}
                  disabled={loading || otp.join('').length !== 6}
                  style={[styles.verifyButton, { backgroundColor: theme.colors.primary }]}
                  contentStyle={styles.buttonContent}
                >
                  {loading ? t('common.loading') : t('auth.verifyOTP')}
                </Button>

                <View style={styles.resendContainer}>
                  <Text variant="bodySmall" style={[styles.resendText, { color: theme.colors.onSurfaceVariant }]}>
                    {t('auth.didntReceiveOTP')}
                  </Text>
                  
                  {canResend ? (
                    <Button
                      mode="text"
                      onPress={handleResendOTP}
                      loading={resendLoading}
                      disabled={resendLoading}
                      textColor={theme.colors.primary}
                    >
                      {resendLoading ? t('common.loading') : t('auth.resendOTP')}
                    </Button>
                  ) : (
                    <Text variant="bodySmall" style={[styles.timerText, { color: theme.colors.onSurfaceVariant }]}>
                      {t('auth.resendIn')} {timeLeft}s
                    </Text>
                  )}
                </View>
              </View>
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
  content: {
    flex: 1,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    marginBottom: 8,
  },
  timerText: {
    fontWeight: '600',
  },
});
