import AWS from 'aws-sdk';
import { Environment } from './environment';
export const environment: Environment = {
  env: 'development',
  SESSION_SECRET: 'dev_secret',
  dynamoDb: {
    region: 'us-west-2',
    endpoint: `http://dynamodb:8000`,
    credentials: new AWS.Credentials('key', 'secret'),
  },
  SES: {
    isEnabled: false,
    sourceEmail: 'test@gmail.com',
    config: {
      apiVersion: '2010-12-01',
      region: 'us-west-2',
    },
  },
  TABLE_NAMES: {
    Client: 'Client_0_0_1',
  },
};
