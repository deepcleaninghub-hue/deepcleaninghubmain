import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Button, Card, useTheme, Portal, IconButton } from 'react-native-paper';
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
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={onDismiss}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <Card style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
              {/* Close Button */}
              {showCloseButton && (
                <View style={styles.closeButtonContainer}>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={onDismiss}
                    iconColor={theme.colors.onSurfaceVariant}
                    style={styles.closeButton}
                  />
                </View>
              )}

              <Card.Content style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={getIconName() as any} 
                    size={40} 
                    color={getIconColor()} 
                  />
                </View>

                {/* Title */}
                <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
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
          </TouchableOpacity>
        </TouchableOpacity>
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
    width: '90%',
    maxWidth: 350,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    position: 'relative',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  closeButton: {
    margin: 0,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 40, // Extra space for close button
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 18,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 8,
    minHeight: 40,
  },
  cancelButton: {
    // Additional styles if needed
  },
  confirmButton: {
    // Additional styles if needed
  },
});

export default AppModal;
