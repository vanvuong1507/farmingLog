const path = require('path');
const fs = require('fs');

const INLINE_ENV_KEYS = [
  'APP_ENV',
  'API_BASE_URL',
  'ENABLE_DEBUG_LOGGING',
  'FEATURE_SYNC_ENABLED',
];

function loadAppEnvFile() {
  const appEnv = process.env.APP_ENV || 'development';
  const envPath = path.resolve(__dirname, `.env.${appEnv}`);
  if (fs.existsSync(envPath)) {
    require('dotenv').config({path: envPath, quiet: true});
  }
}

loadAppEnvFile();

module.exports = function (api) {
  const appEnv = process.env.APP_ENV || 'development';
  api.cache.using(() => `${appEnv}:${process.env.NODE_ENV || 'development'}`);

  const isProd = process.env.NODE_ENV === 'production';

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      // Zod v4 (và một số package ESM) dùng `export * as ns` — Metro cần plugin này.
      '@babel/plugin-transform-export-namespace-from',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@app': './src/app',
            '@config': './src/config',
            '@domain': './src/domain',
            '@data': './src/data',
            '@services': './src/services',
            '@features': './src/features',
            '@libs': './src/libs',
            '@ui': './src/ui',
            '@locales': './src/locales',
          },
        },
      ],
      ['babel-plugin-transform-inline-environment-variables', {include: INLINE_ENV_KEYS}],
      ...(isProd ? ['react-native-paper/babel'] : []),
      'react-native-reanimated/plugin',
    ],
  };
};
