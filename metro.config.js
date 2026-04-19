const path = require('path');
const fs = require('fs');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const projectRoot = __dirname;

/**
 * Metro resolve dependency graph trước Babel; alias `@app`, `@config`, … cần map ở đây
 * (đồng bộ với babel.config.js → module-resolver).
 */
function resolvePathAlias(moduleName) {
  const table = [
    ['@app/', 'src/app'],
    ['@config/', 'src/config'],
    ['@domain/', 'src/domain'],
    ['@data/', 'src/data'],
    ['@services/', 'src/services'],
    ['@features/', 'src/features'],
    ['@libs/', 'src/libs'],
    ['@ui/', 'src/ui'],
    ['@locales/', 'src/locales'],
  ];
  for (const [prefix, dir] of table) {
    if (!moduleName.startsWith(prefix)) {
      continue;
    }
    const rest = moduleName.slice(prefix.length);
    const basePath = path.join(projectRoot, dir, rest);
    const candidates = [
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      `${basePath}.jsx`,
      path.join(basePath, 'index.ts'),
      path.join(basePath, 'index.tsx'),
    ];
    for (const fp of candidates) {
      if (fs.existsSync(fp)) {
        return fp;
      }
    }
  }
  return null;
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * `nonInlinedRequires`: giữ thứ tự nạp module cho Reanimated / Worklets (tránh lỗi
 * "[Worklets] Failed to create a worklet" khi `inlineRequires` tối ưu sai thứ tự).
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
        nonInlinedRequires: [
          'React',
          'react',
          'react/jsx-dev-runtime',
          'react/jsx-runtime',
          'react-compiler-runtime',
          'react-native',
          'react-native-reanimated',
          'react-native-worklets',
        ],
      },
    }),
  },
  resolver: {
    resolveRequest(context, moduleName, platform) {
      const filePath = resolvePathAlias(moduleName);
      if (filePath != null) {
        return {type: 'sourceFile', filePath};
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
