const glob = require('glob');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
// const { SamWebpackPlugin } = require('../../../../../sam-webpack-plugin/dist/dev/index.js');
const { SamWebpackPlugin } = require('sam-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const projectDirName = '_cloud-backup-api';
const { rootDir: ogRoot, aliases, tsRule } = require('../../webpack/webpack.root');
const rootDir = `${ogRoot}/${projectDirName}`;

/**
 * base build
 */
const baseDeployment = 'dist';

const graphQl = (mode = 'development') => ({
  mode,
  entry: {
    graphFunction: path.resolve(rootDir, 'src', 'lambdas', 'graphql', 'graphFunction.ts'),
    installFunction: path.resolve(rootDir, 'src', 'lambdas', 'install-lambda', 'installFunction.ts'),
    lambdaPollingFunction: path.resolve(rootDir, 'src', 'lambdas', 'lambda-polling', 'polling-function.ts'),
    uninstallFunction: path.resolve(rootDir, 'src', 'lambdas', 'uninstall-lambda', 'uninstallFunction.ts'),
  },
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
    library: 'graphql api',
    libraryTarget: 'umd',
    filename: (chunkData) => `${chunkData.chunk.name.replace('.ts', '')}.js`,
    path: path.resolve(rootDir, `${baseDeployment}`, 'serverless', mode),
  },
  plugins: [
    new Dotenv({ path: `${projectDirName}/.env` }),
    new SamWebpackPlugin({
      dynamoDb: path.resolve(rootDir, 'dynamodb-table.json'),
      output: `${projectDirName}/graphql-sam-deploy`,
      baseTemplate: path.resolve(rootDir, 'template.json'),
    }),
  ],
});

const expressGraphql = {
  mode: 'development',
  entry: {
    express: path.resolve(rootDir, 'src', 'lambdas', 'graphql', 'express.ts'),
  },
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
    library: 'express graphql api',
    libraryTarget: 'umd',
    filename: (chunkData) => `${chunkData.chunk.name.replace('.ts', '')}.js`,
    path: path.resolve(rootDir, `${baseDeployment}`, 'express'),
  },
  plugins: [new Dotenv({ path: `${projectDirName}/.env` })],
};

module.exports = {
  rootDir,
  baseDeployment,
  tsRule,
  graphQl,
  expressGraphql,
};
