import AWS from 'aws-sdk';
import { SeedClient, SeedBackup } from '../src/models/_seeds';
import { environment } from '../config/environment';

export const seedFunction = (docClient: AWS.DynamoDB.DocumentClient, tableName: string) => {
  let seedCount: any = { count: 4 };
  switch (tableName) {
    case environment.TABLE_NAMES.Client:
      seedCount = { count: 3, backupCount: 10 };
      break;
    default:
      return;
  }
  for (let i = 0; i <= seedCount.count; i++) {
    let params;
    switch (tableName) {
      case environment.TABLE_NAMES.Client: {
        const client = SeedClient();
        params = {
          Item: client.serialize(),
          ReturnConsumedCapacity: 'TOTAL',
          TableName: tableName,
        };
        console.log(client);
        for (let j = 0; j <= seedCount.backupCount; j++) {
          docClient.put(
            {
              Item: SeedBackup(client.id).serialize(),
              ReturnConsumedCapacity: 'TOTAL',
              TableName: tableName,
            },
            (err, data) => {
              if (err) {
                console.log(err, err.stack); // an error occurred
              } else {
                console.log(data); // successful response
              }
            }
          );
        }
        docClient.put(params, (err, data) => {
          if (err) {
            console.log(err, err.stack); // an error occurred
          } else {
            console.log(data); // successful response
          }
        });
        break;
      }
      default:
        return;
    }
  }
};
