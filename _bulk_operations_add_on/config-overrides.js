const path = require('path');
const { addWebpackAlias } = require('customize-cra');

module.exports = function override(config, env) {
  config = addWebpackAlias({
    ['@h3']: path.resolve(__dirname, '..')
  })(config);

  return config;
};
