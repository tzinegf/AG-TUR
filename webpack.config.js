const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Alias a problematic ESM file that uses `require` so we provide a web-safe shim.
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    '@react-navigation/elements/lib/module/useFrameSize.js': path.resolve(__dirname, 'web-shims', 'useFrameSize.js'),
    // Ensure Babel runtime resolves correctly for helper imports emitted by Babel
    '@babel/runtime': path.resolve(__dirname, 'node_modules', '@babel', 'runtime'),
    // Ensure core React and RNW resolve from the project node_modules regardless of issuer path
    'react': path.resolve(__dirname, 'node_modules', 'react'),
    'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
    'react-native': 'react-native-web',
    'react-native-web': path.resolve(__dirname, 'node_modules', 'react-native-web'),
    // Explicitly map JSX runtime entrypoints to their resolved files
    'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
  };

  // Replace any resolved copy of elements/useFrameSize.js (including nested node_modules)
  // with our web-safe shim to avoid `require` in ESM on the web.
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /@react-navigation[\\/]elements[\\/]lib[\\/]module[\\/]useFrameSize\.js$/,
      path.resolve(__dirname, 'web-shims', 'useFrameSize.js')
    )
  );

  // Ensure TS/TSX in the project (e.g., app/* for expo-router) are transpiled,
  // even when imported via expo-router from node_modules context.
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];

  // Try to inject a babel-loader rule inside the first oneOf group so it takes effect
  const babelRule = {
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: require.resolve('babel-loader'),
      options: {
        presets: [require.resolve('babel-preset-expo')],
        plugins: [],
        babelrc: true,
        cacheDirectory: true,
      },
    },
  };
  // Inject babel-loader for TS/TSX inside Expo's oneOf rules if present, otherwise unshift at the top
  const oneOfContainer = Array.isArray(config.module.rules)
    ? config.module.rules.find((r) => Array.isArray(r.oneOf))
    : undefined;
  if (oneOfContainer && Array.isArray(oneOfContainer.oneOf)) {
    oneOfContainer.oneOf.unshift(babelRule);
  } else {
    config.module.rules.unshift(babelRule);
  }

  // Override Webpack Dev Server port for web to avoid conflicts
  config.devServer = config.devServer || {};
  config.devServer.port = 3000;
  config.devServer.host = 'localhost';
  // Ensure history API fallback works for expo-router routes
  config.devServer.historyApiFallback = {
    index: '/index.html',
    disableDotRule: true,
  };
  // Allow access from local network during development
  config.devServer.allowedHosts = 'all';

  // Ensure TSX resolves properly on web
  config.resolve = config.resolve || {};
  config.resolve.extensions = [
    '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
    '.tsx', '.ts', '.jsx', '.js', '.json'
  ];
  // Ensure modules resolution includes the project-level node_modules even when issuer paths are virtualized
  config.resolve.modules = [
    path.resolve(__dirname, 'node_modules'),
    'node_modules'
  ];

  return config;
};