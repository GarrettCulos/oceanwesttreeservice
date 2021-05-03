const merge = require('webpack-merge');
const path = require('path');
const { lambdas, rootDir } = require('./webpack.base');
const devConfig = {
  resolve: {
    alias: {
      '@config': path.resolve(rootDir, 'config'),
      '@config/environment': path.resolve(rootDir, 'config', 'environment'),
    },
  },
};
module.exports = [merge(lambdas('development'), { ...devConfig })];
