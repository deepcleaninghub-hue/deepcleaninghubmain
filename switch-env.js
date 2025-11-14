#!/usr/bin/env node

/**
 * Environment Switcher Script
 * 
 * This script helps you switch between development and production environments
 * by setting the appropriate environment variables.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const environment = args[0];

if (!environment || !['development', 'production'].includes(environment)) {
  console.log('Usage: node switch-env.js [development|production]');
  console.log('');
  console.log('Examples:');
  console.log('  node switch-env.js development  # Switch to development (192.168.29.112)');
  console.log('  node switch-env.js production   # Switch to production (54.252.116.156)');
  process.exit(1);
}

const configs = {
  development: {
    NODE_ENV: 'development',
    EXPO_PUBLIC_ENVIRONMENT: 'development',
    EXPO_PUBLIC_API_BASE_URL: 'http://192.168.29.112:5001/api',
    API_BASE_URL: 'http://192.168.29.112:5001/api'
  },
  production: {
    NODE_ENV: 'production',
    EXPO_PUBLIC_ENVIRONMENT: 'production',
    EXPO_PUBLIC_API_BASE_URL: 'http://54.252.116.156:5001/api',
    API_BASE_URL: 'http://54.252.116.156:5001/api'
  }
};

const config = configs[environment];

// Create .env files for different parts of the project
const envFiles = [
  { path: '.env', config },
  { path: 'backend/.env', config },
  { path: 'admin-app/.env', config },
  { path: 'shared/.env', config }
];

envFiles.forEach(({ path: filePath, config }) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write .env file
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';
  
  fs.writeFileSync(fullPath, envContent);
  console.log(`✅ Created ${filePath}`);
});

console.log('');
console.log(`🎉 Successfully switched to ${environment} environment!`);
console.log('');
console.log('Environment Details:');
console.log(`  API Base URL: ${config.API_BASE_URL}`);
console.log(`  Environment: ${config.NODE_ENV}`);
console.log('');
console.log('Next steps:');
console.log('  1. Restart your backend server');
console.log('  2. Restart your frontend apps');
console.log('  3. Verify the correct API URL is being used');
