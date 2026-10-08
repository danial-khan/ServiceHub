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
      },
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
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        Repack.REACT_NATIVE_LOADING_RULES,
        Repack.REACT_NATIVE_CODEGEN_RULES,
        {
          test: Repack.getAssetExtensionsRegExp(
            Repack.ASSET_EXTENSIONS.filter((ext) => ext !== 'svg')
          ),
          use: {
            loader: '@callstack/repack/assets-loader',
            options: {
              platform,
              devServerEnabled: Boolean(devServer),
              scalableAssetExtensions: Repack.SCALABLE_ASSETS,
            },
          },
        },
      ],
    },
    plugins: [
      new Repack.RepackPlugin({
        context,
        mode,
        platform,
        devServer,
      }),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'ServiceHubShell',
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
