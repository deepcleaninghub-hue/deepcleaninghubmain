const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

// Configure AWS SES
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const ses = new AWS.SES();

// Create nodemailer transporter (for fallback)
const transporter = nodemailer.createTransport({
  SES: { ses, aws: AWS }
});

class EmailService {
  constructor() {
    this.fromEmail = process.env.AWS_FROM_EMAIL || process.env.SMTP_FROM_EMAIL;
    this.adminEmail = process.env.ADMIN_EMAIL;
    this.isConfigured = !!(this.fromEmail && this.adminEmail);
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      fromEmail: this.fromEmail,
      adminEmail: this.adminEmail,
      region: process.env.AWS_REGION || 'us-east-1'
    };
  }

  async testConnection() {
    try {
      if (!this.isConfigured) {
        throw new Error('Email service not properly configured. Please set AWS credentials in .env file');
      }

      // Test AWS SES directly first
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        try {
          // Test AWS SES connection
          const params = {
            Source: this.fromEmail,
            Destination: {
              ToAddresses: [this.adminEmail]
            },
            Message: {
              Subject: {
                Data: 'AWS SES Test Email',
                Charset: 'UTF-8'
              },
              Body: {
                Html: {
                  Data: '<p>This is a test email from <strong>Deep Cleaning Hub</strong> backend using AWS SES.</p>',
                  Charset: 'UTF-8'
                },
                Text: {
                  Data: 'This is a test email from Deep Cleaning Hub backend using AWS SES.',
                  Charset: 'UTF-8'
                }
              }
            }
          };

          const result = await ses.sendEmail(params).promise();
          return {
            success: true,
            messageId: result.MessageId,
            message: 'AWS SES test email sent successfully',
            provider: 'AWS SES'
          };
        } catch (awsError) {
          console.error('AWS SES Error:', awsError);
          throw new Error(`AWS SES Error: ${awsError.message}`);
        }
      } else {
        throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'AWS SES'
      };
    }
  }

  async sendOrderConfirmationEmails(bookingData) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const results = [];

    try {
      // Send email to customer
      const customerEmail = await this.sendCustomerConfirmationEmail(bookingData);
      results.push(customerEmail);

      // Send email to admin
      const adminEmail = await this.sendAdminConfirmationEmail(bookingData);
      results.push(adminEmail);

      return {
        success: true,
        results: results
      };
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
      return {
        success: false,
        error: error.message,
        results: results
      };
    }
  }

  async sendCustomerConfirmationEmail(bookingData) {
    const emailContent = this.generateCustomerConfirmationEmail(bookingData);
    
    // Log email content for debugging
    console.log('📧 CUSTOMER EMAIL CONTENT:');
    console.log('📧 Subject: Order Confirmation - ' + bookingData.orderId);
    console.log('📧 To: ' + bookingData.customerEmail);
    console.log('📧 HTML Content Length: ' + emailContent.html.length + ' characters');
    console.log('📧 Text Content Length: ' + emailContent.text.length + ' characters');
    console.log('📧 Text Content Preview:');
    console.log(emailContent.text.substring(0, 500) + '...');
    
    try {
      const params = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [bookingData.customerEmail]
        },
        Message: {
          Subject: {
            Data: `Order Confirmation - ${bookingData.orderId}`,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: emailContent.html,
              Charset: 'UTF-8'
            },
            Text: {
              Data: emailContent.text,
              Charset: 'UTF-8'
            }
          }
        }
      };

      const result = await ses.sendEmail(params).promise();
      console.log('📧 Customer email sent successfully! Message ID: ' + result.MessageId);
      return {
        type: 'customer',
        success: true,
        messageId: result.MessageId,
        to: bookingData.customerEmail,
        provider: 'AWS SES'
      };
    } catch (error) {
      console.error('Error sending customer confirmation email:', error);
      throw error;
    }
  }

  async sendAdminConfirmationEmail(bookingData) {
    const emailContent = this.generateAdminConfirmationEmail(bookingData);
    
    // Log email content for debugging
    console.log('📧 ADMIN EMAIL CONTENT:');
    console.log('📧 Subject: New Order Received - ' + bookingData.orderId);
    console.log('📧 To: ' + this.adminEmail);
    console.log('📧 HTML Content Length: ' + emailContent.html.length + ' characters');
    console.log('📧 Text Content Length: ' + emailContent.text.length + ' characters');
    console.log('📧 Text Content Preview:');
    console.log(emailContent.text.substring(0, 500) + '...');
    
    try {
      const params = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [this.adminEmail]
        },
        Message: {
          Subject: {
            Data: `New Order Received - ${bookingData.orderId}`,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: emailContent.html,
              Charset: 'UTF-8'
            },
            Text: {
              Data: emailContent.text,
              Charset: 'UTF-8'
            }
          }
        }
      };

      const result = await ses.sendEmail(params).promise();
      console.log('📧 Admin email sent successfully! Message ID: ' + result.MessageId);
      return {
        type: 'admin',
        success: true,
        messageId: result.MessageId,
        to: this.adminEmail,
        provider: 'AWS SES'
      };
    } catch (error) {
      console.error('Error sending admin confirmation email:', error);
      throw error;
    }
  }

  async sendCancellationEmails(bookingData) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const results = [];

    try {
      // Send cancellation email to customer
      const customerEmail = await this.sendCustomerCancellationEmail(bookingData);
      results.push(customerEmail);

      // Send cancellation email to admin
      const adminEmail = await this.sendAdminCancellationEmail(bookingData);
      results.push(adminEmail);

      return {
        success: true,
        results: results
      };
    } catch (error) {
      console.error('Error sending cancellation emails:', error);
      return {
        success: false,
        error: error.message,
        results: results
      };
    }
  }

  async sendCustomerCancellationEmail(bookingData) {
    const emailContent = this.generateCustomerCancellationEmail(bookingData);
    
    const mailOptions = {
      from: this.fromEmail,
      to: bookingData.customerEmail,
      subject: `Order Cancelled - ${bookingData.orderId}`,
      html: emailContent.html,
      text: emailContent.text
    };

    const result = await transporter.sendMail(mailOptions);
    return {
      type: 'customer',
      success: true,
      messageId: result.messageId,
      to: bookingData.customerEmail
    };
  }

  async sendAdminCancellationEmail(bookingData) {
    const emailContent = this.generateAdminCancellationEmail(bookingData);
    
    const mailOptions = {
      from: this.fromEmail,
      to: this.adminEmail,
      subject: `Order Cancelled - ${bookingData.orderId}`,
      html: emailContent.html,
      text: emailContent.text
    };

    const result = await transporter.sendMail(mailOptions);
    return {
      type: 'admin',
      success: true,
      messageId: result.messageId,
      to: this.adminEmail
    };
  }

  generateCustomerConfirmationEmail(bookingData) {
    const isMultiDay = bookingData.isMultiDay && bookingData.allBookingDates;
    const serviceDate = isMultiDay ? 'Multiple dates' : bookingData.serviceDate;
    const serviceTime = isMultiDay ? 'Multiple times' : bookingData.serviceTime;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .highlight { color: #e74c3c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for choosing Deep Cleaning Hub!</p>
          </div>
          
          <div class="content">
            <h2>Order Details</h2>
            <div class="order-details">
              <p><strong>Order ID:</strong> ${bookingData.orderId}</p>
              <p><strong>Customer:</strong> ${bookingData.customerName}</p>
              <p><strong>Email:</strong> ${bookingData.customerEmail}</p>
              <p><strong>Phone:</strong> ${bookingData.customerPhone}</p>
              <p><strong>Service Date:</strong> ${serviceDate}</p>
              <p><strong>Service Time:</strong> ${serviceTime}</p>
              <p><strong>Total Amount:</strong> <span class="highlight">€${bookingData.totalAmount}</span></p>
              
              ${isMultiDay ? `
                <h3>All Scheduled Dates:</h3>
                <ul>
                  ${bookingData.allBookingDates.map(date => `
                    <li>${new Date(date.date).toLocaleDateString()} at ${date.time}</li>
                  `).join('')}
                </ul>
              ` : ''}
              
              <h3>Services:</h3>
              <ul>
                ${bookingData.services.map(service => `
                  <li>${service.name} - €${service.price}</li>
                `).join('')}
              </ul>
              
              <h3>Service Address:</h3>
              <p>${bookingData.address.street_address}<br>
              ${bookingData.address.city} ${bookingData.address.postal_code}<br>
              ${bookingData.address.country}</p>
              
              ${bookingData.specialInstructions ? `
                <h3>Special Instructions:</h3>
                <p>${bookingData.specialInstructions}</p>
              ` : ''}
            </div>
            
            <p>We will contact you soon to confirm the details and schedule your service.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          
          <div class="footer">
            <p>Deep Cleaning Hub<br>
            Professional Cleaning Services</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Confirmation - ${bookingData.orderId}

Dear ${bookingData.customerName},

Thank you for choosing Deep Cleaning Hub!

Order Details:
- Order ID: ${bookingData.orderId}
- Customer: ${bookingData.customerName}
- Email: ${bookingData.customerEmail}
- Phone: ${bookingData.customerPhone}
- Service Date: ${serviceDate}
- Service Time: ${serviceTime}
- Total Amount: €${bookingData.totalAmount}

${isMultiDay ? `
All Scheduled Dates:
${bookingData.allBookingDates.map(date => `- ${new Date(date.date).toLocaleDateString()} at ${date.time}`).join('\n')}
` : ''}

Services:
${bookingData.services.map(service => `- ${service.name} - €${service.price}`).join('\n')}

Service Address:
${bookingData.address.street_address}
${bookingData.address.city} ${bookingData.address.postal_code}
${bookingData.address.country}

${bookingData.specialInstructions ? `Special Instructions: ${bookingData.specialInstructions}` : ''}

We will contact you soon to confirm the details and schedule your service.

Best regards,
Deep Cleaning Hub Team
    `;

    return { html, text };
  }

  generateAdminConfirmationEmail(bookingData) {
    const isMultiDay = bookingData.isMultiDay && bookingData.allBookingDates;
    const serviceDate = isMultiDay ? 'Multiple dates' : bookingData.serviceDate;
    const serviceTime = isMultiDay ? 'Multiple times' : bookingData.serviceTime;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .highlight { color: #e74c3c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received</h1>
            <p>Order ID: ${bookingData.orderId}</p>
          </div>
          
          <div class="content">
            <h2>Customer Information</h2>
            <div class="order-details">
              <p><strong>Name:</strong> ${bookingData.customerName}</p>
              <p><strong>Email:</strong> ${bookingData.customerEmail}</p>
              <p><strong>Phone:</strong> ${bookingData.customerPhone}</p>
              <p><strong>Service Date:</strong> ${serviceDate}</p>
              <p><strong>Service Time:</strong> ${serviceTime}</p>
              <p><strong>Total Amount:</strong> <span class="highlight">€${bookingData.totalAmount}</span></p>
              
              ${isMultiDay ? `
                <h3>All Scheduled Dates:</h3>
                <ul>
                  ${bookingData.allBookingDates.map(date => `
                    <li>${new Date(date.date).toLocaleDateString()} at ${date.time}</li>
                  `).join('')}
                </ul>
              ` : ''}
              
              <h3>Services:</h3>
              <ul>
                ${bookingData.services.map(service => `
                  <li>${service.name} - €${service.price}</li>
                `).join('')}
              </ul>
              
              <h3>Service Address:</h3>
              <p>${bookingData.address.street_address}<br>
              ${bookingData.address.city} ${bookingData.address.postal_code}<br>
              ${bookingData.address.country}</p>
              
              ${bookingData.specialInstructions ? `
                <h3>Special Instructions:</h3>
                <p>${bookingData.specialInstructions}</p>
              ` : ''}
            </div>
            
            <p><strong>Action Required:</strong> Please contact the customer to confirm the booking details and schedule.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
New Order Received - ${bookingData.orderId}

Customer Information:
- Name: ${bookingData.customerName}
- Email: ${bookingData.customerEmail}
- Phone: ${bookingData.customerPhone}
- Service Date: ${serviceDate}
- Service Time: ${serviceTime}
- Total Amount: €${bookingData.totalAmount}

${isMultiDay ? `
All Scheduled Dates:
${bookingData.allBookingDates.map(date => `- ${new Date(date.date).toLocaleDateString()} at ${date.time}`).join('\n')}
` : ''}

Services:
${bookingData.services.map(service => `- ${service.name} - €${service.price}`).join('\n')}

Service Address:
${bookingData.address.street_address}
${bookingData.address.city} ${bookingData.address.postal_code}
${bookingData.address.country}

${bookingData.specialInstructions ? `Special Instructions: ${bookingData.specialInstructions}` : ''}

Action Required: Please contact the customer to confirm the booking details and schedule.
    `;

    return { html, text };
  }

  generateCustomerCancellationEmail(bookingData) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
            <p>Order ID: ${bookingData.orderId}</p>
          </div>
          
          <div class="content">
            <p>Dear ${bookingData.customerName},</p>
            
            <p>Your order has been successfully cancelled.</p>
            
            <div class="order-details">
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${bookingData.orderId}</p>
              <p><strong>Service Date:</strong> ${bookingData.serviceDate}</p>
              <p><strong>Service Time:</strong> ${bookingData.serviceTime}</p>
              <p><strong>Total Amount:</strong> €${bookingData.totalAmount}</p>
              <p><strong>Cancellation Reason:</strong> ${bookingData.cancellationReason}</p>
              <p><strong>Cancelled By:</strong> ${bookingData.cancelledBy}</p>
            </div>
            
            <p>If you have any questions or would like to reschedule, please contact us.</p>
            <p>We hope to serve you again in the future.</p>
          </div>
          
          <div class="footer">
            <p>Deep Cleaning Hub<br>
            Professional Cleaning Services</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Cancelled - ${bookingData.orderId}

Dear ${bookingData.customerName},

Your order has been successfully cancelled.

Order Details:
- Order ID: ${bookingData.orderId}
- Service Date: ${bookingData.serviceDate}
- Service Time: ${bookingData.serviceTime}
- Total Amount: €${bookingData.totalAmount}
- Cancellation Reason: ${bookingData.cancellationReason}
- Cancelled By: ${bookingData.cancelledBy}

If you have any questions or would like to reschedule, please contact us.

Best regards,
Deep Cleaning Hub Team
    `;

    return { html, text };
  }

  generateAdminCancellationEmail(bookingData) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
            <p>Order ID: ${bookingData.orderId}</p>
          </div>
          
          <div class="content">
            <h2>Customer Information</h2>
            <div class="order-details">
              <p><strong>Name:</strong> ${bookingData.customerName}</p>
              <p><strong>Email:</strong> ${bookingData.customerEmail}</p>
              <p><strong>Phone:</strong> ${bookingData.customerPhone}</p>
              <p><strong>Service Date:</strong> ${bookingData.serviceDate}</p>
              <p><strong>Service Time:</strong> ${bookingData.serviceTime}</p>
              <p><strong>Total Amount:</strong> €${bookingData.totalAmount}</p>
              <p><strong>Cancellation Reason:</strong> ${bookingData.cancellationReason}</p>
              <p><strong>Cancelled By:</strong> ${bookingData.cancelledBy}</p>
            </div>
            
            <p><strong>Action Required:</strong> Update your records and process any necessary refunds.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Cancelled - ${bookingData.orderId}

Customer Information:
- Name: ${bookingData.customerName}
- Email: ${bookingData.customerEmail}
- Phone: ${bookingData.customerPhone}
- Service Date: ${bookingData.serviceDate}
- Service Time: ${bookingData.serviceTime}
- Total Amount: €${bookingData.totalAmount}
- Cancellation Reason: ${bookingData.cancellationReason}
- Cancelled By: ${bookingData.cancelledBy}

Action Required: Update your records and process any necessary refunds.
    `;

    return { html, text };
  }
}

module.exports = new EmailService();
