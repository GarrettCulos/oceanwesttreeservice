import AWS from 'aws-sdk';

export interface Environment {
  env: 'development' | 'production';
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  FACEBOOK_CLIENT_ID: string;
  aws: {
    region: string;
    dynamoDb?: AWS.DynamoDB.ClientConfiguration;
    lambdaConfig: AWS.Lambda.ClientConfiguration;
    s3: AWS.S3.ClientConfiguration;
    cloudWatchEventsConfig: AWS.CloudWatchEvents.ClientConfiguration;
  };
}
export const environment: Environment = {
  env: 'development',
  SESSION_SECRET: 'supersecret',
  GOOGLE_CLIENT_ID: 'googleClientId',
  FACEBOOK_CLIENT_ID: 'facebookClientId',
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
