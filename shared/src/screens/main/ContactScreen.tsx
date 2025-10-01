// Enhanced with new color palette: #F9F7F7, #DBE2EF, #3F72AF, #112D4E
import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, Card, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../contexts/LanguageContext';
import { inquiriesAPI, InquiryData } from '../../services/inquiriesAPI';
import AppModal from '../../components/common/AppModal';
import { useAppModal } from '../../hooks/useAppModal';

const createContactSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, t('cta.nameMinLength')),
  email: z.string().email(t('cta.enterValidEmail')),
  phone: z.string().min(10, t('cta.enterValidPhone')),
  service: z.string().min(1, t('cta.selectService')),
  message: z.string().min(10, t('cta.messageMinLength')),
  serviceArea: z.string().optional(),
  preferredDate: z.string().optional().refine((date) => {
    if (!date || date.trim() === '') return true; // Allow empty dates
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate.toISOString() === date;
  }, {
    message: t('cta.enterValidDate')
  }),
});

type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>;

const ContactScreen = () => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const { modalConfig, visible, hideModal, showError, showSuccess } = useAppModal();
  
  // Refs for focusing next field
  const emailRef = useRef<any>(null);
  const phoneRef = useRef<any>(null);
  const serviceRef = useRef<any>(null);
  const messageRef = useRef<any>(null);
  const serviceAreaRef = useRef<any>(null);
  const preferredDateRef = useRef<any>(null);

  const contactSchema = createContactSchema(t);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      message: '',
      serviceArea: '',
      preferredDate: '',
    },
  });

  const services = [
    { id: 'kitchen-cleaning', name: t('services.kitchenDeepCleaning'), price: 'From €50' },
    { id: 'house-moving', name: t('services.houseMoving'), price: 'From €80' },
    { id: 'deep-cleaning', name: t('services.deepCleaning'), price: 'From €60' },
    { id: 'furniture-assembly', name: t('services.furnitureAssembly'), price: 'From €40' },
    { id: 'carpet-cleaning', name: t('services.carpetUpholsteryCleaning'), price: 'From €70' },
    { id: 'window-cleaning', name: t('services.windowGlassCleaning'), price: 'From €30' },
    { id: 'custom-service', name: t('services.customService'), price: 'From €50' },
  ];

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Find the selected service
      const selectedService = services.find(service => service.name === data.service);
      
      if (!selectedService) {
        showError(t('cta.error'), t('cta.selectValidService'));
        setIsSubmitting(false);
        return;
      }

      // Prepare inquiry data for API
      const inquiryData: InquiryData = {
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        services: [{
          id: selectedService.id,
          name: selectedService.name,
          price: selectedService.price
        }],
        message: data.message,
        preferredDate: data.preferredDate && data.preferredDate.trim() !== '' ? data.preferredDate : undefined,
        serviceArea: data.serviceArea || ''
      };

      // Submit inquiry to API
      const response = await inquiriesAPI.submitInquiry(inquiryData);
      
      if (response.success) {
        showSuccess(t('cta.success'), t('cta.thankYouInquiry'), () => {
          reset();
          hideModal();
        });
      } else {
        showError(t('cta.error'), response.error || t('cta.failedToSubmitInquiry'));
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      showError(t('cta.error'), t('cta.failedToSubmitInquiryConnection'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSelect = (service: any, onChange: (value: string) => void) => {
    onChange(service.name);
    setShowServicePicker(false);
  };

  const handleCallNow = () => {
    Linking.openURL('tel:+4916097044182').catch(() => {
      showError(t('cta.error'), t('cta.couldNotOpenPhoneApp'));
    });
  };

  const handleEmailUs = () => {
    Linking.openURL('mailto:info@deepcleaninghub.com').catch(() => {
      showError(t('cta.error'), t('cta.couldNotOpenEmailApp'));
    });
  };

  const handleWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=4916097044182&text=Hi, I would like to know more about your cleaning services.').catch(() => {
      showError(t('cta.error'), t('cta.couldNotOpenWhatsApp'));
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('contact.title')} showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              {t('cta.getInTouch')}
            </Text>
            <Text variant="bodyLarge" style={[styles.headerDescription, { color: theme.colors.onSurfaceVariant }]}>
              {t('cta.readyToTransform')}
            </Text>
          </View>

          {/* Contact Form */}
          <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.formContent}>
              <Text variant="titleLarge" style={[styles.formTitle, { color: theme.colors.onSurface }]}>
                {t('cta.sendUsMessage')}
              </Text>
              
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t('contact.fullName')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.name}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => emailRef.current?.focus()}
                    left={<TextInput.Icon icon="account" />}
                  />
                )}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.name.message}
                </Text>
              )}

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={emailRef}
                    label={t('contact.emailAddress')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => phoneRef.current?.focus()}
                    left={<TextInput.Icon icon="email" />}
                  />
                )}
              />
              {errors.email && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.email.message}
                </Text>
              )}

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={phoneRef}
                    label={t('contact.phoneNumber')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.phone}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => serviceRef.current?.focus()}
                    left={<TextInput.Icon icon="phone" />}
                  />
                )}
              />
              {errors.phone && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.phone.message}
                </Text>
              )}

              <Controller
                control={control}
                name="service"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={serviceRef}
                    label={t('contact.serviceRequired')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.service}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => messageRef.current?.focus()}
                    left={<TextInput.Icon icon="briefcase" />}
                    right={
                      <TextInput.Icon 
                        icon="chevron-down" 
                        onPress={() => setShowServicePicker(true)}
                      />
                    }
                    onFocus={() => setShowServicePicker(true)}
                    showSoftInputOnFocus={false}
                  />
                )}
              />
              {errors.service && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.service.message}
                </Text>
              )}

              <Controller
                control={control}
                name="message"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={messageRef}
                    label={t('contact.message')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.message}
                    multiline
                    numberOfLines={4}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => serviceAreaRef.current?.focus()}
                    left={<TextInput.Icon icon="message" />}
                  />
                )}
              />
              {errors.message && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.message.message}
                </Text>
              )}

              <Controller
                control={control}
                name="serviceArea"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={serviceAreaRef}
                    label={t('cta.serviceAreaOptional')}
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => preferredDateRef.current?.focus()}
                    left={<TextInput.Icon icon="map-marker" />}
                    placeholder={t('cta.serviceAreaPlaceholder')}
                  />
                )}
              />

              <Controller
                control={control}
                name="preferredDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    ref={preferredDateRef}
                    label={t('cta.preferredDateOptional')}
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="calendar" />}
                    placeholder={t('cta.preferredDatePlaceholder')}
                    keyboardType="numeric"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {t('cta.sendMessage')}
              </Button>
            </Card.Content>
          </Card>

          {/* Contact Information CTA */}
          <Card style={[styles.ctaCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content style={styles.ctaContent}>
              <View style={styles.ctaBadgeRow}>
                <View style={[styles.ctaIconCircle, { backgroundColor: theme.colors.primary }]}>
                  <Ionicons name="call" size={16} color={theme.colors.onPrimary} />
                </View>
                <Text style={[styles.ctaBadge, { color: theme.colors.primary }]}>{t('cta.getInTouchInstantly')}</Text>
              </View>
              <Text variant="titleLarge" style={[styles.ctaTitle, { color: theme.colors.onSurface }]}>
                {t('cta.preferToTalkDirectly')}
              </Text>
              <Text variant="bodyMedium" style={[styles.ctaDescription, { color: theme.colors.onSurfaceVariant }]}>
                {t('cta.callEmailMessageUs')}
              </Text>
              
              <View style={styles.contactMethods}>
                <View style={styles.contactMethod}>
                  <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="call" size={20} color={theme.colors.onPrimary} />
                  </View>
                  <View style={styles.contactMethodText}>
                    <Text variant="titleMedium" style={[styles.contactMethodTitle, { color: theme.colors.onSurface }]}>
                      {t('cta.callUs')}
                    </Text>
                    <Text variant="bodySmall" style={[styles.contactMethodSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                      +49-16097044182
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={handleCallNow}
                    style={[styles.contactActionButton, { borderColor: theme.colors.primary }]}
                    textColor={theme.colors.primary}
                    contentStyle={styles.contactButtonContent}
                    icon={({ size, color }) => (
                      <Ionicons name="call" size={size} color={color} />
                    )}
                    compact
                  >
                    {t('cta.call')}
                  </Button>
                </View>

                <View style={styles.contactMethod}>
                  <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="mail" size={20} color={theme.colors.onPrimary} />
                  </View>
                  <View style={styles.contactMethodText}>
                    <Text variant="titleMedium" style={[styles.contactMethodTitle, { color: theme.colors.onSurface }]}>
                      {t('cta.emailUs')}
                    </Text>
                    <Text variant="bodySmall" style={[styles.contactMethodSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                      info@deepcleaninghub.com
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={handleEmailUs}
                    style={[styles.contactActionButton, { borderColor: theme.colors.primary }]}
                    textColor={theme.colors.primary}
                    contentStyle={styles.contactButtonContent}
                    icon={({ size, color }) => (
                      <Ionicons name="mail" size={size} color={color} />
                    )}
                    compact
                  >
                    {t('cta.email')}
                  </Button>
                </View>

                <View style={styles.contactMethod}>
                  <View style={[styles.contactIconContainer, { backgroundColor: '#3F72AF' }]}>
                    <Ionicons name="logo-whatsapp" size={20} color="white" />
                  </View>
                  <View style={styles.contactMethodText}>
                    <Text variant="titleMedium" style={[styles.contactMethodTitle, { color: theme.colors.onSurface }]}>
                      {t('cta.whatsapp')}
                    </Text>
                    <Text variant="bodySmall" style={[styles.contactMethodSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                      {t('cta.quickMessaging')}
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={handleWhatsApp}
                    style={[styles.contactActionButton, { borderColor: '#25D366' }]}
                    textColor="#25D366"
                    contentStyle={styles.contactButtonContent}
                    icon={({ size, color }) => (
                      <Ionicons name="logo-whatsapp" size={size} color={color} />
                    )}
                    compact
                  >
                    {t('cta.message')}
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* App Modal */}
      {modalConfig && (
        <AppModal
          visible={visible}
          onDismiss={hideModal}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          showCancel={modalConfig.showCancel}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
          icon={modalConfig.icon}
        />
      )}

      {/* Service Picker Modal */}
      <AppModal
        visible={showServicePicker}
        onDismiss={() => setShowServicePicker(false)}
        title={t('cta.selectServiceTitle')}
        message=""
        showCloseButton={true}
        maxHeight={500}
        children={
          <ScrollView style={styles.servicePickerContent} showsVerticalScrollIndicator={true}>
            {services.map((service) => (
              <Controller
                key={service.id}
                control={control}
                name="service"
                render={({ field: { onChange } }) => (
                  <Button
                    mode="outlined"
                    onPress={() => handleServiceSelect(service, onChange)}
                    style={[styles.serviceOption, { borderColor: theme.colors.outline }]}
                    contentStyle={styles.serviceOptionContent}
                    textColor={theme.colors.onSurface}
                  >
                    <View style={styles.serviceOptionText}>
                      <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                        {service.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {service.price}
                      </Text>
                    </View>
                  </Button>
                )}
              />
            ))}
          </ScrollView>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F7',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  headerDescription: {
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    margin: 20,
    borderRadius: 16,
    elevation: 3,
  },
  formContent: {
    padding: 24,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  ctaCard: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#112D4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ctaContent: {
    padding: 24,
  },
  ctaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  ctaIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBadge: {
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ctaTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 20,
  },
  ctaDescription: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontSize: 14,
  },
  contactMethods: {
    gap: 16,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactMethodText: {
    flex: 1,
  },
  contactMethodTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  contactMethodSubtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  contactActionButton: {
    borderRadius: 8,
    borderWidth: 1.5,
  },
  contactButtonContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  servicePickerContent: {
    maxHeight: 400,
    paddingVertical: 8,
  },
  serviceOption: {
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  serviceOptionContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  serviceOptionText: {
    alignItems: 'flex-start',
    width: '100%',
  },
});

export default ContactScreen;
