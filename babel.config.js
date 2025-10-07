module.exports = function (api) {
  const isWeb = api.caller((caller) => caller?.platform === 'web');
  api.cache(() => (isWeb ? 'web' : 'native'));
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@utils': './src/utils',
            '@services': './src/services',
            '@contexts': './src/contexts',
            '@types': './src/types',
            '@assets': './assets',
          },
        },
      ],
      // Avoid transforming modules to CommonJS on web, which breaks Expo Web bundling ("exports is not defined")
      ...(isWeb
        ? []
        : [[
            '@babel/plugin-transform-modules-commonjs',
            {
              allowTopLevelThis: true,
            },
          ]]),
      '@babel/plugin-syntax-import-meta',
      'react-native-reanimated/plugin',
    ],
  };
};
