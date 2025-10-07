import { httpClient } from './httpClient';


export interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  orderDate: string;
  serviceDate: string;
  serviceTime: string;
  totalAmount: number;
  services: Array<{
    title: string;
    quantity: number;
    price: number;
    duration: string;
  }>;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  specialInstructions?: string;
}

class WhatsAppAPI {
  private baseUrl = '/whatsapp';


  // Send order confirmation WhatsApp message
  async sendOrderConfirmation(orderData: OrderConfirmationData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message: string }>(
        `${this.baseUrl}/send-order-confirmation`,
        orderData
      );
      return response;
    } catch (error) {
      console.error('Error sending order confirmation WhatsApp:', error);
      throw error;
    }
  }

  // Send custom WhatsApp message
  async sendCustomMessage(phoneNumber: string, message: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await httpClient.post<{ success: boolean; message: string }>(
        `${this.baseUrl}/send-message`,
        { phoneNumber, message }
      );
      return response;
    } catch (error) {
      console.error('Error sending custom WhatsApp message:', error);
      throw error;
    }
  }
}

export const whatsappAPI = new WhatsAppAPI();
