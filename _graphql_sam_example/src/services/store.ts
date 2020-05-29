import { remove, batch, query, put } from '@services/dynamo-connect';
import { environment } from '@config/environment';
import uuid from 'uuid';
import {
  Store,
  StoreInput,
  StoreUpdateInput,
  StoreActiveState,
  InventoryItemChangeType,
  InventoryItem,
} from '../models/store';
import { PRIVATE_STORE_PRIMARY_KEY, STORE_PRIMARY_KEY, storePkPrefix, storeItemPrefix } from '../constants';
import { addUserPermissions } from './user.permissions';

/**
 * get publicly visible stores
 */
export const getStores = async (d: { limit?: number; geoHash?: string; type?: string }): Promise<any> => {
  const baseParams: any = {
    TableName: environment.TABLE_NAMES.Store,
    Limit: d.limit || 15,
    ReturnConsumedCapacity: 'TOTAL',
  };
  // IndexName: 'GeoSearch'
  const { Items, ...rest } = await query({
    ...baseParams,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': STORE_PRIMARY_KEY },
  });
  return Items.map((str) => new Store(str as any));
};

/**
 * get a private or public store given the storeId;
 * make sure you check permissions post get.
 * @param storeId string
 */
export const getStore = async (storeId: string): Promise<Store> => {
  // get order, validate after get.
  const params = {
    TableName: environment.TABLE_NAMES.Store,
    Limit: 1,
    ReturnConsumedCapacity: 'TOTAL',
  };
  const privateStoreQ = query({
    ...params,
    KeyConditionExpression: 'pk = :private AND sk = :sk',
    ExpressionAttributeValues: { ':private': PRIVATE_STORE_PRIMARY_KEY, ':sk': storeId },
  });
  const publicStoreQ = query({
    ...params,
    KeyConditionExpression: 'pk = :pub AND sk = :sk',
    ExpressionAttributeValues: { ':pub': STORE_PRIMARY_KEY, ':sk': storeId },
  });
  const [{ Items: PrivateItems, ...rest1 }, { Items: PublicItems, ...rest2 }] = await Promise.all([
    privateStoreQ,
    publicStoreQ,
  ]);
  if (!PrivateItems[0] && !PublicItems[0]) {
    throw 'Store not found';
  }
  if (PublicItems[0]) {
    return new Store({ ...(PublicItems[0] as any) });
  } else {
    return new Store({ ...(PrivateItems[0] as any) });
  }
};

/**
 * Get store Inventory Items
 * @param storeId string
 */
export const getStoreInventory = async (storeId: string): Promise<InventoryItem[]> => {
  // initial order state = 'open'
  const params = {
    TableName: environment.TABLE_NAMES.Store,
    ReturnConsumedCapacity: 'TOTAL',
  };
  const { Items, ...rest } = await query({
    ...params,
    KeyConditionExpression: 'pk = :id AND begins_with (sk, :sk)',
    ExpressionAttributeValues: { ':id': storePkPrefix(storeId), ':sk': storeItemPrefix() },
  });
  return Items.map((item) => new InventoryItem(item as any));
};

/**
 * Create Store
 */
export const createStore = async (userId: string, store: StoreInput): Promise<Store> => {
  // add store
  const id = uuid();
  const st = new Store({
    id,
    ...store,
    activeState: 'creating',
    pk: PRIVATE_STORE_PRIMARY_KEY,
  });
  const request = await put({
    Item: st.serialize(),
    ReturnConsumedCapacity: 'TOTAL',
    TableName: environment.TABLE_NAMES.Store,
  });
  const perm = await addUserPermissions({
    userId: userId,
    permissionType: 'store_admin',
    entityType: 'store',
    entityId: id,
  });
  return st;
};

/**
 * Update store function. This is how the users add/update inventory items.
 * @param storeId
 * @param store
 */
export const updateStore = async (storeId: string, store: StoreUpdateInput): Promise<any> => {
  const { inventory = [], ...rest } = store;
  const now = new Date();
  const storeQueries: any[] = [getStore(storeId)];
  if (inventory.some((change) => change.change === 'update')) {
    storeQueries.push(getStoreInventory(storeId));
  }
  const [ogStore, ogStoreItems] = await Promise.all(storeQueries);
  const newStore = new Store({
    ...ogStore,
    ...rest,
    hours: {
      ...ogStore.hours,
      ...rest.hours,
    },
    updatedAt: now,
    id: storeId,
  });
  // create batchUpdates 10 requests per update
  const changes = inventory.reduce((batchWriteObjects, change) => {
    if (change.change === 'remove') {
      batchWriteObjects.push({
        Delete: {
          TableName: environment.TABLE_NAMES.Store,
          Key: { pk: storePkPrefix(storeId), sk: storeItemPrefix(change.item.id) },
        },
      });
    } else if (change.change === 'update') {
      const ogItem = ogStoreItems.find((item: InventoryItem) => item.id === change.item.id);
      batchWriteObjects.push({
        Put: {
          TableName: environment.TABLE_NAMES.Store,
          Item: new InventoryItem({ ...ogItem, ...change.item, id: ogItem.id, updatedAt: now }).serialize(),
        },
      });
    } else {
      batchWriteObjects.push({
        Put: {
          TableName: environment.TABLE_NAMES.Store,
          Item: new InventoryItem(change.item).serialize(),
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
        Item: newStore.serialize(),
        ReturnConsumedCapacity: 'TOTAL',
        TableName: environment.TABLE_NAMES.Store,
      }),
    ]
  );
  await Promise.all(requests);
  const storeItems = await getStoreInventory(storeId);
  return { ...newStore, inventory: storeItems };
};

/**
 * @TODO ADD ADMIN ONLY ACTION FOR TRANSITIONING STORES
 * @TODO NEED TO TEST THIS FLOW;
 */
const changeStoreState = async (storeId: string, state: StoreActiveState): Promise<Store> => {
  const ogStore = await getStore(storeId);
  const store = new Store({ ...ogStore.serialize(), pk: STORE_PRIMARY_KEY, activeState: state });
  const rest = await put({
    Item: store.serialize(),
    ReturnConsumedCapacity: 'TOTAL',
    TableName: environment.TABLE_NAMES.Store,
  });
  await remove({
    Key: {
      ':sk': ogStore.sk,
      ':pk': ogStore.pk,
    },
    ConditionExpression: 'pk = :pk AND sk = :sk',
    TableName: environment.TABLE_NAMES.Store,
  });
  return store;
};
export const publicStore = async (storeId: string) => changeStoreState(storeId, 'active');
export const submitForReview = async (storeId: string) => changeStoreState(storeId, 'under_review');

/**
 * @TODO create a function for getting stores that are under_review
 */
