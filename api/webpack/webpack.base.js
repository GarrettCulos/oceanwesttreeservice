const fs = require('fs');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { LambdaPackerPlugin } = require('./plugins/lambda-packer/dist/dev/index.js');
const Dotenv = require('dotenv-webpack');
const { rootDir: ogRoot, aliases, tsRule } = require('./webpack.root');

const rootDir = `${ogRoot}`;
const lambdaDir = fs.readdirSync(path.resolve(rootDir, 'src', 'lambdas'));
const entries = lambdaDir.reduce((acc, name) => {
  if (fs.lstatSync(path.resolve(rootDir, 'src', 'lambdas', name)).isDirectory()) {
    acc[name] = path.resolve(rootDir, 'src', 'lambdas', name, 'index.ts');
  }
  return acc;
}, {});

/**
 * base build
 */
const baseDeployment = 'dist';

const lambdas = (mode = 'development') => ({
  mode,
  entry: entries,
  externals: [nodeExternals()],
  target: 'node',
  module: {
    rules: [tsRule],
  },
  resolve: {
    extensions: ['.ts'],
    alias: aliases,
  },
  output: {
    library: 'lambdas',
    libraryTarget: 'umd',
    filename: `[name]/[name].js`,
    path: path.resolve(rootDir, `${baseDeployment}`, mode),
  },
  plugins: [new Dotenv({ path: path.join(__dirname, '..', '.env') }), new LambdaPackerPlugin({ verbose: false })],
});

module.exports = {
  rootDir,
  baseDeployment,
  tsRule,
  lambdas,
};
