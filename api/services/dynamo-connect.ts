import AWS, { DynamoDB } from 'aws-sdk';
import { environment } from '@config/environment';

AWS.config.update(environment.aws.dynamoDb);
export const docClient = new AWS.DynamoDB.DocumentClient();

export const query = (params: DynamoDB.DocumentClient.QueryInput): Promise<DynamoDB.DocumentClient.QueryOutput> => {
  return new Promise((resolve: Function, reject: Function) => {
    docClient.query(params, (err: AWS.AWSError, data: DynamoDB.DocumentClient.QueryOutput) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

export const scan = (params: DynamoDB.DocumentClient.ScanInput): Promise<DynamoDB.DocumentClient.ScanOutput> => {
  return new Promise((resolve: Function, reject: Function) => {
    docClient.scan(params, (err: AWS.AWSError, data: DynamoDB.DocumentClient.ScanOutput) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

export const put = (params: DynamoDB.DocumentClient.PutItemInput): Promise<DynamoDB.DocumentClient.PutItemOutput> => {
  return new Promise((resolve: Function, reject: Function) => {
    docClient.put(params, (err: AWS.AWSError, data: DynamoDB.DocumentClient.PutItemOutput) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

export const get = (params: DynamoDB.DocumentClient.GetItemInput): Promise<DynamoDB.DocumentClient.GetItemOutput> => {
  return new Promise((resolve: Function, reject: Function) => {
    docClient.get(params, (err: AWS.AWSError, data: DynamoDB.DocumentClient.GetItemOutput) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

export const remove = (
  params: DynamoDB.DocumentClient.DeleteItemInput
): Promise<DynamoDB.DocumentClient.DeleteItemOutput> => {
  return new Promise((resolve: Function, reject: Function) => {
    docClient.delete(params, (err: AWS.AWSError, data: DynamoDB.DocumentClient.DeleteItemOutput) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

export const batch = (
  params: DynamoDB.DocumentClient.TransactWriteItemsInput
): Promise<DynamoDB.DocumentClient.TransactWriteItemsOutput> => {
  return new Promise((resolve: Function, reject: Function) => {
    docClient.transactWrite(params, (err: AWS.AWSError, data: DynamoDB.DocumentClient.TransactWriteItemsOutput) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

export const update = (
  params: DynamoDB.DocumentClient.UpdateItemInput
): Promise<DynamoDB.DocumentClient.UpdateItemOutput> => {
  return new Promise((resolve: Function, reject: Function) => {
    docClient.update(params, (err: AWS.AWSError, data: DynamoDB.DocumentClient.UpdateItemOutput) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};
