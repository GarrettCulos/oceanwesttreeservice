import AWS from 'aws-sdk';
export const environment = {
  SESSION_SECRET: 'super secret',
  dynamoDb: {
    region: 'us-west-2',
    endpoint: `http://localhost:8000`,
    credentials: new AWS.Credentials('key', 'secret'),
  },
};
