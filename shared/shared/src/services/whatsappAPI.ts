import { httpClient } from './httpClient';

export interface WhatsAppMessageData {
  to: string;
  message: string;
}

export interface OrderWhatsAppData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  orderDate: string;
  serviceDate: string;
  serviceTime: string;
  totalAmount: number;
  services: Array<{
    name: string;
    price: string;
  }>;
  address: {
    street_address: string;
    city: string;
    postal_code: string;
    country: string;
  };
  specialInstructions?: string;
}

export interface WhatsAppServiceResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

export interface WhatsAppStatusResponse {
  success: boolean;
  status: {
    configured: boolean;
    fromNumber: string | null;
    adminNumber: string | null;
    provider: string;
  };
}

const whatsappAPI = {
  /**
   * Send order confirmation WhatsApp message to admin
   */
  async sendOrderConfirmationWhatsApp(data: OrderWhatsAppData): Promise<WhatsAppServiceResponse> {
    try {
      const response = await httpClient.post('/api/whatsapp/send-order-confirmation', data);
      return response;
    } catch (error) {
      console.error('Error sending order confirmation WhatsApp:', error);
      throw error;
    }
  },

  /**
   * Send custom WhatsApp message
   */
  async sendMessage(data: WhatsAppMessageData): Promise<WhatsAppServiceResponse> {
    try {
      const response = await httpClient.post('/api/whatsapp/send-message', data);
      return response;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  },

  /**
   * Test WhatsApp service connection
   */
  async testConnection(): Promise<WhatsAppServiceResponse> {
    try {
      const response = await httpClient.get('/api/whatsapp/test');
      return response;
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error);
      throw error;
    }
  },

  /**
   * Get WhatsApp service status
   */
  async getStatus(): Promise<WhatsAppStatusResponse> {
    try {
      const response = await httpClient.get('/api/whatsapp/status');
      return response;
    } catch (error) {
      console.error('Error getting WhatsApp status:', error);
      throw error;
    }
  },

  /**
   * Send test message to admin
   */
  async sendTestMessage(message?: string): Promise<WhatsAppServiceResponse> {
    try {
      const response = await httpClient.post('/api/whatsapp/send-test', { message });
      return response;
    } catch (error) {
      console.error('Error sending test WhatsApp message:', error);
      throw error;
    }
  }
};

export default whatsappAPI;
