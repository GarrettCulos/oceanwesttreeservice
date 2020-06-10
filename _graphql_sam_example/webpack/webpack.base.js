const glob = require('glob');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { SamWebpackPlugin } = require('sam-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const projectDirName = '_graphql_sam_example';
const { rootDir: ogRoot, aliases, tsRule } = require('../../webpack/webpack.root');
const rootDir = `${ogRoot}/${projectDirName}`;

/**
 * base build
 */
const baseDeployment = 'dist';

const graphQl = (mode = 'development') => ({
  mode,
  entry: {
    graphFunction: path.resolve(rootDir, 'src', 'graphql', 'graphFunction.ts'),
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
    express: path.resolve(rootDir, 'src', 'graphql', 'express.ts'),
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
