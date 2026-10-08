import path from 'path';
import * as Repack from '@callstack/repack';

const dirname = Repack.getDirname(import.meta.url);

export default (env) => {
  const {
    mode = 'development',
    context = dirname,
    entry = './index.js',
    platform = process.env.PLATFORM || 'android',
    minimize = mode === 'production',
    devServer = undefined,
    reactNativePath = new URL('./node_modules/react-native', import.meta.url).pathname,
  } = env;

  return {
    mode,
    devtool: false,
    context,
    entry: entry,
    resolve: {
      ...Repack.getResolveOptions(platform),
      alias: {
        '@servicehub/core': path.join(dirname, 'packages/core/src'),
        '@react-native/asset-utils': path.join(dirname, 'node_modules/@react-native/asset-utils/src/index.js'),
      },
      modules: [
        'node_modules',
        path.join(dirname, 'node_modules'),
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
      fullySpecified: false,
    },
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(dirname, 'build/shell', platform),
      filename: 'shell.bundle',
      chunkFilename: '[name].[chunkhash:8].chunk.bundle',
      publicPath: Repack.getPublicPath({ platform, devServer }),
      uniqueName: 'ServiceHubShell',
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
            /node_modules\/(?!(@react-native|react-native|@react-native-async-storage|@react-navigation))/,
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
            /node_modules\/@callstack\/repack\/client/,
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
      new Repack.plugins.ModuleFederationPlugin({
        name: 'ServiceHubShell',
        remotes: {}, // Remotes registered dynamically at runtime from catalog
        shared: {
          react: {
            singleton: true,
            eager: true,
            requiredVersion: '19.2.3',
          },
          'react-native': {
            singleton: true,
            eager: true,
            requiredVersion: '0.87.1',
          },
          '@servicehub/core': {
            singleton: true,
            eager: true,
          },
        },
      }),
    ],
  };
};
