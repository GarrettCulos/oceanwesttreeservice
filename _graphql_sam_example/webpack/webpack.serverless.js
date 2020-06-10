const merge = require('webpack-merge');
const path = require('path');
const { rootDir, graphQl } = require('./webpack.base');
const buildConfig = {
  resolve: {
    alias: {
      '@config': path.resolve(rootDir, 'config'),
      '@config/environment': path.resolve(rootDir, 'config', 'environment.prod'),
    },
  },
};
module.exports = [merge(graphQl('production'), { ...buildConfig })];
