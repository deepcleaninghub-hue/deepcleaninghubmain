import { ModalConfig } from '../hooks/useAppModal';

type ModalListener = (config: ModalConfig | null) => void;

class ModalService {
  private listeners: ModalListener[] = [];
  private currentModal: ModalConfig | null = null;

  subscribe(listener: ModalListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  showModal(config: ModalConfig) {
    this.currentModal = config;
    this.listeners.forEach(listener => listener(config));
  }

  hideModal() {
    this.currentModal = null;
    this.listeners.forEach(listener => listener(null));
  }

  getCurrentModal() {
    return this.currentModal;
  }

  // Convenience methods
  showError(title: string, message: string) {
    this.showModal({
      title,
      message,
      type: 'error',
    });
  }

  showSuccess(title: string, message: string) {
    this.showModal({
      title,
      message,
      type: 'success',
    });
  }

  showWarning(title: string, message: string) {
    this.showModal({
      title,
      message,
      type: 'warning',
    });
  }

  showInfo(title: string, message: string) {
    this.showModal({
      title,
      message,
      type: 'info',
    });
  }
}

export const modalService = new ModalService();
