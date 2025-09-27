const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Add any additional asset extensions here
  'db',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
);

// Add support for additional source extensions
config.resolver.sourceExts.push(
  'tsx',
  'ts',
  'jsx',
  'js',
  'json',
);

module.exports = config;
