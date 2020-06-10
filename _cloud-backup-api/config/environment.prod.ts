import { Environment } from './environment';
export const environment: Environment = {
  env: 'production',
  SESSION_SECRET: process.env.SESSION_SECRET,
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
    Client: 'Client_0_0_1',
  },
};
