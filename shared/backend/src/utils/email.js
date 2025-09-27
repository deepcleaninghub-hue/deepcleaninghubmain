const nodemailer = require('nodemailer');

// Create transporter for email sending
const createTransporter = () => {
<<<<<<< HEAD
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
=======
  // Check if AWS SES is configured
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const AWS = require('aws-sdk');
    const ses = new AWS.SES({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    return nodemailer.createTransport({
      SES: { ses, aws: AWS }
    });
  }

  // Fallback to SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
>>>>>>> refs/remotes/origin/main
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send email function
const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter();
    const fromEmail = process.env.AWS_FROM_EMAIL || process.env.SMTP_FROM_EMAIL;

    if (!fromEmail) {
      throw new Error('No from email configured');
    }

    const mailOptions = {
      from: fromEmail,
      to: to,
      subject: subject,
      html: html,
      text: text
    };

    const result = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send order confirmation email
const sendOrderConfirmation = async (orderData) => {
  const { customerEmail, customerName, orderId, serviceDate, serviceTime, totalAmount, services, address } = orderData;

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
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Service Date:</strong> ${serviceDate}</p>
            <p><strong>Service Time:</strong> ${serviceTime}</p>
            <p><strong>Total Amount:</strong> <span class="highlight">€${totalAmount}</span></p>
            
            <h3>Services:</h3>
            <ul>
              ${services.map(service => `<li>${service.name} - €${service.price}</li>`).join('')}
            </ul>
            
            <h3>Service Address:</h3>
            <p>${address.street_address}<br>
            ${address.city} ${address.postal_code}<br>
            ${address.country}</p>
          </div>
          
          <p>We will contact you soon to confirm the details and schedule your service.</p>
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
Order Confirmation - ${orderId}

Dear ${customerName},

Thank you for choosing Deep Cleaning Hub!

Order Details:
- Order ID: ${orderId}
- Service Date: ${serviceDate}
- Service Time: ${serviceTime}
- Total Amount: €${totalAmount}

Services:
${services.map(service => `- ${service.name} - €${service.price}`).join('\n')}

Service Address:
${address.street_address}
${address.city} ${address.postal_code}
${address.country}

We will contact you soon to confirm the details and schedule your service.

Best regards,
Deep Cleaning Hub Team
  `;

  return await sendEmail(customerEmail, `Order Confirmation - ${orderId}`, html, text);
};

// Send cancellation email
const sendCancellationEmail = async (orderData) => {
  const { customerEmail, customerName, orderId, serviceDate, serviceTime, totalAmount, cancellationReason } = orderData;

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
          <p>Order ID: ${orderId}</p>
        </div>
        
        <div class="content">
          <p>Dear ${customerName},</p>
          
          <p>Your order has been successfully cancelled.</p>
          
          <div class="order-details">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Service Date:</strong> ${serviceDate}</p>
            <p><strong>Service Time:</strong> ${serviceTime}</p>
            <p><strong>Total Amount:</strong> €${totalAmount}</p>
            <p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>
          </div>
          
          <p>If you have any questions or would like to reschedule, please contact us.</p>
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
Order Cancelled - ${orderId}

Dear ${customerName},

Your order has been successfully cancelled.

Order Details:
- Order ID: ${orderId}
- Service Date: ${serviceDate}
- Service Time: ${serviceTime}
- Total Amount: €${totalAmount}
- Cancellation Reason: ${cancellationReason}

If you have any questions or would like to reschedule, please contact us.

Best regards,
Deep Cleaning Hub Team
  `;

  return await sendEmail(customerEmail, `Order Cancelled - ${orderId}`, html, text);
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendCancellationEmail,
  createTransporter
};
