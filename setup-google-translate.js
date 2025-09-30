#!/usr/bin/env node

/**
 * Google Translate API Setup Script
 * 
 * This script helps you configure Google Translate API for your DeepClean Mobile Hub app
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Google Translate API Setup for DeepClean Mobile Hub\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupGoogleTranslate() {
  try {
    console.log('📋 Please provide the following information:\n');
    
    // Get project ID
    const projectId = await askQuestion('1. Enter your Google Cloud Project ID: ');
    if (!projectId) {
      console.log('❌ Project ID is required. Exiting...');
      process.exit(1);
    }
    
    // Get service account key file path
    const keyFilePath = await askQuestion('2. Enter the path to your service account key JSON file: ');
    if (!keyFilePath) {
      console.log('❌ Service account key file path is required. Exiting...');
      process.exit(1);
    }
    
    // Check if key file exists
    if (!fs.existsSync(keyFilePath)) {
      console.log('❌ Service account key file not found. Please check the path.');
      process.exit(1);
    }
    
    // Copy key file to credentials directory
    const credentialsDir = path.join(__dirname, 'shared', 'credentials');
    const keyFileName = 'service-account-key.json';
    const destinationPath = path.join(credentialsDir, keyFileName);
    
    if (!fs.existsSync(credentialsDir)) {
      fs.mkdirSync(credentialsDir, { recursive: true });
    }
    
    fs.copyFileSync(keyFilePath, destinationPath);
    console.log(`✅ Service account key copied to: ${destinationPath}`);
    
    // Create .env file
    const envContent = `# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=${projectId}
GOOGLE_APPLICATION_CREDENTIALS=./credentials/${keyFileName}

# Translation Settings
GOOGLE_TRANSLATE_CACHE_ENABLED=true
GOOGLE_TRANSLATE_CACHE_EXPIRY_DAYS=7
`;
    
    const envPath = path.join(__dirname, 'shared', '.env');
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Environment file created: ${envPath}`);
    
    // Update googleTranslateService.ts
    const servicePath = path.join(__dirname, 'shared', 'src', 'services', 'googleTranslateService.ts');
    let serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    // Replace the project ID placeholder
    serviceContent = serviceContent.replace(
      "projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id',",
      `projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '${projectId}',`
    );
    
    // Uncomment the keyFilename line
    serviceContent = serviceContent.replace(
      '  // keyFilename: \'./credentials/service-account-key.json\',',
      "  keyFilename: './credentials/service-account-key.json',"
    );
    
    fs.writeFileSync(servicePath, serviceContent);
    console.log(`✅ Google Translate service updated: ${servicePath}`);
    
    // Create .gitignore entry for credentials
    const gitignorePath = path.join(__dirname, 'shared', '.gitignore');
    const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
    
    if (!gitignoreContent.includes('credentials/')) {
      const updatedGitignore = gitignoreContent + '\n# Google Cloud Credentials\ncredentials/\n.env\n';
      fs.writeFileSync(gitignorePath, updatedGitignore);
      console.log(`✅ .gitignore updated: ${gitignorePath}`);
    }
    
    console.log('\n🎉 Setup completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('1. Test the translation by running your app');
    console.log('2. Change the language in your app to see automatic translation');
    console.log('3. Check the console for any authentication errors');
    console.log('\n⚠️  Important: Never commit your service account key to version control!');
    console.log('   The credentials/ directory is already added to .gitignore');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
setupGoogleTranslate();
