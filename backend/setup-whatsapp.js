/**
 * WhatsApp Setup Helper Script
 * 
 * This script helps you set up WhatsApp integration with Twilio
 * Run with: node setup-whatsapp.js
 */

require('dotenv').config();

console.log('🚀 WhatsApp Integration Setup Helper\n');

// Check current configuration
console.log('📋 Current Configuration:');
console.log('─'.repeat(40));

const requiredVars = [
  'WHATSAPP_ACCOUNT_SID',
  'WHATSAPP_AUTH_TOKEN', 
  'WHATSAPP_FROM_NUMBER',
  'ADMIN_WHATSAPP_NUMBER'
];

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== `your_${varName.toLowerCase()}_here` && value !== 'your_whatsapp_business_number') {
    console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
  } else {
    console.log(`❌ ${varName}: Not configured`);
    allConfigured = false;
  }
});

console.log('─'.repeat(40));

if (allConfigured) {
  console.log('\n🎉 All required variables are configured!');
  console.log('\n🧪 You can now test the integration:');
  console.log('   node test-whatsapp.js');
  console.log('\n📡 Or test via API:');
  console.log('   curl http://localhost:5001/api/whatsapp/status');
} else {
  console.log('\n⚠️  Configuration incomplete. Please follow these steps:\n');
  
  console.log('1️⃣  Create a Twilio account:');
  console.log('   https://console.twilio.com/\n');
  
  console.log('2️⃣  Get your credentials from Twilio Console:');
  console.log('   - Account SID (starts with AC...)');
  console.log('   - Auth Token\n');
  
  console.log('3️⃣  Set up WhatsApp (choose one):');
  console.log('   Option A - Sandbox (for testing):');
  console.log('   - Go to Messaging → Try it out → Send a WhatsApp message');
  console.log('   - Follow the sandbox setup instructions\n');
  console.log('   Option B - Business Number (for production):');
  console.log('   - Apply for WhatsApp Business API access\n');
  
  console.log('4️⃣  Update your .env file:');
  console.log('   WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('   WHATSAPP_AUTH_TOKEN=your_auth_token_here');
  console.log('   WHATSAPP_FROM_NUMBER=+14155238886  # or your business number');
  console.log('   ADMIN_WHATSAPP_NUMBER=+4916097044182\n');
  
  console.log('5️⃣  Test the integration:');
  console.log('   node test-whatsapp.js\n');
  
  console.log('📚 For detailed instructions, see:');
  console.log('   TWILIO_WHATSAPP_SETUP.md');
}

console.log('\n🔗 Useful Links:');
console.log('   Twilio Console: https://console.twilio.com/');
console.log('   Twilio WhatsApp Docs: https://www.twilio.com/docs/whatsapp');
console.log('   Twilio Pricing: https://www.twilio.com/pricing');
