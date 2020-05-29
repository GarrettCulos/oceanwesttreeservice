import { Environment } from './environment';
export const environment: Environment = {
  env: 'production',
  SESSION_SECRET: process.env.SESSION_SECRET,
  GOOGLE_CLIENT_ID: 'asdfas', // currently for zazzle project, need to change
  FACEBOOK_CLIENT_ID: 'sadfas', // currently for zazzle project, need to change
  dynamoDb: {
    region: process.env.AWS_DEFAULT_REGION,
    endpoint: `https://DYNAMODB.${process.env.AWS_DEFAULT_REGION}.amazonaws.com`,
  },
  SES: {
    isEnabled: false,
    sourceEmail: 'info@test.com',
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
