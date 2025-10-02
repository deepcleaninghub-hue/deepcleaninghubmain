import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Button, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { whatsappAPI } from '../services/whatsappAPI';

interface WhatsAppTestProps {
  onClose?: () => void;
}

export const WhatsAppTest: React.FC<WhatsAppTestProps> = ({ onClose }) => {
  const theme = useTheme();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestWhatsApp = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await whatsappAPI.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test WhatsApp connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (configured: boolean) => {
    return configured ? theme.colors.primary : theme.colors.error;
  };

  const getStatusIcon = (configured: boolean) => {
    return configured ? 'checkmark-circle' : 'close-circle';
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.header}>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            WhatsApp Integration Test
          </Text>
        </View>

        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Test the WhatsApp integration to ensure order notifications are working properly.
        </Text>

        <Button
          mode="contained"
          onPress={handleTestWhatsApp}
          loading={testing}
          disabled={testing}
          style={[styles.testButton, { backgroundColor: theme.colors.primary }]}
          icon="test-tube"
        >
          {testing ? 'Testing...' : 'Test WhatsApp Connection'}
        </Button>

        {testResult && (
          <View style={[styles.resultContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.resultHeader}>
              <Ionicons 
                name={getStatusIcon(testResult.status?.configured)} 
                size={20} 
                color={getStatusColor(testResult.status?.configured)} 
              />
              <Text 
                variant="titleSmall" 
                style={[styles.resultTitle, { color: getStatusColor(testResult.status?.configured) }]}
              >
                {testResult.success ? 'WhatsApp is Working' : 'WhatsApp Not Configured'}
              </Text>
            </View>

            <Text variant="bodySmall" style={[styles.resultMessage, { color: theme.colors.onSurfaceVariant }]}>
              {testResult.message}
            </Text>

            {testResult.status && (
              <View style={styles.statusDetails}>
                <Text variant="bodySmall" style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                  Provider: {testResult.status.provider}
                </Text>
                <Text variant="bodySmall" style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                  From Number: {testResult.status.fromNumber}
                </Text>
                <Text variant="bodySmall" style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
                  Admin Number: {testResult.status.adminNumber}
                </Text>
              </View>
            )}

            {!testResult.status?.configured && testResult.requiredCredentials && (
              <View style={styles.credentialsContainer}>
                <Text variant="bodySmall" style={[styles.credentialsTitle, { color: theme.colors.error }]}>
                  Required Credentials:
                </Text>
                {Object.entries(testResult.requiredCredentials).map(([key, value]) => (
                  <Text key={key} variant="bodySmall" style={[styles.credentialText, { color: theme.colors.onSurfaceVariant }]}>
                    {key}: {String(value)}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {onClose && (
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.closeButton}
            textColor={theme.colors.primary}
          >
            Close
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    marginLeft: 8,
    fontWeight: '600',
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  testButton: {
    marginBottom: 16,
  },
  resultContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    marginLeft: 8,
    fontWeight: '600',
  },
  resultMessage: {
    marginBottom: 8,
  },
  statusDetails: {
    marginTop: 8,
  },
  statusText: {
    marginBottom: 4,
  },
  credentialsContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 4,
  },
  credentialsTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  credentialText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  closeButton: {
    marginTop: 8,
  },
});
