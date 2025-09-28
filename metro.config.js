const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração para ambiente offline
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configuração para resolver import.meta e ES modules
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  unstable_allowRequireContext: true,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Configuração para web e resolução de módulos
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver.alias,
    'react-native$': 'react-native-web',
  },
  sourceExts: [...config.resolver.sourceExts, 'mjs', 'cjs'],
};

// Desabilitar verificações online
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Bypass para requests que falham
      if (req.url && req.url.includes('api.expo.dev')) {
        res.statusCode = 200;
        res.end('{}');
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
