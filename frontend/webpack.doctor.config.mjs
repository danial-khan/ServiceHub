import path from 'path';
import * as Repack from '@callstack/repack';
import { sharedModuleRules, sharedResolve, sharedDeps } from './webpack.common.mjs';

const dirname = Repack.getDirname(import.meta.url);

export default (env) => {
  const {
    mode = 'development',
    context = dirname,
    entry = './modules/doctor/src/index.tsx',
    platform = process.env.PLATFORM || 'android',
    minimize = mode === 'production',
  } = env;

  return {
    mode,
    context,
    entry,
    resolve: sharedResolve,
    output: {
      uniqueName: 'DoctorModule',
      path: path.join(dirname, 'build/modules/doctor', platform),
      filename: 'index.bundle',
      chunkFilename: 'doctor.[name].[chunkhash:8].chunk.bundle',
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
        name: 'DoctorModule',
        dts: false,
        filename: 'doctor.container.bundle',
        exposes: {
          './Module': './modules/doctor/src/index.tsx',
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
