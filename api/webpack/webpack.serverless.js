const merge = require('webpack-merge');
const path = require('path');
const { rootDir, lambdas } = require('./webpack.base');
const buildConfig = {
  resolve: {
    alias: {
      '@config': path.resolve(rootDir, 'config'),
      '@config/environment': path.resolve(rootDir, 'config', 'environment'),
    },
  },
};
module.exports = [merge(lambdas('production'), { ...buildConfig })];
