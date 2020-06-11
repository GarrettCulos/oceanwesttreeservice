const merge = require('webpack-merge');
const path = require('path');
const { expressGraphql, rootDir } = require('./webpack.base');
const devConfig = {
  watch: true,
  watchOptions: {
    aggregateTimeout: 200,
    ignored: ['node_modules'],
  },
  mode: 'development',
  resolve: {
    alias: {
      '@config': path.resolve(rootDir, 'config'),
      '@config/environment': path.resolve(rootDir, 'config', 'environment'),
    },
  },
};
module.exports = [merge(expressGraphql, { ...devConfig })];
