const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.fromNumber = null;
    this.adminNumber = null;
    this.initialize();
  }

  initialize() {
    try {
      const accountSid = process.env.WHATSAPP_ACCOUNT_SID;
      const authToken = process.env.WHATSAPP_AUTH_TOKEN;
      this.fromNumber = process.env.WHATSAPP_FROM_NUMBER;
      this.adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

      // Check if all required credentials are provided
      if (accountSid && authToken && this.fromNumber && this.adminNumber) {
        this.client = twilio(accountSid, authToken);
        this.isConfigured = true;
        console.log('✅ WhatsApp service initialized successfully');
      } else {
        this.isConfigured = false;
        console.log('⚠️ WhatsApp service not configured - missing credentials');
      }
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp service:', error.message);
      this.isConfigured = false;
    }
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      fromNumber: this.fromNumber,
      adminNumber: this.adminNumber,
      provider: process.env.WHATSAPP_PROVIDER || 'twilio'
    };
  }

  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, message: 'WhatsApp service not configured' };
    }

    try {
      // Test by sending a simple message to admin
      const testMessage = `🧪 WhatsApp Test Message\n\nThis is a test message from Deep Cleaning Hub to verify WhatsApp integration.\n\nTime: ${new Date().toLocaleString()}`;
      
      const result = await this.sendMessage(this.adminNumber, testMessage);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async sendMessage(to, message) {
    if (!this.isConfigured) {
      return { success: false, message: 'WhatsApp service not configured' };
    }

    try {
      // Ensure phone number has proper format
      const formattedTo = this.formatPhoneNumber(to);
      const formattedFrom = this.formatPhoneNumber(this.fromNumber);

<<<<<<< HEAD
      const response = await this.client.messages.create({
        body: message,
        from: `whatsapp:${formattedFrom}`,
=======
      // Handle both sandbox and production numbers
      const fromNumber = this.fromNumber.startsWith('whatsapp:') ? this.fromNumber : `whatsapp:${formattedFrom}`;
      
      const response = await this.client.messages.create({
        body: message,
        from: fromNumber,
>>>>>>> refs/remotes/origin/main
        to: `whatsapp:${formattedTo}`
      });

      return {
        success: true,
        messageId: response.sid,
        message: 'WhatsApp message sent successfully'
      };
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sendOrderConfirmationWhatsApp(orderData) {
    if (!this.isConfigured) {
      return { success: false, message: 'WhatsApp service not configured' };
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
        specialInstructions
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
        specialInstructions
      });

<<<<<<< HEAD
      // Send to admin
      const result = await this.sendMessage(this.adminNumber, whatsappMessage);
=======
      // Log WhatsApp message content for debugging
      console.log('📱 WHATSAPP MESSAGE CONTENT:');
      console.log('📱 To: ' + this.adminNumber);
      console.log('📱 Message Length: ' + whatsappMessage.length + ' characters');
      console.log('📱 Message Content:');
      console.log(whatsappMessage);
      console.log('📱 --- End of WhatsApp Message ---');

      // Send to admin
      const result = await this.sendMessage(this.adminNumber, whatsappMessage);
      console.log('📱 WhatsApp message sent! Result: ' + JSON.stringify(result));
>>>>>>> refs/remotes/origin/main
      return result;
    } catch (error) {
      console.error('❌ Error sending order confirmation WhatsApp:', error);
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
      specialInstructions
    } = orderData;

    const servicesList = services.map(service => `• ${service.name}: ${service.price}`).join('\n');
    
    return `🎉 *NEW ORDER CONFIRMATION* 🎉

📋 *Order Details:*
• Order ID: ${orderId}
• Order Date: ${orderDate}
• Service Date: ${serviceDate}
• Service Time: ${serviceTime}
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

  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming Germany +49)
    if (cleaned.startsWith('0')) {
      cleaned = '49' + cleaned.substring(1);
    } else if (!cleaned.startsWith('49')) {
      cleaned = '49' + cleaned;
    }
    
    return '+' + cleaned;
  }

  async sendOrderConfirmationEmails(orderData) {
    // This method combines both email and WhatsApp
    const results = {
      email: { success: false, message: 'Not implemented' },
      whatsapp: { success: false, message: 'Not implemented' }
    };

    // Send WhatsApp message
    if (this.isConfigured) {
      results.whatsapp = await this.sendOrderConfirmationWhatsApp(orderData);
    } else {
      results.whatsapp = { success: false, message: 'WhatsApp service not configured' };
    }

    return {
      success: results.whatsapp.success,
      message: 'Order confirmation notifications processed',
      results
    };
  }

  async sendCancellationWhatsApp(orderData) {
    if (!this.isConfigured) {
      return { success: false, message: 'WhatsApp service not configured' };
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
      console.error('❌ Error sending cancellation WhatsApp:', error);
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

    const servicesList = services.map(service => `• ${service.name}: ${service.price}`).join('\n');
    
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
}

// Create singleton instance
const whatsappService = new WhatsAppService();

module.exports = whatsappService;