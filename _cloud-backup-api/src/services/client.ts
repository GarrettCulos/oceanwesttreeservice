import uuid from 'uuid';
import { remove, query, put } from '@services/dynamo-connect';
import { environment } from '@config/environment';
import * as metro from '@util/metrica';
import { CLIENT_PRIMARY_KEY } from '../constants';
import { Client, AddClientInterface } from '../models/client';

export const getClientById = async (clientId: string): Promise<Client> => {
  const mid = metro.metricStart('getClientById');
  try {
    const params: any = {
      TableName: environment.TABLE_NAMES.Client,
      Limit: 1,
      ReturnConsumedCapacity: 'TOTAL',
    };
    const { Items, ...rest } = await query({
      ...params,
      KeyConditionExpression: 'pk = :id AND sk = :sk',
      ExpressionAttributeValues: { ':id': CLIENT_PRIMARY_KEY, ':sk': clientId },
    });
    metro.metricStop(mid);
    return new Client(Items[0] as any);
  } catch (err) {
    metro.metricStop(mid);
    throw err;
  }
};

export const addClient = async (d: AddClientInterface): Promise<Client> => {
  const mid = metro.metricStart('addClient');
  try {
    const clientId = uuid();
    const now = new Date();
    const client = new Client({
      ...d,
      enabled: true,
      id: clientId,
      createdAt: now,
      updatedAt: now,
    });
    await put({
      TableName: environment.TABLE_NAMES.Client,
      ReturnConsumedCapacity: 'TOTAL',
      Item: client.serialize() as any,
    });
    const clientD = await getClientById(clientId);
    metro.metricStop(mid);
    return clientD;
  } catch (err) {
    metro.metricStop(mid);
    throw err.message;
  }
};

export const disableClient = async (clientId: string): Promise<boolean> => {
  const mid = metro.metricStart('addClient');
  try {
    const client = await getClientById(clientId);
    const newClient = new Client({
      ...client,
      enabled: false,
      updatedAt: new Date(),
    });
    await put({
      TableName: environment.TABLE_NAMES.Client,
      ReturnConsumedCapacity: 'TOTAL',
      Item: newClient.serialize() as any,
    });
    metro.metricStop(mid);
    return true;
  } catch (err) {
    metro.metricStop(mid);
    throw err.message;
  }
};
// export const deleteClientData = async (d: { clientId: string }) => {
//   try {
//     const getPermissionsP = getClientPermissions(d.clientId);
//     const [{ Items: permissions }, ...newOrders] = await Promise.all([
//       getPermissionsP as any,
//       ...orders.map((order) => getOrder(d.clientId, order.id)),
//     ]);
//     const permissionRemoves = (permissions || []).map((perm: any) => ({
//       TableName: environment.TABLE_NAMES.Client,
//       ReturnConsumedCapacity: 'TOTAL',
//       ReturnValues: 'ALL_OLD',
//       Key: { pk: permissionsPrefix(d.clientId), sk: perm.sk },
//     }));
//     const removeRequests = newOrders.reduce(
//       (req, order) => {
//         req.push({
//           TableName: environment.TABLE_NAMES.Client,
//           ReturnConsumedCapacity: 'TOTAL',
//           ReturnValues: 'ALL_OLD',
//           Key: { pk: clientPkPrefix(d.clientId), sk: orderSkPrefix(order.id) },
//         });
//         order.items.forEach((oItem: any) => {
//           req.push({
//             TableName: environment.TABLE_NAMES.Client,
//             ReturnConsumedCapacity: 'TOTAL',
//             ReturnValues: 'ALL_OLD',
//             Key: { pk: clientPkPrefix(d.clientId), sk: orderItemSkPrefix(`${order.id}-${oItem.id}`) },
//           });
//         });
//         return req;
//       },
//       [
//         {
//           TableName: environment.TABLE_NAMES.Client,
//           ReturnConsumedCapacity: 'TOTAL',
//           ReturnValues: 'ALL_OLD',
//           Key: { pk: CLIENT_PRIMARY_KEY, sk: d.clientId },
//         },
//         ...permissionRemoves,
//       ]
//     );

//     const rest = await Promise.all(removeRequests.map((req: any) => remove(req)));
//     // metro.metricStop(mid);
//     return '';
//   } catch (err) {
//     // metro.metricStop(mid);
//     throw err;
//   }
// };
