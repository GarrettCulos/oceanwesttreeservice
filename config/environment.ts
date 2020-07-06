import AWS from 'aws-sdk';
export const environment = {
  SESSION_SECRET: 'super secret',
  aws: {
    region: 'us-west-2',
    s3: {
      region: 'us-west-2',
      apiVersion: '2015-10-07',
    },
    cloudWatchEventsConfig: {
      region: 'us-west-2',
      apiVersion: '2015-10-07',
    },
    lambdaConfig: {
      region: 'us-west-2',
      apiVersion: '2015-03-31',
    },
    dynamoDb: {
      region: 'us-west-2',
      endpoint: `http://localhost:8000`,
      credentials: new AWS.Credentials('key', 'secret'),
    },
  },
};
