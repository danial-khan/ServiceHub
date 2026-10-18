import path from 'path';
import * as Repack from '@callstack/repack';

const dirname = Repack.getDirname(import.meta.url);

export const sharedAlias = {
  '@servicehub/core': path.join(dirname, 'packages/core/src'),
  '@module-federation/runtime/helpers': path.join(
    dirname,
    '..',
    'node_modules/@module-federation/runtime/dist/helpers.js',
  ),
  '@module-federation/error-codes/browser': path.join(
    dirname,
    '..',
    'node_modules/@module-federation/error-codes/dist/browser.cjs',
  ),
  '@react-native/asset-utils': path.join(
    dirname,
    '..',
    'node_modules/@react-native/asset-utils/src/index.js',
  ),
};

export const sharedResolve = {
  ...Repack.getResolveOptions({ enablePackageExports: true }),
  alias: sharedAlias,
  modules: [
    'node_modules',
    path.join(dirname, 'node_modules'),
    path.join(dirname, '..', 'node_modules'),
  ],
};

export const sharedModuleRules = [
  {
    test: /\.[cm]?[jt]sx?$/,
    type: 'javascript/auto',
    use: {
      loader: 'babel-loader',
      options: {},
    },
  },
  ...Repack.getAssetTransformRules(),
];

export const sharedDeps = {
  react: {
    singleton: true,
    requiredVersion: '19.2.3',
  },
  'react-native': {
    singleton: true,
    requiredVersion: '0.87.1',
  },
  '@servicehub/core': {
    singleton: true,
    requiredVersion: '1.0.0',
  },
};
