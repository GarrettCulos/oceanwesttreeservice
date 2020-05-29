import AWS from 'aws-sdk';
import { Environment } from './environment';
export const environment: Environment = {
  env: 'development',
  SESSION_SECRET: 'dev_secret',
  FACEBOOK_CLIENT_ID: 'asdfas', // currently for zazzle project, need to change
  GOOGLE_CLIENT_ID: 'asdfas', // currently for zazzle project, need to change
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
    Store: 'Store_0_0_1',
    Users: 'Users_0_0_1',
  },
};
