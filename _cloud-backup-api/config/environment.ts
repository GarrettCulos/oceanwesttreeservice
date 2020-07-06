import AWS from 'aws-sdk';

export interface Environment {
  env: 'development' | 'production';
  SESSION_SECRET: string;
  SES: {
    isEnabled: boolean;
    sourceEmail: string;
    config: AWS.SES.ClientConfiguration;
  };
  TABLE_NAMES: {
    Client: string;
  };
  aws: {
    region: string;
    dynamoDb: AWS.DynamoDB.ClientConfiguration;
    lambdaConfig: AWS.Lambda.ClientConfiguration;
    s3: AWS.S3.ClientConfiguration;
    cloudWatchEventsConfig: AWS.CloudWatchEvents.ClientConfiguration;
  };
}
export const environment: Environment = {
  env: 'development',
  SESSION_SECRET: 'dev_dev_secret',
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
  aws: {
    region: 'us-west-2',
    s3: {
      region: 'us-west-2',
      endpoint: `http://localstack:4566`,
      apiVersion: '2015-10-07',
    },
    dynamoDb: {
      region: 'us-west-2',
      endpoint: `http://dynamodb:8000`,
      credentials: new AWS.Credentials('key', 'secret'),
    },
    cloudWatchEventsConfig: {
      region: 'us-west-2',
      apiVersion: '2015-10-07',
      endpoint: 'http://localhost:4566',
    },
    lambdaConfig: {
      region: 'us-west-2',
      apiVersion: '2015-03-31',
      endpoint: 'http://localhost:4566',
    },
  },
};
