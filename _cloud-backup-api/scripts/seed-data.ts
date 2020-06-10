import uuid from 'uuid';
import { SeedClient } from '../src/models/_seeds';
import { environment } from '../src/config/environment';

export const seedFunction = (docClient: AWS.DynamoDB.DocumentClient, tableName: string) => {
  let seedCount: any = { count: 4 };
  switch (tableName) {
    case environment.TABLE_NAMES.Client:
      seedCount = { count: 1, orderCount: 1, itemCount: 1 };
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
        for (let j = 0; j <= seedCount.itemCount; j++) {
          docClient.put(
            {
              Item: SeedClientItem(client.id).serialize(),
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
