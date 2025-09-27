const axios = require('axios');

class WhatsAppCloudService {
  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    try {
      if (this.phoneNumberId && this.accessToken && this.adminNumber) {
        this.isConfigured = true;
        console.log('✅ WhatsApp Cloud API service initialized successfully');
      } else {
        this.isConfigured = false;
        console.log('⚠️ WhatsApp Cloud API service not configured - missing credentials');
      }
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp Cloud API service:', error.message);
      this.isConfigured = false;
    }
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      phoneNumberId: this.phoneNumberId,
      adminNumber: this.adminNumber,
      provider: 'whatsapp-cloud-api'
    };
  }

  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, message: 'WhatsApp Cloud API service not configured' };
    }

    try {
      const testMessage = `🧪 WhatsApp Test Message

This is a test message from Deep Cleaning Hub to verify WhatsApp Cloud API integration.

Time: ${new Date().toLocaleString()}`;
      
      const result = await this.sendMessage(this.adminNumber, testMessage);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async sendMessage(to, message) {
    if (!this.isConfigured) {
      return { success: false, message: 'WhatsApp Cloud API service not configured' };
    }

    try {
      const formattedTo = this.formatPhoneNumber(to);
      
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: formattedTo,
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        message: 'WhatsApp message sent successfully via Cloud API'
      };
    } catch (error) {
      console.error('❌ Error sending WhatsApp message via Cloud API:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.error?.message || error.message
      };
    }
  }

  async sendOrderConfirmationWhatsApp(orderData) {
    if (!this.isConfigured) {
      return { success: false, message: 'WhatsApp Cloud API service not configured' };
    }

    try {
      const {
        customerName,
        customerEmail,
        customerPhone = 'Not provided',
        orderId,
        orderDate,
        serviceDate,
        serviceTime,
        totalAmount,
        services,
        address,
        specialInstructions,
        isMultiDay = false,
        allBookingDates = []
      } = orderData;

      // Create WhatsApp message
      const whatsappMessage = this.formatOrderConfirmationMessage({
        customerName,
        customerEmail,
        customerPhone,
        orderId,
        orderDate,
        serviceDate,
        serviceTime,
        totalAmount,
        services,
        address,
        specialInstructions,
        isMultiDay,
        allBookingDates
      });

      // Send to admin
      const result = await this.sendMessage(this.adminNumber, whatsappMessage);
      return result;
    } catch (error) {
      console.error('❌ Error sending order confirmation WhatsApp via Cloud API:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  formatOrderConfirmationMessage(orderData) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderId,
      orderDate,
      serviceDate,
      serviceTime,
      totalAmount,
      services,
      address,
      specialInstructions,
      isMultiDay,
      allBookingDates
    } = orderData;

    const servicesList = services.map(service => `• ${service.name}: €${service.price}`).join('\n');
    
    let serviceInfo = '';
    if (isMultiDay && allBookingDates.length > 0) {
      serviceInfo = `• Service Dates: ${allBookingDates.map(d => d.date).join(', ')}\n• Service Times: ${allBookingDates.map(d => d.time).join(', ')}`;
    } else {
      serviceInfo = `• Service Date: ${serviceDate}\n• Service Time: ${serviceTime}`;
    }
    
    return `🎉 *NEW ORDER CONFIRMATION* 🎉

📋 *Order Details:*
• Order ID: ${orderId}
• Order Date: ${orderDate}
${serviceInfo}
• Total Amount: €${totalAmount}

👤 *Customer Information:*
• Name: ${customerName}
• Email: ${customerEmail}
• Phone: ${customerPhone}

🏠 *Service Address:*
${address.street_address}
${address.city}, ${address.postal_code}
${address.country}

🛠️ *Services Requested:*
${servicesList}

${specialInstructions ? `📝 *Special Instructions:*
${specialInstructions}

` : ''}⏰ *Order Received:* ${new Date().toLocaleString()}

---
🤖 *Automated notification from Deep Cleaning Hub*`;
  }

  async sendCancellationWhatsApp(orderData) {
    if (!this.isConfigured) {
      return { success: false, message: 'WhatsApp Cloud API service not configured' };
    }

    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        orderId,
        orderDate,
        serviceDate,
        serviceTime,
        totalAmount,
        services,
        address,
        cancellationReason,
        cancelledBy
      } = orderData;

      // Create WhatsApp message
      const whatsappMessage = this.formatCancellationMessage({
        customerName,
        customerEmail,
        customerPhone,
        orderId,
        orderDate,
        serviceDate,
        serviceTime,
        totalAmount,
        services,
        address,
        cancellationReason,
        cancelledBy
      });

      // Send to admin
      const result = await this.sendMessage(this.adminNumber, whatsappMessage);
      return result;
    } catch (error) {
      console.error('❌ Error sending cancellation WhatsApp via Cloud API:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  formatCancellationMessage(orderData) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderId,
      orderDate,
      serviceDate,
      serviceTime,
      totalAmount,
      services,
      address,
      cancellationReason,
      cancelledBy
    } = orderData;

    const servicesList = services.map(service => `• ${service.name}: €${service.price}`).join('\n');
    
    return `❌ *ORDER CANCELLATION ALERT* ❌

📋 *Cancelled Order Details:*
• Order ID: ${orderId}
• Order Date: ${orderDate}
• Service Date: ${serviceDate}
• Service Time: ${serviceTime}
• Total Amount: €${totalAmount}
• Status: Cancelled
• Cancelled By: ${cancelledBy || 'Customer'}

👤 *Customer Information:*
• Name: ${customerName}
• Email: ${customerEmail}
• Phone: ${customerPhone}

🏠 *Service Address:*
${address.street_address}
${address.city}, ${address.postal_code}
${address.country}

🛠️ *Services That Were Booked:*
${servicesList}

${cancellationReason ? `📝 *Cancellation Reason:*
${cancellationReason}

` : ''}⏰ *Cancelled At:* ${new Date().toLocaleString()}

---
🤖 *Automated notification from Deep Cleaning Hub*`;
  }

  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming Germany +49)
    if (cleaned.startsWith('0')) {
      cleaned = '49' + cleaned.substring(1);
    } else if (!cleaned.startsWith('49')) {
      cleaned = '49' + cleaned;
    }
    
    return cleaned;
  }
}

// Create singleton instance
const whatsappCloudService = new WhatsAppCloudService();

module.exports = whatsappCloudService;
