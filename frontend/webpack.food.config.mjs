import path from 'path';
import * as Repack from '@callstack/repack';
import { sharedModuleRules, sharedResolve, sharedDeps } from './webpack.common.mjs';

const dirname = Repack.getDirname(import.meta.url);

export default (env) => {
  const {
    mode = 'development',
    context = dirname,
    entry = './modules/food/src/index.tsx',
    platform = process.env.PLATFORM || 'android',
    minimize = mode === 'production',
  } = env;

  return {
    mode,
    context,
    entry,
    resolve: sharedResolve,
    output: {
      uniqueName: 'FoodModule',
      path: path.join(dirname, 'build/modules/food', platform),
      filename: 'index.bundle',
      chunkFilename: 'food.[name].[chunkhash:8].chunk.bundle',
    },
    optimization: {
      minimize,
      chunkIds: 'named',
    },
    module: {
      rules: sharedModuleRules,
    },
    plugins: [
      new Repack.RepackPlugin({ platform }),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'FoodModule',
        dts: false,
        filename: 'food.container.bundle',
        exposes: {
          './Module': './modules/food/src/index.tsx',
        },
        shared: {
          react: { ...sharedDeps.react, eager: false },
          'react-native': { ...sharedDeps['react-native'], eager: false },
          '@servicehub/core': { ...sharedDeps['@servicehub/core'], eager: false },
        },
      }),
    ],
  };
};
