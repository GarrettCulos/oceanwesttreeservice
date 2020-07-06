import { Environment } from './environment';
export const environment: Environment = {
  env: 'production',
  SESSION_SECRET: process.env.SESSION_SECRET,
  SES: {
    isEnabled: false,
    sourceEmail: 'info@test.com',
    config: {
      apiVersion: '2010-12-01',
      region: process.env.AWS_DEFAULT_REGION,
    },
  },
  TABLE_NAMES: {
    Client: 'CloudBackupClient_0_0_1',
  },
  aws: {
    region: process.env.AWS_DEFAULT_REGION,
    s3: {
      region: process.env.AWS_DEFAULT_REGION,
      apiVersion: '2015-10-07',
    },
    dynamoDb: {
      region: process.env.AWS_DEFAULT_REGION,
      endpoint: `https://DYNAMODB.${process.env.AWS_DEFAULT_REGION}.amazonaws.com`,
    },
    cloudWatchEventsConfig: {
      region: process.env.AWS_DEFAULT_REGION,
      apiVersion: '2015-10-07',
    },
    lambdaConfig: {
      region: process.env.AWS_DEFAULT_REGION,
      apiVersion: '2015-03-31',
    },
  },
};
