const path = require('path');
const tsRule = {
  test: /\.ts?$/,
  use: [
    {
      loader: 'babel-loader',
    },
  ],
  exclude: [/node_modules/],
};
const rootDir = path.resolve(__dirname, '..');
/**
 * external names
 */
const BeUtil = '@util';
const BeServices = '@services';
const BeEnv = '@config';
const BeTypes = '_types';

/**
 * specific aliases
 */
const aliases = {
  [BeUtil]: path.resolve(rootDir, 'util'),
  [BeServices]: path.resolve(rootDir, 'services'),
  [BeEnv]: path.resolve(rootDir, 'config'),
  [BeTypes]: path.resolve(rootDir, 'types'),
};
module.exports = {
  aliases,
  tsRule,
  rootDir,
};
