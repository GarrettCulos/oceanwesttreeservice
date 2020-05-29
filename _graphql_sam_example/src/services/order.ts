import { update, batch, query, put } from '@services/dynamo-connect';
import uuid from 'uuid';
import { ApolloError } from 'apollo-server';
import { environment } from '@config/environment';

import { Order, UpdateOrderInput, CreateOrderInput, OrderState } from '../models/user.order';
import { OrderItem } from '../models/user.orderItem';
import { userPkPrefix, orderSkPrefix, ORDER_PRIMARY_KEY, orderItemSkPrefix } from '../constants';
import { getUserById } from '../services/user';

export const getOrders = async (d: {
  limit?: number;
  userId?: string;
  storeId?: string;
  state?: OrderState;
}): Promise<Order[]> => {
  // get orders for user, and get orders by storeId
  const baseParams: any = {
    TableName: environment.TABLE_NAMES.Users,
    Limit: d.limit || 15,
    ReturnConsumedCapacity: 'TOTAL',
  };
  if (d.userId) {
    const { Items, ...rest }: { Items?: any[] } = await query({
      ...baseParams,
      KeyConditionExpression: 'pk = :pk AND begins_with (sk, :sk)',
      ExpressionAttributeValues: { ':pk': userPkPrefix(d.userId), ':sk': ORDER_PRIMARY_KEY },
    });
    // missing store data
    return Items.map((str) => new Order(str));
  }
  if (d.storeId) {
    const { Items, ...rest }: { Items?: any[] } = await query({
      ...baseParams,
      IndexName: 'StoreOrder',
      KeyConditionExpression: 'storeId = :pk AND begins_with (storeIndexSk, :sk)',
      ExpressionAttributeValues: { ':pk': d.storeId, ':sk': d.state || 'submitted' },
    });
    return Items.map((str) => new Order(str));
  }
  return [];
};
export const getOrderProperties = async (userId: string, orderId: string): Promise<Order> => {
  // get order, validate after get.
  // IndexName: 'GeoSearch'
  const orderParams: any = {
    TableName: environment.TABLE_NAMES.Users,
    Limit: 1,
    ReturnConsumedCapacity: 'TOTAL',
    KeyConditionExpression: 'pk = :pk AND sk = :sk',
    ExpressionAttributeValues: { ':pk': userPkPrefix(userId), ':sk': orderSkPrefix(orderId) },
  };
  const orderD = await query(orderParams);
  if (!orderD.Items[0]) {
    throw new ApolloError('Order does not exist');
  }
  return new Order(orderD.Items[0] as any);
};
export const getOrder = async (userId: string, orderId: string): Promise<Order> => {
  // get order, validate after get.
  const orderItemParams: any = {
    TableName: environment.TABLE_NAMES.Users,
    ReturnConsumedCapacity: 'TOTAL',
    KeyConditionExpression: 'pk = :pk AND begins_with (sk, :sk)',
    ExpressionAttributeValues: { ':pk': userPkPrefix(userId), ':sk': orderItemSkPrefix(orderId) },
  };
  const OrderQ = getOrderProperties(userId, orderId);
  const userQ = getUserById(userId);
  const OrderItemQ = query(orderItemParams);
  const [order, OrderItems, user] = await Promise.all([OrderQ, OrderItemQ, userQ]);
  (order as any).user = user;
  order.items = OrderItems.Items.map((item) => new OrderItem(userId, orderId, item as any));
  return order;
};

