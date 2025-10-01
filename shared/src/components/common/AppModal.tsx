import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Text, Button, Card, useTheme, Portal } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export interface AppModalProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | undefined;
  showCancel?: boolean | undefined;
  confirmText?: string | undefined;
  cancelText?: string | undefined;
  onConfirm?: (() => void) | undefined;
  onCancel?: (() => void) | undefined;
  icon?: string | undefined;
}

const AppModal: React.FC<AppModalProps> = ({
  visible,
  onDismiss,
  title,
  message,
  type = 'info',
  showCancel = false,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  icon,
}) => {
  const theme = useTheme();

  const getIconName = () => {
    if (icon) return icon;
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return theme.colors.error;
      case 'warning':
        return '#FF9800';
      default:
        return theme.colors.primary;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onDismiss();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onDismiss();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <Card style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={getIconName() as any} 
                  size={48} 
                  color={getIconColor()} 
                />
              </View>

              {/* Title */}
              <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
                {title}
              </Text>

              {/* Message */}
              <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
                {message}
              </Text>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {showCancel && (
                  <Button
                    mode="outlined"
                    onPress={handleCancel}
                    style={[styles.button, styles.cancelButton]}
                    textColor={theme.colors.onSurface}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  style={[styles.button, styles.confirmButton]}
                  buttonColor={type === 'error' ? theme.colors.error : theme.colors.primary}
                >
                  {confirmText}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  cancelButton: {
    // Additional styles if needed
  },
  confirmButton: {
    // Additional styles if needed
  },
});

export default AppModal;
