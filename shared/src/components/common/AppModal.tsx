import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme, Portal } from 'react-native-paper';
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
  showCloseButton?: boolean | undefined;
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
  showCloseButton = true,
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
        statusBarTranslucent={false}
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
            {/* Close Button */}
            {showCloseButton && (
              <TouchableOpacity 
                style={styles.closeButtonContainer}
                onPress={onDismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={theme.colors.onSurfaceVariant} 
                />
              </TouchableOpacity>
            )}

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
                  contentStyle={styles.buttonContent}
                >
                  {cancelText}
                </Button>
              )}
              <Button
                mode="contained"
                onPress={handleConfirm}
                style={[styles.button, styles.confirmButton]}
                buttonColor={type === 'error' ? theme.colors.error : theme.colors.primary}
                contentStyle={styles.buttonContent}
              >
                {confirmText}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 24,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelButton: {
    // Additional styles if needed
  },
  confirmButton: {
    // Additional styles if needed
  },
});

export default AppModal;
