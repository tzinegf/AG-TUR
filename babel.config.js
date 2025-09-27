module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            '@components': './app/components',
            '@screens': './app/screens',
            '@utils': './app/utils',
            '@store': './app/store',
            '@types': './app/types'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
