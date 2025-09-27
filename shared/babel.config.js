module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/contexts': './src/contexts',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/navigation': './src/navigation',
            '@/config': './src/config',
          },
        },
      ],
    ],
  };
};
