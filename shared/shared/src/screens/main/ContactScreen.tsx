import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
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
import { inquiriesAPI, InquiryData } from '../../services/inquiriesAPI';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  service: z.string().min(1, 'Please select a service'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  serviceArea: z.string().optional(),
  preferredDate: z.string().optional().refine((date) => {
    if (!date || date.trim() === '') return true; // Allow empty dates
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate.toISOString() === date;
  }, {
    message: 'Please enter a valid date in YYYY-MM-DD format'
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactScreen = () => {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { id: 'kitchen-cleaning', name: 'Kitchen Deep Cleaning', price: 'From €50' },
    { id: 'house-moving', name: 'House Moving', price: 'From €80' },
    { id: 'deep-cleaning', name: 'Deep Cleaning', price: 'From €60' },
    { id: 'furniture-assembly', name: 'Furniture Assembly', price: 'From €40' },
    { id: 'carpet-cleaning', name: 'Carpet & Upholstery Cleaning', price: 'From €70' },
    { id: 'window-cleaning', name: 'Window & Glass Cleaning', price: 'From €30' },
    { id: 'custom-service', name: 'Custom Service', price: 'From €50' },
  ];

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Find the selected service
      const selectedService = services.find(service => service.name === data.service);
      
      if (!selectedService) {
        Alert.alert('Error', 'Please select a valid service');
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
        Alert.alert(
          'Success!',
          'Thank you for your inquiry. We will get back to you within 24 hours.',
          [
            {
              text: 'OK',
              onPress: () => reset(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      Alert.alert('Error', 'Failed to submit inquiry. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallNow = () => {
    Linking.openURL('tel:+4916097044182').catch(() => {
      Alert.alert('Error', 'Could not open phone app');
    });
  };

  const handleEmailUs = () => {
    Linking.openURL('mailto:info@deepcleaninghub.com').catch(() => {
      Alert.alert('Error', 'Could not open email app');
    });
  };

  const handleWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=4916097044182&text=Hi, I would like to know more about your cleaning services.').catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Contact Us" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              Get in Touch
            </Text>
            <Text variant="bodyLarge" style={[styles.headerDescription, { color: theme.colors.onSurfaceVariant }]}>
              Ready to transform your space? Contact us for a free consultation and quote.
            </Text>
          </View>

          {/* Contact Form */}
          <Card style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.formContent}>
              <Text variant="titleLarge" style={[styles.formTitle, { color: theme.colors.onSurface }]}>
                Send us a Message
              </Text>
              
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Full Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.name}
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
                    label="Email Address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
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
                    label="Phone Number"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.phone}
                    keyboardType="phone-pad"
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
                    label="Service Required"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.service}
                    left={<TextInput.Icon icon="briefcase" />}
                    right={
                      <TextInput.Icon 
                        icon="chevron-down" 
                        onPress={() => {
                          // Show service picker
                          Alert.alert(
                            'Select Service',
                            'Choose a service:',
                            (services || []).map(service => ({
                              text: `${service.name} - ${service.price}`,
                              onPress: () => onChange(service.name),
                            }))
                          );
                        }}
                      />
                    }
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
                    label="Message"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.message}
                    multiline
                    numberOfLines={4}
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
                    label="Service Area (Optional)"
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="map-marker" />}
                    placeholder="e.g., Berlin, Munich, Hamburg"
                  />
                )}
              />

              <Controller
                control={control}
                name="preferredDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Preferred Date (Optional)"
                    value={value || ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="calendar" />}
                    placeholder="YYYY-MM-DD (e.g., 2024-01-15)"
                    keyboardType="numeric"
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
                Send Message
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
                <Text style={[styles.ctaBadge, { color: theme.colors.primary }]}>Get in touch, instantly</Text>
              </View>
              <Text variant="titleLarge" style={[styles.ctaTitle, { color: theme.colors.onSurface }]}>
                Prefer to talk directly?
              </Text>
              <Text variant="bodyMedium" style={[styles.ctaDescription, { color: theme.colors.onSurfaceVariant }]}>
                Call, email, or message us for immediate assistance and personalized service.
              </Text>
              
              <View style={styles.contactMethods}>
                <View style={styles.contactMethod}>
                  <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="call" size={20} color={theme.colors.onPrimary} />
                  </View>
                  <View style={styles.contactMethodText}>
                    <Text variant="titleMedium" style={[styles.contactMethodTitle, { color: theme.colors.onSurface }]}>
                      Call Us
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
                    Call
                  </Button>
                </View>

                <View style={styles.contactMethod}>
                  <View style={[styles.contactIconContainer, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="mail" size={20} color={theme.colors.onPrimary} />
                  </View>
                  <View style={styles.contactMethodText}>
                    <Text variant="titleMedium" style={[styles.contactMethodTitle, { color: theme.colors.onSurface }]}>
                      Email Us
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
                    Email
                  </Button>
                </View>

                <View style={styles.contactMethod}>
                  <View style={[styles.contactIconContainer, { backgroundColor: '#25D366' }]}>
                    <Ionicons name="logo-whatsapp" size={20} color="white" />
                  </View>
                  <View style={styles.contactMethodText}>
                    <Text variant="titleMedium" style={[styles.contactMethodTitle, { color: theme.colors.onSurface }]}>
                      WhatsApp
                    </Text>
                    <Text variant="bodySmall" style={[styles.contactMethodSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                      Quick messaging
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
                    Message
                  </Button>
                </View>
              </View>
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
    backgroundColor: '#ffffff',
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
    shadowColor: '#000',
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
});

export default ContactScreen;
