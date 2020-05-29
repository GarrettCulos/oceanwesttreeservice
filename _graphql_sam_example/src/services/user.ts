import uuid from 'uuid';
import { remove, query, put } from '@services/dynamo-connect';
import { environment } from '@config/environment';
import * as metro from '@util/metrica';
import { USER_PRIMARY_KEY, permissionsPrefix, orderItemSkPrefix, orderSkPrefix, userPkPrefix } from '../constants';
import { User, AddUserInterface } from '../models/user';
import { getUserPermissions } from '../services/user.permissions';
import { getOrders, getOrder } from '../services/order';

export const getUserById = async (userId: string): Promise<User> => {
  const mid = metro.metricStart('getUserById');
  try {
    const params: any = {
      TableName: environment.TABLE_NAMES.Users,
      Limit: 1,
      ReturnConsumedCapacity: 'TOTAL',
    };
    const { Items, ...rest } = await query({
      ...params,
      KeyConditionExpression: 'pk = :id AND sk = :sk',
      ExpressionAttributeValues: { ':id': USER_PRIMARY_KEY, ':sk': userId },
    });
    metro.metricStop(mid);
    return new User(Items[0] as any);
  } catch (err) {
    metro.metricStop(mid);
    throw err;
  }
};
export const addUser = async (d: AddUserInterface): Promise<User> => {
  const mid = metro.metricStart('addUser');
  try {
    const userId = uuid();
    const now = new Date();
    const user = new User({
      ...d,
      id: userId,
      createdAt: now,
      updatedAt: now,
    });
    await put({
      TableName: environment.TABLE_NAMES.Users,
      ReturnConsumedCapacity: 'TOTAL',
      Item: user.serialize() as any,
    });
    const userD = await getUserById(userId);
    metro.metricStop(mid);
    return userD;
  } catch (err) {
    metro.metricStop(mid);
    throw err.message;
  }
};
export const getUserByEmail = async (userEmail: string): Promise<User> => {
  const mid = metro.metricStart('getUserByEmail');
  try {
    const params: any = {
      TableName: environment.TABLE_NAMES.Users,
      Limit: 1,
      ReturnConsumedCapacity: 'TOTAL',
      IndexName: 'UserEmail',
    };
    const { Items, ...rest } = await query({
      ...params,
      KeyConditionExpression: 'pk = :pk AND email = :email',
      ExpressionAttributeValues: { ':pk': USER_PRIMARY_KEY, ':email': userEmail },
    });
    if (!Items[0]) {
      return;
    }
    const user = await getUserById((Items[0] as any).id);
    metro.metricStop(mid);
    return user;
  } catch (err) {
    metro.metricStop(mid);
    throw err;
  }
};

export const deleteUserData = async (d: { userId: string }) => {
  // const mid = metro.metricStart('deleteUserData');
  try {
    const orders = await getOrders({ limit: 100000, userId: d.userId });

    const getPermissionsP = getUserPermissions(d.userId);
    const [{ Items: permissions }, ...newOrders] = await Promise.all([
      getPermissionsP as any,
      ...orders.map((order) => getOrder(d.userId, order.id)),
    ]);
    const permissionRemoves = (permissions || []).map((perm: any) => ({
      TableName: environment.TABLE_NAMES.Users,
      ReturnConsumedCapacity: 'TOTAL',
      ReturnValues: 'ALL_OLD',
      Key: { pk: permissionsPrefix(d.userId), sk: perm.sk },
    }));
    const removeRequests = newOrders.reduce(
      (req, order) => {
        req.push({
          TableName: environment.TABLE_NAMES.Users,
          ReturnConsumedCapacity: 'TOTAL',
          ReturnValues: 'ALL_OLD',
          Key: { pk: userPkPrefix(d.userId), sk: orderSkPrefix(order.id) },
        });
        order.items.forEach((oItem: any) => {
          req.push({
            TableName: environment.TABLE_NAMES.Users,
            ReturnConsumedCapacity: 'TOTAL',
            ReturnValues: 'ALL_OLD',
            Key: { pk: userPkPrefix(d.userId), sk: orderItemSkPrefix(`${order.id}-${oItem.id}`) },
          });
        });
        return req;
      },
      [
        {
          TableName: environment.TABLE_NAMES.Users,
          ReturnConsumedCapacity: 'TOTAL',
          ReturnValues: 'ALL_OLD',
          Key: { pk: USER_PRIMARY_KEY, sk: d.userId },
        },
        ...permissionRemoves,
      ]
    );

    const rest = await Promise.all(removeRequests.map((req: any) => remove(req)));
    // metro.metricStop(mid);
    return '';
  } catch (err) {
    // metro.metricStop(mid);
    throw err;
  }
};
