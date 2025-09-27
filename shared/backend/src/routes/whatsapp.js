const express = require('express');
const { body, validationResult } = require('express-validator');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

// Test WhatsApp service connection
router.get('/test', async (req, res) => {
  try {
    const status = whatsappService.getStatus();
    
    if (!status.configured) {
      return res.status(200).json({
        success: false,
        message: 'WhatsApp service not configured',
        status,
        requiredCredentials: {
          WHATSAPP_ACCOUNT_SID: 'Your Twilio Account SID',
          WHATSAPP_AUTH_TOKEN: 'Your Twilio Auth Token',
          WHATSAPP_FROM_NUMBER: 'Your WhatsApp Business Number',
          ADMIN_WHATSAPP_NUMBER: 'Admin WhatsApp Number'
        }
      });
    }

    const testResult = await whatsappService.testConnection();
    
    res.status(200).json({
      success: testResult.success,
      message: testResult.message,
      status
    });
  } catch (error) {
    console.error('WhatsApp test error:', error);
    res.status(500).json({
      success: false,
      message: 'WhatsApp test failed',
      error: error.message
    });
  }
});

// Send order confirmation WhatsApp message
router.post('/send-order-confirmation', [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid email is required'),
  body('customerPhone').notEmpty().withMessage('Phone number is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('orderDate').notEmpty().withMessage('Order date is required'),
  body('serviceDate').notEmpty().withMessage('Service date is required'),
  body('serviceTime').notEmpty().withMessage('Service time is required'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('services').isArray().withMessage('Services must be an array'),
  body('address').isObject().withMessage('Address must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const orderData = req.body;
    const result = await whatsappService.sendOrderConfirmationWhatsApp(orderData);

    res.status(200).json(result);
  } catch (error) {
    console.error('WhatsApp order confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send order confirmation WhatsApp',
      error: error.message
    });
  }
});

// Send custom WhatsApp message
router.post('/send-message', [
  body('to').notEmpty().withMessage('Recipient number is required'),
  body('message').notEmpty().withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { to, message } = req.body;
    const result = await whatsappService.sendMessage(to, message);

    res.status(200).json(result);
  } catch (error) {
    console.error('WhatsApp send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp message',
      error: error.message
    });
  }
});

// Get WhatsApp service status
router.get('/status', (req, res) => {
  try {
    const status = whatsappService.getStatus();
    res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    console.error('WhatsApp status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get WhatsApp status',
      error: error.message
    });
  }
});

// Send test message to admin
router.post('/send-test', async (req, res) => {
  try {
    const { message = 'Test message from Deep Cleaning Hub API' } = req.body;
    const result = await whatsappService.sendMessage(
      process.env.ADMIN_WHATSAPP_NUMBER,
      `🧪 ${message}\n\nTime: ${new Date().toLocaleString()}`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('WhatsApp test message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test WhatsApp message',
      error: error.message
    });
  }
});

// Send order cancellation WhatsApp message
router.post('/send-cancellation', [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid email is required'),
  body('customerPhone').notEmpty().withMessage('Phone number is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('orderDate').notEmpty().withMessage('Order date is required'),
  body('serviceDate').notEmpty().withMessage('Service date is required'),
  body('serviceTime').notEmpty().withMessage('Service time is required'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('services').isArray().withMessage('Services must be an array'),
  body('address').isObject().withMessage('Address must be an object'),
  body('cancellationReason').optional().isString(),
  body('cancelledBy').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const orderData = req.body;
    const result = await whatsappService.sendCancellationWhatsApp(orderData);

    res.status(200).json(result);
  } catch (error) {
    console.error('WhatsApp cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send cancellation WhatsApp',
      error: error.message
    });
  }
});

module.exports = router;