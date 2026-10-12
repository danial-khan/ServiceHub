import path from 'path';
import * as Repack from '@callstack/repack';

const dirname = Repack.getDirname(import.meta.url);

export default (env) => {
  const {
    mode = 'development',
    context = dirname,
    entry = './modules/doctor/src/index.tsx',
    platform = process.env.PLATFORM || 'android',
    minimize = mode === 'production',
    devServer = undefined,
  } = env;

  return {
    mode,
    devtool: false,
    context,
    entry,
    resolve: {
      ...Repack.getResolveOptions(platform),
      alias: {
        '@servicehub/core': path.join(dirname, 'packages/core/src'),
        '@module-federation/runtime/helpers': path.join(dirname, '..', 'node_modules/@module-federation/runtime/dist/helpers.js'),
        '@module-federation/error-codes/browser': path.join(dirname, '..', 'node_modules/@module-federation/error-codes/dist/browser.cjs'),
        '@react-native/asset-utils': path.join(dirname, '..', 'node_modules/@react-native/asset-utils/src/index.js'),
      },
      modules: [
        'node_modules',
        path.join(dirname, 'node_modules'),
        path.join(dirname, '..', 'node_modules'),
      ],
      extensions: [
        `.${platform}.tsx`,
        `.${platform}.ts`,
        `.${platform}.jsx`,
        `.${platform}.js`,
        '.native.tsx',
        '.native.ts',
        '.native.jsx',
        '.native.js',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.json',
      ],
    },
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(dirname, 'build/modules/doctor', platform),
      filename: 'index.bundle',
      chunkFilename: 'doctor.[name].[chunkhash:8].chunk.bundle',
      publicPath: 'http://localhost:9001/',
      uniqueName: 'DoctorModule',
    },
    optimization: {
      minimize,
      chunkIds: 'named',
    },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          exclude: [
            /node_modules\/(?!(@react-native|react-native|@react-native-async-storage))/,
          ],
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.js$/,
          include: [
            /node_modules\/@callstack\/repack\/mf/,
            /node_modules\/@callstack\/repack\/dist\/modules/,
          ],
          type: 'javascript/esm',
        },
        Repack.REACT_NATIVE_LOADING_RULES,
      ],
    },
    plugins: [
      new Repack.RepackPlugin({
        context,
        mode,
        platform,
        devServer,
      }),
      new Repack.plugins.CodeSigningPlugin({
        enabled: mode === 'production',
        privateKeyPath: path.join(dirname, '.keys/private.pem'),
      }),
      new Repack.plugins.ModuleFederationPlugin({
        name: 'DoctorModule',
        filename: 'doctor.container.bundle',
        exposes: {
          './Module': './modules/doctor/src/index.tsx',
        },
        shared: {
          react: {
            singleton: true,
            eager: false,
            requiredVersion: '19.2.3',
          },
          'react-native': {
            singleton: true,
            eager: false,
            requiredVersion: '0.87.1',
          },
          '@servicehub/core': {
            singleton: true,
            eager: false,
          },
        },
      }),
    ],
  };
};
