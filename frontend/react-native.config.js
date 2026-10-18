module.exports = {
  root: '../..',
  reactNativePath: '../../node_modules/react-native',
  dependencies: {
    // Use hoisted dependencies from root
  },
  commands: [
    {
      name: 'webpack-bundle',
      description: 'Bundle with Re.Pack webpack',
      func: require('@callstack/repack/commands').bundle,
    },
    {
      name: 'webpack-start',
      description: 'Start Re.Pack dev server',
      func: require('@callstack/repack/commands').start,
    },
  ],
};
