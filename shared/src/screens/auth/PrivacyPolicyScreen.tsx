import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { useLanguage } from '../../contexts/LanguageContext';

const PrivacyPolicyScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title="Privacy Policy" showBack={true} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        <Text variant="headlineMedium" style={[styles.mainTitle, { color: theme.colors.primary }]}>
          Privacy Policy
        </Text>
        
        <Text variant="bodySmall" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          Last Updated: December 2024
        </Text>

        <Divider style={styles.divider} />

        {/* Introduction */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          1. Introduction
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          Welcome to Deep Cleaning Hub ("we," "our," or "us"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          By using Deep Cleaning Hub, you agree to the collection and use of information in accordance with this policy.
        </Text>

        <Divider style={styles.divider} />

        {/* Information We Collect */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          2. Information We Collect
        </Text>
        
        <Text variant="titleSmall" style={[styles.subTitle, { color: theme.colors.primary }]}>
          2.1 Personal Information
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          When you create an account or book our services, we collect:
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Full name (first name and last name)
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Email address
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Phone number
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Service address (street, city, postal code, state, country)
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Booking details (service type, date, time, special instructions)
        </Text>

        <Text variant="titleSmall" style={[styles.subTitle, { color: theme.colors.primary }]}>
          2.2 Automatically Collected Information
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Device information (model, operating system, unique device identifiers)
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • App usage data and analytics
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • IP address and connection information
        </Text>

        <Divider style={styles.divider} />

        {/* How We Use Your Information */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          3. How We Use Your Information
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We use the collected information for:
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Providing and managing our cleaning services
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Processing and confirming your bookings
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Sending booking confirmations and reminders via email and WhatsApp
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Communicating about service updates and promotional offers
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Improving our app and services
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Customer support and responding to your inquiries
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Sending push notifications about booking updates and special offers
        </Text>

        <Divider style={styles.divider} />

        {/* Data Storage and Security */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          4. Data Storage and Security
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We implement appropriate technical and organizational security measures to protect your personal information:
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Data is stored on secure servers hosted by Amazon Web Services (AWS)
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Passwords are encrypted using industry-standard encryption
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Access to personal data is restricted to authorized personnel only
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Regular security audits and updates
        </Text>

        <Divider style={styles.divider} />

        {/* Third-Party Services */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          5. Third-Party Services
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We use the following third-party services to provide our services:
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • <Text style={styles.bold}>Amazon Web Services (AWS):</Text> For cloud hosting and email services
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • <Text style={styles.bold}>Twilio:</Text> For WhatsApp notifications and SMS services
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • <Text style={styles.bold}>Expo:</Text> For mobile app infrastructure and push notifications
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          These services have their own privacy policies governing their use of your information.
        </Text>

        <Divider style={styles.divider} />

        {/* Data Sharing */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          6. Data Sharing and Disclosure
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • With service providers necessary to deliver our cleaning services
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • When required by law or to protect our legal rights
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • With your explicit consent
        </Text>

        <Divider style={styles.divider} />

        {/* Your Rights */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          7. Your Rights
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          You have the following rights regarding your personal data:
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • <Text style={styles.bold}>Access:</Text> Request a copy of your personal data
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • <Text style={styles.bold}>Correction:</Text> Update or correct inaccurate information
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • <Text style={styles.bold}>Deletion:</Text> Request deletion of your account and data
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • <Text style={styles.bold}>Opt-out:</Text> Unsubscribe from promotional communications
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          To exercise these rights, please contact us using the information below.
        </Text>

        <Divider style={styles.divider} />

        {/* Data Retention */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          8. Data Retention
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it by law.
        </Text>

        <Divider style={styles.divider} />

        {/* Children's Privacy */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          9. Children's Privacy
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          Our services are available to users of all ages. For users under 18 years of age, we require parental or guardian consent before using our services. We take appropriate measures to protect the privacy of minors.
        </Text>

        <Divider style={styles.divider} />

        {/* Push Notifications */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          10. Push Notifications
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We send push notifications to keep you informed about:
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Booking confirmations and updates
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Service reminders
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Special offers and promotions (weekend 20% OFF, holiday 25% OFF)
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          You can disable push notifications in your device settings at any time.
        </Text>

        <Divider style={styles.divider} />

        {/* GDPR Compliance */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          11. GDPR Compliance (European Users)
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Right to data portability
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Right to object to processing
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Right to restrict processing
        </Text>
        <Text variant="bodyMedium" style={[styles.bulletPoint, { color: theme.colors.onSurfaceVariant }]}>
          • Right to lodge a complaint with a supervisory authority
        </Text>

        <Divider style={styles.divider} />

        {/* Changes to Privacy Policy */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          12. Changes to This Privacy Policy
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the app and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </Text>

        <Divider style={styles.divider} />

        {/* Contact Information */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          13. Contact Us
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          If you have any questions about this Privacy Policy or our data practices, please contact us:
        </Text>
        
        <View style={[styles.contactBox, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodyMedium" style={[styles.contactItem, { color: theme.colors.onSurface }]}>
            <Text style={styles.bold}>Company:</Text> Deep Cleaning Hub
          </Text>
          <Text variant="bodyMedium" style={[styles.contactItem, { color: theme.colors.onSurface }]}>
            <Text style={styles.bold}>Website:</Text> deepcleaninghub.com
          </Text>
          <Text variant="bodyMedium" style={[styles.contactItem, { color: theme.colors.onSurface }]}>
            <Text style={styles.bold}>Email:</Text> info@deepcleaninghub.com
          </Text>
          <Text variant="bodyMedium" style={[styles.contactItem, { color: theme.colors.onSurface }]}>
            <Text style={styles.bold}>Phone:</Text> +49 160 9704 4182
          </Text>
          <Text variant="bodyMedium" style={[styles.contactItem, { color: theme.colors.onSurface }]}>
            <Text style={styles.bold}>Address:</Text> Frankfurt, Germany
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Consent */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          14. Your Consent
        </Text>
        <Text variant="bodyMedium" style={[styles.paragraph, { color: theme.colors.onSurfaceVariant }]}>
          By using Deep Cleaning Hub, you consent to our Privacy Policy and agree to its terms.
        </Text>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
            © 2024 Deep Cleaning Hub. All rights reserved.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  mainTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  date: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  subTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 22,
  },
  bulletPoint: {
    marginBottom: 8,
    marginLeft: 8,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  contactBox: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  contactItem: {
    marginBottom: 8,
    lineHeight: 22,
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
});

export default PrivacyPolicyScreen;

