const express = require('express');
const { sendEmail, sendOrderConfirmation, sendCancellationEmail } = require('../utils/email');

const router = express.Router();

// @desc    Get email service status
// @route   GET /api/email/status
// @access  Public
router.get('/status', async (req, res) => {
  try {
    const emailService = require('../services/emailService');
    const status = emailService.getStatus();
    
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    console.error('Error getting email service status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Test email service
// @route   GET /api/email/test
// @access  Public
router.get('/test', async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      return res.status(400).json({
        success: false,
        error: 'Admin email not configured'
      });
    }

    const testResult = await sendEmail(
      adminEmail,
      'Test Email from Deep Cleaning Hub',
      '<h1>Test Email</h1><p>This is a test email from the Deep Cleaning Hub backend.</p>',
      'Test Email\n\nThis is a test email from the Deep Cleaning Hub backend.'
    );

    res.json({
      success: testResult.success,
      message: testResult.success ? 'Test email sent successfully' : 'Failed to send test email',
      details: testResult
    });
  } catch (error) {
    console.error('Error testing email service:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Send order confirmation email using proper template
// @route   POST /api/email/order-confirmation
// @access  Public
router.post('/order-confirmation', async (req, res) => {
  try {
    const { customerEmail, customerName, orderId, serviceDate, serviceTime, totalAmount, services, address } = req.body;

    if (!customerEmail || !customerName || !orderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Use the proper email service with templates
    const emailService = require('../services/emailService');
    
    const emailData = {
      customerName,
      customerEmail,
      customerPhone: '+1234567890',
      orderId,
      orderDate: new Date().toLocaleDateString(),
      serviceDate,
      serviceTime,
      totalAmount,
      services: services || [{ name: 'Test Service', price: totalAmount }],
      address: address || {
        street_address: '123 Test Street',
        city: 'Test City',
        postal_code: '12345',
        country: 'Test Country'
      },
      specialInstructions: 'Test instructions',
      isMultiDay: false,
      allBookingDates: []
    };

    const result = await emailService.sendOrderConfirmationEmails(emailData);

    res.json({
      success: result.success,
      message: result.success ? 'Order confirmation emails sent' : 'Failed to send emails',
      details: result
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Send cancellation email
// @route   POST /api/email/cancellation
// @access  Public
router.post('/cancellation', async (req, res) => {
  try {
    const { customerEmail, customerName, orderId, serviceDate, serviceTime, totalAmount, cancellationReason } = req.body;

    if (!customerEmail || !customerName || !orderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendCancellationEmail({
      customerEmail,
      customerName,
      orderId,
      serviceDate,
      serviceTime,
      totalAmount,
      cancellationReason
    });

    res.json({
      success: result.success,
      message: result.success ? 'Cancellation email sent' : 'Failed to send email',
      details: result
    });
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
