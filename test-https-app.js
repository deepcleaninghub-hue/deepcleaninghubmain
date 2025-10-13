#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://app.deepcleaninghub.com';

console.log('🔍 Testing Frontend HTTPS Configuration\n');
console.log('═══════════════════════════════════════════════\n');

const tests = [
  { name: 'Health Check', endpoint: '/health' },
  { name: 'Services API', endpoint: '/api/services' },
  { name: 'Service Options', endpoint: '/api/service-options' },
];

async function testEndpoint(name, endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(`${BASE_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const status = res.statusCode;
        const success = status === 200 || status === 401;
        
        console.log(`${success ? '✅' : '❌'} ${name.padEnd(20)} HTTP ${status} (${duration}ms)`);
        resolve(success);
      });
    }).on('error', (err) => {
      console.log(`❌ ${name.padEnd(20)} Error: ${err.message}`);
      resolve(false);
    });
  });
}

(async () => {
  let allPassed = true;
  
  for (const test of tests) {
    const passed = await testEndpoint(test.name, test.endpoint);
    if (!passed) allPassed = false;
  }
  
  console.log('\n═══════════════════════════════════════════════\n');
  
  if (allPassed) {
    console.log('✅ SUCCESS: HTTPS is working perfectly!');
    console.log('\n📱 Your mobile app is ready to use:');
    console.log(`   ${BASE_URL}/api`);
    console.log('\n🚀 Next steps:');
    console.log('   1. Build new APK/IPA with HTTPS');
    console.log('   2. Test on real device');
    console.log('   3. Submit to App Store & Play Store\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
})();
