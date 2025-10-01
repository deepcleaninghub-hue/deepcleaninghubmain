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
}

export const useAppModal = () => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showModal = useCallback((config: ModalConfig) => {
    console.log('useAppModal: showModal called with config:', config);
    setModalConfig(config);
    setVisible(true);
    console.log('useAppModal: Modal visibility set to true');
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
    // Clear config after animation
    setTimeout(() => setModalConfig(null), 300);
  }, []);

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    console.log('useAppModal: showSuccess called with:', { title, message, onConfirm: !!onConfirm });
    showModal({
      title,
      message,
      type: 'success',
      onConfirm,
    });
  }, [showModal]);

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    console.log('useAppModal: showError called with:', { title, message, onConfirm: !!onConfirm });
    showModal({
      title,
      message,
      type: 'error',
      onConfirm,
    });
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'warning',
      onConfirm,
    });
  }, [showModal]);

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showModal({
      title,
      message,
      type: 'info',
      onConfirm,
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
