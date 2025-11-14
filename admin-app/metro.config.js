const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the shared directory to watchFolders so Metro can resolve imports from outside admin-app
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
];

// Update resolver to include the shared directory
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'ts', 'tsx'];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../shared/node_modules'),
];

module.exports = config;
