module.exports = function (api) {
  api.cache(true);
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
      [
        '@babel/plugin-transform-modules-commonjs',
        {
          allowTopLevelThis: true,
        },
      ],
      '@babel/plugin-syntax-import-meta',
      'react-native-reanimated/plugin',
    ],
  };
};
