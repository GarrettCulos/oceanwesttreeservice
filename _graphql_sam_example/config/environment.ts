import AWS from 'aws-sdk';

export interface Environment {
  env: 'development' | 'production';
  SESSION_SECRET: string;
  FACEBOOK_CLIENT_ID: string;
  GOOGLE_CLIENT_ID: string;

  dynamoDb: AWS.DynamoDB.ClientConfiguration;
  SES: {
    isEnabled: boolean;
    sourceEmail: string;
    config: AWS.SES.ClientConfiguration;
  };
  TABLE_NAMES: {
    Store: string;
    Users: string;
  };
}
export const environment: Environment = {
  env: 'development',
  SESSION_SECRET: 'dev_secret',
  FACEBOOK_CLIENT_ID: 'asdfa', // currently for zazzle project, need to change
  GOOGLE_CLIENT_ID: 'asdfa', // currently for zazzle project, need to change
  dynamoDb: {
    region: 'us-west-2',
    endpoint: 'http://localhost:8001',
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
