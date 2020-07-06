import AWS from 'aws-sdk';
import { Environment } from './environment';
export const environment: Environment = {
  env: 'development',
  SESSION_SECRET: 'dev_secret',
  SES: {
    isEnabled: false,
    sourceEmail: 'docker@gmail.com',
    config: {
      apiVersion: '2010-12-01',
      region: 'us-west-2',
    },
  },
  TABLE_NAMES: {
    Client: 'CloudBackupClient_0_0_1',
  },

  aws: {
    region: 'us-west-2',
    s3: {
      region: 'us-west-2',
      endpoint: `http://host.docker.internal:4566`,
      apiVersion: '2015-10-07',
      credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
      },
      s3ForcePathStyle: true,
    },
    dynamoDb: {
      region: 'us-west-2',
      endpoint: `http://dynamodb:8000`,
      credentials: new AWS.Credentials('key', 'secret'),
    },
    // dynamoDb: {
    //   region: 'us-west-2',
    //   endpoint: `http://host.docker.internal:4566`,
    //   credentials: {
    //     accessKeyId: 'dummy',
    //     secretAccessKey: 'dummy',
    //   },
    // },
    cloudWatchEventsConfig: {
      region: 'us-west-2',
      apiVersion: '2015-10-07',
      endpoint: 'http://host.docker.internal:4566',
      credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
      },
    },
    lambdaConfig: {
      region: 'us-west-2',
      apiVersion: '2015-03-31',
      endpoint: 'http://host.docker.internal:4566',
      credentials: {
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
      },
    },
  },
};
