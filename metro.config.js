const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração para ambiente offline
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

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
