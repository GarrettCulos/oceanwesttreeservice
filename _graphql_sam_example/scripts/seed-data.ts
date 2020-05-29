import uuid from 'uuid';
import { SeedUser, SeedStoreItem, SeedStore, SeedOrder, SeedOrderItem } from '../src/models/_seeds';
import { environment } from '../src/config/environment';

export const seedFunction = (docClient: AWS.DynamoDB.DocumentClient, tableName: string) => {
  let seedCount: any = { count: 4 };
  switch (tableName) {
    case environment.TABLE_NAMES.Store:
      seedCount = { count: 2, itemCount: 1 };
      break;
    case environment.TABLE_NAMES.Users:
      seedCount = { count: 1, orderCount: 1, itemCount: 1 };
      break;
    default:
      return;
  }
  for (let i = 0; i <= seedCount.count; i++) {
    let params;
    switch (tableName) {
      case environment.TABLE_NAMES.Store: {
        const store = SeedStore();
        params = {
          Item: store.serialize(),
          ReturnConsumedCapacity: 'TOTAL',
          TableName: tableName,
        };
        for (let j = 0; j <= seedCount.itemCount; j++) {
          docClient.put(
            {
              Item: SeedStoreItem(store.id).serialize(),
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
      case environment.TABLE_NAMES.Users: {
        const user = SeedUser().serialize();
        params = {
          Item: user,
          ReturnConsumedCapacity: 'TOTAL',
          TableName: tableName,
        };

        docClient.put(params, (err, data) => {
          if (err) {
            console.log(err, err.stack); // an error occurred
          } else {
            console.log(data); // successful response
          }
        });

        for (let j = 0; j <= seedCount.orderCount; j++) {
          const order = SeedOrder(user.id).serialize();
          docClient.put(
            {
              Item: order,
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

          for (let k = 0; k <= seedCount.orderCount; k++) {
            const orderItem = SeedOrderItem(user.id, uuid()).serialize();
            docClient.put(
              {
                Item: orderItem,
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
        }
        break;
      }
      default:
        return;
    }
  }
};
