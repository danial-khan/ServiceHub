import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import * as Repack from '@callstack/repack';

const dirname = Repack.getDirname(import.meta.url);

/**
 * Barber Module webpack configuration
 * This is a remote module loaded on demand by the shell
 */
export default (env) => {
  const {
    mode = 'development',
    context = path.join(dirname, 'modules/barber'),
    entry = './src/index.tsx',
    platform = process.env.PLATFORM,
    minimize = mode === 'production',
    devServer = undefined,
  } = env;

  if (!platform) {
    throw new Error('Missing platform');
  }

  const reactNativePath = path.join(dirname, 'node_modules/react-native');

  return {
    mode,
    devtool: false,
    context,
    entry,
    resolve: {
      ...Repack.getResolveOptions(platform),
      alias: {
        '@': path.join(dirname, 'src'),
        '@core': path.join(dirname, 'src/core'),
      },
    },
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(dirname, 'build/modules/barber', platform),
      filename: 'index.bundle',
      chunkFilename: '[name].chunk.bundle',
      publicPath: 'http://localhost:9002/',
      uniqueName: 'BarberModule',
    },
    optimization: {
      minimize,
      minimizer: [
        new TerserPlugin({
          test: /\.(jsx?|tsx?)$/,
          extractComments: false,
        }),
      ],
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
        name: 'BarberModule',
        library: { type: 'var', name: 'BarberModule' },
        filename: 'index.bundle',
        exposes: {
          './Module': './src/index.tsx',
        },
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
          '@react-navigation/native': {
            singleton: true,
            eager: true,
          },
          '@react-navigation/native-stack': {
            singleton: true,
            eager: true,
          },
          zustand: {
            singleton: true,
            eager: true,
          },
        },
      }),
    ],
  };
};
