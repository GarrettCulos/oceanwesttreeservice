import AWS from 'aws-sdk';

export interface Environment {
  env: 'development' | 'production';
  SESSION_SECRET: string;
  dynamoDb: AWS.DynamoDB.ClientConfiguration;
  SES: {
    isEnabled: boolean;
    sourceEmail: string;
    config: AWS.SES.ClientConfiguration;
  };
  TABLE_NAMES: {
    Client: string;
  };
}
export const environment: Environment = {
  env: 'development',
  SESSION_SECRET: 'dev_secret',
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
    Client: 'CloudBackupClient_0_0_1',
  },
};
