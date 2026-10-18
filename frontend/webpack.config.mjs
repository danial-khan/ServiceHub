import * as Repack from '@callstack/repack';
import { sharedModuleRules, sharedResolve, sharedDeps } from './webpack.common.mjs';

/**
 * Host / shell bundler config.
 *
 * Output path and filename are left to Re.Pack defaults + CLI flags so Gradle's
 * `webpack-bundle` command can write `index.android.bundle` and Hermes can
 * compile it. Do not set `target` / `output.chunkLoading` here — RepackPlugin
 * applies RepackTargetPlugin, which sets the React Native runtime
 * (`target: false`, `chunkLoading: 'jsonp'`, `chunkFormat: 'array-push'`).
 */
export default (env) => {
  const {
    mode = 'development',
    context = Repack.getDirname(import.meta.url),
    entry = './index.js',
    platform = process.env.PLATFORM || 'android',
    minimize = mode === 'production',
  } = env;

  return {
    mode,
    context,
    entry,
    resolve: sharedResolve,
    output: {
      uniqueName: 'ServiceHubShell',
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
        name: 'ServiceHubShell',
        dts: false,
        remotes: {},
        shared: {
          react: { ...sharedDeps.react, eager: true },
          'react-native': { ...sharedDeps['react-native'], eager: true },
          '@servicehub/core': { ...sharedDeps['@servicehub/core'], eager: true },
        },
      }),
    ],
  };
};
