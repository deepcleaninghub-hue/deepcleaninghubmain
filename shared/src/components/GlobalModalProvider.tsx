import React, { useState, useEffect } from 'react';
import { modalService } from '../services/modalService';
import AppModal from './common/AppModal';

export const GlobalModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalConfig, setModalConfig] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = modalService.subscribe((config) => {
      setModalConfig(config);
      setVisible(!!config);
    });

    return unsubscribe;
  }, []);

  const hideModal = () => {
    setVisible(false);
    // Clear config after animation
    setTimeout(() => setModalConfig(null), 300);
  };

  return (
    <>
      {children}
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
    </>
  );
};
