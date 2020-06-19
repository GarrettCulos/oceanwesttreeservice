const merge = require('webpack-merge');
const path = require('path');
const { expressGraphql, rootDir } = require('./webpack.base');
const devConfig = {
  mode: 'development',
  resolve: {
    alias: {
      '@config/environment': path.resolve(rootDir, 'config', 'environment.docker'),
      '@config': path.resolve(rootDir, 'config'),
    },
  },
};
module.exports = [merge({ ...devConfig }, expressGraphql)];
