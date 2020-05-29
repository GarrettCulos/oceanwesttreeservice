import uuid from 'uuid';
import { Order } from './user.order';
import { OrderItem } from './user.orderItem';
import { User } from './user';
import { Store, InventoryItem } from './store';

export const SeedUser = (): User => {
  return new User({
    phone: 12345678910,
    email: 'test@test.com',
    userName: 'test user name',
    userIcon: 'https://imagenotfound.jpg',
    id: uuid(),
  });
};

export const SeedStore = () => {
  return new Store({
    id: uuid(),
    lat: 12,
    long: 12,
    geoHash: uuid(),
    name: 'store name',
    type: 'grocery',
    phone: 12345678910,
    email: 'store@store.com',
    hours: {
      monday: [700, 1600],
      tuesday: [700, 1600],
      wednesday: [700, 1600],
      thursday: [700, 1600],
      friday: [700, 1600],
      saturday: [700, 1600],
      sunday: [700, 1600],
    },
  });
};

export const SeedOrderItem = (userId = uuid(), storeId = uuid(), inventoryId = uuid()) => {
  return new OrderItem(userId, storeId, {
    id: uuid(),
    inventoryId: inventoryId,
    quantity: 1,
    name: 'ast sing',
    brand: 'test brand',
    units: undefined,
  });
};

export const SeedStoreItem = (storeId = uuid()) => {
  return new InventoryItem({
    id: uuid(),
    produceSkew: uuid(),
    name: 'string',
    price: 12.33,
    currency: 'CND',
    storeId: storeId,
    isPublic: true,
    description: 'super cool pasta',
    stockStatus: 'med',
  });
};

export const SeedOrder = (userId = uuid()): Order => {
  const orderId = uuid();
  const storeId = uuid();
  return new Order({
    id: orderId,
    state: 'open',
    storeId,
    store: SeedStore(),
    items: [SeedOrderItem(userId, storeId, uuid())],
    userId: userId,
    user: SeedUser(),
  });
};
