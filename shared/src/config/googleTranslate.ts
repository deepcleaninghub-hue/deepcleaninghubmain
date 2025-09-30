/**
 * Google Translate API Configuration
 * 
 * Set up your Google Cloud credentials here
 */

export const GOOGLE_TRANSLATE_CONFIG = {
  // Option 1: Set environment variable GOOGLE_APPLICATION_CREDENTIALS
  // pointing to your service account key file
  
  // Option 2: Set your project ID
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id',
  
  // Option 3: For development, you can use a service account key directly
  // keyFilename: './path/to/your/service-account-key.json',
  
  // Supported languages for your app
  supportedLanguages: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' },
  ],
  
  // Default source language (your app's base language)
  defaultSourceLanguage: 'en',
  
  // Cache settings
  cacheEnabled: true,
  cacheExpiryDays: 7,
  
  // Rate limiting (requests per minute)
  rateLimit: 100,
  
  // Batch size for bulk translations
  batchSize: 10,
};

export default GOOGLE_TRANSLATE_CONFIG;
