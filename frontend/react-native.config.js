module.exports = {
  commands: require('@callstack/repack/commands/webpack'), // webpack-bound: this repo uses webpack.config.mjs, not rspack
  root: '../..',
  reactNativePath: '../../node_modules/react-native',
  dependencies: {
    // Use hoisted dependencies from root
  },
};
