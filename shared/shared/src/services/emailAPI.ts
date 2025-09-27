/**
 * Email API Service
 * 
 * Handles email sending functionality for order confirmations
 */

import { httpClient } from './httpClient';

export interface OrderEmailData {
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

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  results?: {
    customer: {
      success: boolean;
      message: string;
      messageId?: string;
    };
    admin: {
      success: boolean;
      message: string;
      messageId?: string;
    };
  };
}

export interface EmailTestResponse {
  success: boolean;
  message: string;
  status?: {
    configured: boolean;
    transporter: string;
  };
}

// Email API
export const emailAPI = {
  /**
   * Send order confirmation emails to both customer and admin
   */
  async sendOrderConfirmationEmails(orderData: OrderEmailData): Promise<EmailResponse> {
    try {
      const response = await httpClient.post<EmailResponse>('/email/send-order-confirmation', orderData);
      return response;
    } catch (error) {
      console.error('Error sending order confirmation emails:', error);
      throw new Error('Failed to send order confirmation emails. Please try again.');
    }
  },

  /**
   * Send customer order confirmation email only
   */
  async sendCustomerConfirmation(orderData: OrderEmailData): Promise<EmailResponse> {
    try {
      const response = await httpClient.post<EmailResponse>('/email/send-customer-confirmation', orderData);
      return response;
    } catch (error) {
      console.error('Error sending customer confirmation email:', error);
      throw new Error('Failed to send customer confirmation email. Please try again.');
    }
  },

  /**
   * Send admin order notification email only
   */
  async sendAdminNotification(orderData: OrderEmailData): Promise<EmailResponse> {
    try {
      const response = await httpClient.post<EmailResponse>('/email/send-admin-notification', orderData);
      return response;
    } catch (error) {
      console.error('Error sending admin notification email:', error);
      throw new Error('Failed to send admin notification email. Please try again.');
    }
  },

  /**
   * Test email service configuration
   */
  async testEmailService(): Promise<EmailTestResponse> {
    try {
      const response = await httpClient.get<EmailTestResponse>('/email/test');
      return response;
    } catch (error) {
      console.error('Error testing email service:', error);
      throw new Error('Failed to test email service. Please try again.');
    }
  },

  /**
   * Send test email
   */
  async sendTestEmail(to: string, type: 'customer' | 'admin'): Promise<EmailResponse> {
    try {
      const response = await httpClient.post<EmailResponse>('/email/send-test', { to, type });
      return response;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw new Error('Failed to send test email. Please try again.');
    }
  }
};
