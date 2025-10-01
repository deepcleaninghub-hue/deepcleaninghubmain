// Enhanced with new color palette: #F9F7F7, #DBE2EF, #3F72AF, #112D4E
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  useTheme, 
  ActivityIndicator,
  ProgressBar,
  RadioButton,
  HelperText
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { profileAPI, UserProfile, UpdateProfileData } from '../../services/profileAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProfileStackScreenProps } from '../../navigation/types';
import AppModal from '../../components/common/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

type Props = ProfileStackScreenProps<'EditProfile'>;

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { modalConfig, visible, hideModal, showError, showSuccess } = useAppModal();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Refs for focusing next field
  const lastNameRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const phoneRef = useRef<any>(null);
  const addressRef = useRef<any>(null);
  const cityRef = useRef<any>(null);
  const stateRef = useRef<any>(null);
  const postalCodeRef = useRef<any>(null);
  const countryRef = useRef<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await profileAPI.getProfile();
      if (profileData) {
        setProfile(profileData);
        const dobDate = profileData.date_of_birth ? new Date(profileData.date_of_birth) : new Date();
        setSelectedDate(dobDate);
        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          postal_code: profileData.postal_code || '',
          country: profileData.country || t('profile.germany'),
          date_of_birth: profileData.date_of_birth || '',
          gender: profileData.gender || undefined
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError(t('common.error'), t('profile.failedToLoadProfile'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleInputChange = (field: keyof UpdateProfileData, value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Only validate fields that have been modified and are not empty
    if (formData.first_name !== undefined && formData.first_name !== '' && !formData.first_name.trim()) {
      newErrors.first_name = t('profile.firstNameCannotBeEmpty');
    }

    if (formData.last_name !== undefined && formData.last_name !== '' && !formData.last_name.trim()) {
      newErrors.last_name = t('profile.lastNameCannotBeEmpty');
    }

    if (formData.email !== undefined && formData.email !== '') {
      if (!formData.email.trim()) {
        newErrors.email = t('profile.emailCannotBeEmpty');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = t('profile.pleaseEnterValidEmail');
      }
    }

    if (formData.phone && formData.phone.length > 0 && formData.phone.length < 10) {
      newErrors.phone = t('profile.phoneNumberMustBeAtLeast10');
    }

    if (formData.address && formData.address.length > 0 && formData.address.length < 5) {
      newErrors.address = t('profile.addressMustBeAtLeast5');
    }

    if (formData.city && formData.city.length > 0 && formData.city.length < 2) {
      newErrors.city = t('profile.cityMustBeAtLeast2');
    }

    if (formData.postal_code && formData.postal_code.length > 0 && formData.postal_code.length < 3) {
      newErrors.postal_code = t('profile.postalCodeMustBeAtLeast3');
    }

    // Date of birth validation
    if (formData.date_of_birth && formData.date_of_birth.length > 0) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date_of_birth)) {
        newErrors.date_of_birth = t('profile.pleaseEnterValidDate');
      } else {
        const selectedDate = new Date(formData.date_of_birth);
        const today = new Date();
        const minDate = new Date(1900, 0, 1);
        
        if (isNaN(selectedDate.getTime())) {
          newErrors.date_of_birth = t('profile.pleaseEnterValidDateOnly');
        } else if (selectedDate > today) {
          newErrors.date_of_birth = t('profile.dateOfBirthCannotBeInFuture');
        } else if (selectedDate < minDate) {
          newErrors.date_of_birth = t('profile.pleaseEnterValidDateOfBirth');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Date picker handlers
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      handleInputChange('date_of_birth', formattedDate);
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Only send fields that have been changed from the original profile
      const changedFields: UpdateProfileData = {};
      
      if (profile) {
        Object.keys(formData).forEach(key => {
          const fieldKey = key as keyof UpdateProfileData;
          const currentValue = formData[fieldKey];
          const originalValue = profile[fieldKey as keyof UserProfile];
          
          // Only include fields that have actually changed and have meaningful values
          // Normalize values for comparison (treat null, undefined, and empty string as equivalent)
          const normalizedCurrent = currentValue === '' || currentValue === null ? undefined : currentValue;
          const normalizedOriginal = originalValue === '' || originalValue === null ? undefined : originalValue;
          
          if (normalizedCurrent !== undefined && 
              normalizedCurrent !== normalizedOriginal) {
            // Handle gender field type casting
            if (fieldKey === 'gender') {
              changedFields[fieldKey] = currentValue as 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined;
            } else {
              changedFields[fieldKey] = currentValue as string;
            }
          }
        });
      }

      // If no fields have changed, show a message
      if (Object.keys(changedFields).length === 0) {
        showError(t('profile.noChanges'), t('profile.noChangesMade'));
        return;
      }

      console.log('Sending only changed fields:', changedFields);
      const result = await profileAPI.updateProfile(changedFields);
      
      if (result.success && result.data) {
        setProfile(result.data);
        // Update the AuthContext with the new data - convert UserProfile to User format
        const userData = {
          id: result.data.id,
          firstName: result.data.first_name,
          lastName: result.data.last_name,
          email: result.data.email,
          phone: result.data.phone || '',
          address: result.data.address || '',
          isActive: true,
          emailVerified: true,
          createdAt: result.data.created_at,
          updatedAt: result.data.updated_at
        };
        updateUser(userData);
        showSuccess(t('common.success'), result.message || t('profile.profileUpdatedSuccess'));
      } else {
        showError(t('common.error'), result.error || t('profile.failedToUpdateProfile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError(t('common.error'), t('profile.failedToUpdateProfile'));
    } finally {
      setSaving(false);
    }
  };

  const getProgressPercentage = (): number => {
    if (!profile) return 0;
    return profile.profile_completion_percentage / 100;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            {t('profile.loadingProfile')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('profile.editProfile')} showBack/>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Completion Progress */}
        {profile && (
          <Card style={[styles.progressCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={styles.progressContent}>
              <Text variant="titleMedium" style={[styles.progressTitle, { color: theme.colors.onPrimaryContainer }]}>
                {t('profile.profileCompletion')}
              </Text>
              <ProgressBar 
                progress={getProgressPercentage()} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text variant="bodyMedium" style={[styles.progressText, { color: theme.colors.onPrimaryContainer }]}>
                {profile.profile_completion_percentage}% {t('profile.complete')}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Personal Information */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('profile.personalInformation')}
            </Text>
            
            <View style={styles.row}>
              <TextInput
                label={`${t('profile.firstName')} *`}
                value={formData.first_name || ''}
                onChangeText={(text) => handleInputChange('first_name', text)}
                style={[styles.input, styles.halfInput]}
                error={!!errors.first_name}
                mode="outlined"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
              <TextInput
                ref={lastNameRef}
                label={`${t('profile.lastName')} *`}
                value={formData.last_name || ''}
                onChangeText={(text) => handleInputChange('last_name', text)}
                style={[styles.input, styles.halfInput]}
                error={!!errors.last_name}
                mode="outlined"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
            {errors.first_name && <HelperText type="error">{errors.first_name}</HelperText>}
            {errors.last_name && <HelperText type="error">{errors.last_name}</HelperText>}

            <TextInput
              ref={emailRef}
              label={`${t('profile.email')} *`}
              value={formData.email || ''}
              onChangeText={(text) => handleInputChange('email', text)}
              style={styles.input}
              error={!!errors.email}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}

            <TextInput
              ref={phoneRef}
              label={t('auth.phone')}
              value={formData.phone || ''}
              onChangeText={(text) => handleInputChange('phone', text)}
              style={styles.input}
              error={!!errors.phone}
              mode="outlined"
              keyboardType="phone-pad"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => addressRef.current?.focus()}
            />
            {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

            <View style={styles.dateInputContainer}>
              <Text variant="bodyMedium" style={[styles.dateLabel, { color: theme.colors.onSurface }]}>
                {t('profile.dateOfBirth')}
              </Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
                contentStyle={styles.dateButtonContent}
                icon="calendar"
              >
                {formData.date_of_birth ? formatDate(selectedDate) : t('profile.selectDateOfBirth')}
              </Button>
              {errors.date_of_birth && (
                <HelperText type="error" style={styles.helperText}>
                  {errors.date_of_birth}
                </HelperText>
              )}
            </View>

            <Text variant="bodyMedium" style={[styles.genderLabel, { color: theme.colors.onSurface }]}>
              {t('profile.gender')}
            </Text>
            <View style={styles.genderContainer}>
              <View style={styles.genderOption}>
                <RadioButton
                  value="male"
                  status={formData.gender === 'male' ? 'checked' : 'unchecked'}
                  onPress={() => handleInputChange('gender', 'male')}
                />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>{t('profile.male')}</Text>
              </View>
              <View style={styles.genderOption}>
                <RadioButton
                  value="female"
                  status={formData.gender === 'female' ? 'checked' : 'unchecked'}
                  onPress={() => handleInputChange('gender', 'female')}
                />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>{t('profile.female')}</Text>
              </View>
              <View style={styles.genderOption}>
                <RadioButton
                  value="other"
                  status={formData.gender === 'other' ? 'checked' : 'unchecked'}
                  onPress={() => handleInputChange('gender', 'other')}
                />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>{t('profile.other')}</Text>
              </View>
              <View style={styles.genderOption}>
                <RadioButton
                  value="prefer_not_to_say"
                  status={formData.gender === 'prefer_not_to_say' ? 'checked' : 'unchecked'}
                  onPress={() => handleInputChange('gender', 'prefer_not_to_say')}
                />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>{t('profile.preferNotToSay')}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Address Information */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('profile.addressInformation')}
            </Text>
            
            <TextInput
              ref={addressRef}
              label={t('auth.address')}
              value={formData.address || ''}
              onChangeText={(text) => handleInputChange('address', text)}
              style={styles.input}
              error={!!errors.address}
              mode="outlined"
              multiline
              numberOfLines={3}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => {
                // Dismiss keyboard when done is pressed
              }}
            />
            {errors.address && <HelperText type="error">{errors.address}</HelperText>}

            <View style={styles.row}>
              <TextInput
                ref={cityRef}
                label={t('checkout.city')}
                value={formData.city || ''}
                onChangeText={(text) => handleInputChange('city', text)}
                style={[styles.input, styles.halfInput]}
                error={!!errors.city}
                mode="outlined"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => stateRef.current?.focus()}
              />
              <TextInput
                ref={stateRef}
                label={t('profile.state')}
                value={formData.state || ''}
                onChangeText={(text) => handleInputChange('state', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => postalCodeRef.current?.focus()}
              />
            </View>
            {errors.city && <HelperText type="error">{errors.city}</HelperText>}

            <View style={styles.row}>
              <TextInput
                ref={postalCodeRef}
                label={t('checkout.postalCode')}
                value={formData.postal_code || ''}
                onChangeText={(text) => handleInputChange('postal_code', text)}
                style={[styles.input, styles.halfInput]}
                error={!!errors.postal_code}
                mode="outlined"
                keyboardType="numeric"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => countryRef.current?.focus()}
              />
              <TextInput
                ref={countryRef}
                label={t('checkout.country')}
                value={formData.country || ''}
                onChangeText={(text) => handleInputChange('country', text)}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => {
                  // Dismiss keyboard when done is pressed
                  // This ensures the keyboard is dismissed
                }}
              />
            </View>
            {errors.postal_code && <HelperText type="error">{errors.postal_code}</HelperText>}
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
              contentStyle={styles.buttonContent}
              icon={({ size, color }) => (
                <Ionicons name="save" size={size} color={color} />
              )}
            >
              {saving ? t('profile.saving') : t('profile.saveProfile')}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()} // Can't select future dates for DOB
            minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
          />
          {Platform.OS === 'ios' && (
            <View style={styles.pickerButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(false)}
                style={styles.pickerButton}
              >
{t('common.cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleDateConfirm}
                style={styles.pickerButton}
              >
{t('common.confirm')}
              </Button>
            </View>
          )}
        </View>
      )}

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F7',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  progressCard: {
    margin: 16,
    borderRadius: 12,
  },
  progressContent: {
    padding: 20,
  },
  progressTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  genderLabel: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '500',
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  saveButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dateInputContainer: {
    marginBottom: 8,
  },
  dateLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  dateButton: {
    justifyContent: 'flex-start',
  },
  dateButtonContent: {
    justifyContent: 'flex-start',
  },
  helperText: {
    marginTop: 4,
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  pickerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default EditProfileScreen;
