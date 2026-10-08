import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import * as Repack from '@callstack/repack';

const dirname = Repack.getDirname(import.meta.url);

export default (env) => {
  const {
    mode = 'development',
    context = path.join(dirname, 'modules/doctor'),
    entry = './src/index.tsx',
    platform = process.env.PLATFORM,
    minimize = mode === 'production',
    devServer = undefined,
  } = env;

  if (!platform) {
    throw new Error('Missing platform');
  }

  return {
    mode,
    devtool: false,
    context,
    entry,
    resolve: {
      ...Repack.getResolveOptions(platform),
      alias: {
        '@servicehub/core': path.join(dirname, 'packages/core/src'),
      },
    },
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(dirname, 'build/modules/doctor', platform),
      filename: 'doctor.js',
      chunkFilename: 'doctor.[name].[chunkhash:8].chunk.bundle',
      publicPath: 'http://localhost:9001/',
      uniqueName: 'DoctorModule',
    },
    optimization: {
      minimize,
      minimizer: [
        new TerserPlugin({
          test: /\.(jsx?|tsx?)$/,
          extractComments: false,
        }),
      ],
      runtimeChunk: false,
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
        name: 'DoctorModule',
        library: { type: 'var', name: 'DoctorModule' },
        filename: 'remoteEntry.bundle',
        exposes: {
          './Module': './src/index.tsx',
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
          '@react-navigation/native': {
            singleton: true,
            eager: false,
          },
          '@react-navigation/native-stack': {
            singleton: true,
            eager: false,
          },
          zustand: {
            singleton: true,
            eager: false,
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
