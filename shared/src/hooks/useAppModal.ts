import { useState, useCallback } from 'react';

export interface ModalConfig {
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

export const useAppModal = () => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showModal = useCallback((config: ModalConfig) => {
    setModalConfig(config);
    setVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
    // Clear config after animation
    setTimeout(() => setModalConfig(null), 300);
  }, []);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'success',
      onConfirm,
      showCloseButton: true,
    });
  }, [showModal]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'error',
      onConfirm,
      showCloseButton: true, // Show close button for all modals
    });
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'warning',
      onConfirm,
      showCloseButton: true,
    });
  }, [showModal]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'info',
      onConfirm,
      showCloseButton: true,
    });
  }, [showModal]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    showModal({
      title,
      message,
      type: 'warning',
      showCancel: true,
      confirmText,
      cancelText,
      onConfirm,
      onCancel,
      showCloseButton: true,
    });
  }, [showModal]);

  return {
    modalConfig,
    visible,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
};
