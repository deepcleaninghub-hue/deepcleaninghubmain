# Twilio WhatsApp Integration Setup Guide

This guide will help you set up WhatsApp messaging using Twilio for the Deep Clean Hub system.

## Overview

Twilio provides a simple and reliable way to send WhatsApp messages. The integration allows the system to automatically send order confirmation messages to the admin when a new order is placed.

## Prerequisites

1. A Twilio account (free trial available)
2. A phone number (can use Twilio's WhatsApp Sandbox for testing)
3. Basic understanding of environment variables

## Setup Steps

### Step 1: Create Twilio Account

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your phone number and email

### Step 2: Get Your Credentials

1. In the Twilio Console, go to the **Dashboard**
2. Copy your **Account SID** (starts with `AC...`)
3. Copy your **Auth Token** (click "Show" to reveal it)

### Step 3: Set Up WhatsApp

#### Option A: WhatsApp Sandbox (For Testing)

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the instructions to set up the sandbox
3. You'll get a sandbox number like `+1 415 523 8886`
4. Send the join code to this number from your WhatsApp

#### Option B: WhatsApp Business Number (For Production)

1. Apply for WhatsApp Business API access through Twilio
2. Get approval for your business use case
3. Receive a dedicated WhatsApp Business number

### Step 4: Configure Environment Variables

Update your `.env` file with the following:

```env
# WhatsApp Configuration (Twilio)
WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_AUTH_TOKEN=your_auth_token_here
WHATSAPP_FROM_NUMBER=+14155238886
ADMIN_WHATSAPP_NUMBER=+4916097044182
WHATSAPP_PROVIDER=twilio
```

**Important Notes:**
- Replace `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual Account SID
- Replace `your_auth_token_here` with your actual Auth Token
- For sandbox testing, use the sandbox number (e.g., `+14155238886`)
- For production, use your approved WhatsApp Business number
- The admin number should be in international format

### Step 5: Install Twilio SDK

The Twilio SDK should already be installed, but if not:

```bash
cd backend
npm install twilio
```

### Step 6: Test the Integration

Run the test script to verify your setup:

```bash
cd backend
node test-whatsapp.js
```

## API Endpoints

Once configured, you can use these endpoints:

### 1. Check Status
```bash
GET /api/whatsapp/status
```

### 2. Test Connection
```bash
GET /api/whatsapp/test
```

### 3. Send Order Confirmation
```bash
POST /api/whatsapp/send-order-confirmation
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+49123456789",
  "orderId": "ORD-001",
  "orderDate": "2024-01-15",
  "serviceDate": "2024-01-20",
  "serviceTime": "10:00 AM",
  "totalAmount": 150.00,
  "services": [
    {"name": "Deep Cleaning", "price": "€100.00"}
  ],
  "address": {
    "street_address": "123 Main St",
    "city": "Berlin",
    "postal_code": "10115",
    "country": "Germany"
  }
}
```

### 4. Send Custom Message
```bash
POST /api/whatsapp/send-message
Content-Type: application/json

{
  "to": "+4916097044182",
  "message": "Hello! This is a test message."
}
```

### 5. Send Test Message
```bash
POST /api/whatsapp/send-test
Content-Type: application/json

{
  "message": "Custom test message"
}
```

## Message Format

The WhatsApp messages sent to the admin include:

```
🎉 NEW ORDER CONFIRMATION 🎉

📋 Order Details:
• Order ID: ORD-001
• Order Date: 2024-01-15
• Service Date: 2024-01-20
• Service Time: 10:00 AM
• Total Amount: €150.00

👤 Customer Information:
• Name: John Doe
• Email: john@example.com
• Phone: +49123456789

🏠 Service Address:
123 Main St
Berlin, 10115
Germany

🛠️ Services Requested:
• Deep Cleaning: €100.00

📝 Special Instructions:
Please use eco-friendly products

⏰ Order Received: 1/15/2024, 2:30:45 PM

---
🤖 Automated notification from Deep Cleaning Hub
```

## Troubleshooting

### Common Issues

1. **"accountSid must start with AC"**
   - Make sure your Account SID starts with "AC"
   - Check for typos in the environment variable

2. **"Authentication failed"**
   - Verify your Auth Token is correct
   - Make sure there are no extra spaces in the environment variables

3. **"Invalid phone number"**
   - Ensure phone numbers are in international format (+49...)
   - Check that the admin number is correct

4. **"WhatsApp service not configured"**
   - Verify all required environment variables are set
   - Restart the server after updating .env

### Debug Mode

Enable detailed logging by setting:

```env
LOG_LEVEL=debug
```

### Testing with Sandbox

For sandbox testing:
1. Use the sandbox number as `WHATSAPP_FROM_NUMBER`
2. Send the join code to the sandbox number from your WhatsApp
3. Test messages will be sent from the sandbox number

## Production Considerations

### Rate Limits
- Twilio has rate limits for WhatsApp messages
- Free tier: 1,000 messages per month
- Paid tiers: Higher limits based on your plan

### Message Templates
- For production, you may need to use approved message templates
- Templates are required for certain types of messages

### Webhook Setup
- Set up webhooks to receive delivery status updates
- Handle failed message deliveries

## Cost Information

- **Free Trial**: $15 credit included
- **WhatsApp Messages**: ~$0.005 per message
- **Phone Numbers**: ~$1/month per number
- **Check current pricing**: [Twilio Pricing](https://www.twilio.com/pricing)

## Security Best Practices

1. **Never commit credentials to version control**
2. **Use environment variables for all sensitive data**
3. **Rotate your Auth Token regularly**
4. **Monitor your usage and costs**

## Support

If you encounter issues:

1. Check the Twilio Console for error logs
2. Verify your credentials are correct
3. Test with the provided test script
4. Check Twilio's documentation for updates

## Next Steps

1. Set up your Twilio account
2. Configure the environment variables
3. Test the integration
4. Deploy to production when ready

---

**Note**: The phone number you configure as `WHATSAPP_FROM_NUMBER` will be the sender number for all WhatsApp messages. Recipients will see this as the sender, so make sure it's appropriate for your business.