export const createOrder = async (userId: string, order: CreateOrderInput): Promise<Order> => {
  try {
    const { items = [], ...orderData } = order;
    const orderId = uuid();
    const data = new Order({ ...orderData, userId: userId, id: orderId, state: 'open' });
    const itemData = items
      .filter((item) => item.changeType === 'add')
      .map((item) => {
        const orderItem = new OrderItem(userId, orderId, { ...item.item, id: uuid() });
        data.items.push(orderItem);
        return {
          Put: {
            TableName: environment.TABLE_NAMES.Users,
            Item: orderItem.serialize(),
          },
        };
      });
    let batchQueue: any[] = [];
    const writeLimit = 10;
    const batchQueueLength = itemData.length;
    const requests = itemData.reduce(
      (requests, change, index) => {
        if (batchQueue.length === writeLimit - 1 || index === batchQueueLength - 1) {
          requests.push(batch({ TransactItems: [...batchQueue, change] }));
          batchQueue = [];
        } else {
          batchQueue.push(change);
        }
        return requests;
      },
      [
        put({
          Item: data.serialize(),
          ReturnConsumedCapacity: 'TOTAL',
          TableName: environment.TABLE_NAMES.Users,
        }) as Promise<any>,
      ]
    );
    await Promise.all([requests]);
    return data;
  } catch (err) {
    throw new Error(err);
  }
};
export const updateOrder = async (userId: string, order: UpdateOrderInput, ogOrder: Order): Promise<Order> => {
  const { newComments, items = [], ...rest } = order;
  const newComs = newComments ? newComments : [];
  const updatedOrder = new Order({
    ...ogOrder,
    ...rest,
    comments: [...ogOrder.comments, ...newComs],
  });
  // create batchUpdates 10 requests per update
  const changes = items.reduce((batchWriteObjects, change) => {
    if (change.changeType === 'remove') {
      updatedOrder.items = updatedOrder.items.filter((item) => item.id !== change.item.id);
      batchWriteObjects.push({
        Delete: {
          TableName: environment.TABLE_NAMES.Users,
          Key: { pk: userPkPrefix(userId), sk: orderItemSkPrefix(`${order.id}-${change.item.id}`) },
        },
      });
    } else {
      const itemExists = updatedOrder.items.find((item) => item.id === change.item.id);
      const itemId = itemExists ? itemExists.id : uuid();
      const newItem = new OrderItem(userId, order.id, { id: itemId, ...itemExists, ...change.item });
      updatedOrder.items = updatedOrder.items.filter((item) => item.id !== change.item.id);
      updatedOrder.items.push(newItem);
      batchWriteObjects.push({
        Put: {
          TableName: environment.TABLE_NAMES.Users,
          Item: newItem.serialize(),
        },
      });
    }
    return batchWriteObjects;
  }, []);

  let batchQueue: any[] = [];
  const writeLimit = 10;
  const batchQueueLength = changes.length;
  const requests = changes.reduce(
    (requests, change, index) => {
      if (batchQueue.length === writeLimit - 1 || index === batchQueueLength - 1) {
        requests.push(batch({ TransactItems: [...batchQueue, change] }));
        batchQueue = [];
      } else {
        batchQueue.push(change);
      }
      return requests;
    },
    [
      put({
        Item: updatedOrder.serialize(),
        ReturnConsumedCapacity: 'TOTAL',
        TableName: environment.TABLE_NAMES.Users,
      }),
    ]
  );
  const res = await Promise.all(requests);
  return updatedOrder;
};

export const transitionOrder = async (orderUserId: string, orderId: string, state: string): Promise<boolean> => {
  const now = new Date().getTime();
  await update({
    TableName: environment.TABLE_NAMES.Users,
    ReturnConsumedCapacity: 'TOTAL',
    Key: {
      pk: userPkPrefix(orderUserId),
      sk: orderSkPrefix(orderId),
    },
    UpdateExpression: 'SET #state = :state, #storeIndexSK = :indexSk',
    ExpressionAttributeNames: { '#state': 'state', '#storeIndexSK': 'storeIndexSk' },
    ExpressionAttributeValues: {
      ':state': state,
      ':indexSk': `${state}-${now}`,
    },
  });
  return true;
};

export const submitOrder = async (userId: string, orderId: string) => {
  try {
    const now = new Date().getTime();
    await update({
      TableName: environment.TABLE_NAMES.Users,
      ReturnConsumedCapacity: 'TOTAL',
      Key: {
        pk: userPkPrefix(userId),
        sk: orderSkPrefix(orderId),
      },
      UpdateExpression: 'SET #state = :state, #storeIndexSK = :indexSk',
      ConditionExpression: '#state = :open',
      ExpressionAttributeNames: { '#state': 'state', '#storeIndexSK': 'storeIndexSk' },
      ExpressionAttributeValues: {
        ':state': 'submitted',
        ':indexSk': `submitted-${now}`,
        ':open': 'open',
      },
    });
    return true;
  } catch (err) {
    console.error(err);
    throw new ApolloError('Submission Failed');
  }
};
// call updateOrder for add/update/remove items
// export const addOrderItems = async (userId: string, orderId: string, items: OrderItemInput[]): Promise<any> => {
//   // add to user table (SK order item entry)
// };

// export const removeOrderItems = async (userId: string, orderId: string, orderItemIds: string[]): Promise<any> => {
//   // add to user table (SK order item entry)
// };
