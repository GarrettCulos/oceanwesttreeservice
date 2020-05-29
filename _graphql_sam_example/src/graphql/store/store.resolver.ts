import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';
import * as metro from '@util/metrica';
import { getStores, getStore, getStoreInventory, createStore, updateStore } from '../../services/store';
import { hasPermission } from '../../services/user.permissions';
export const resolvers: IResolvers = {
  Query: {
    getStores: async (root, args, context) => {
      const mid = metro.metricStart('getStores');
      try {
        const stores = await getStores({});
        metro.metricStop(mid);
        return stores;
      } catch (err) {
        metro.metricStop(mid);
        throw err.message;
      }
    },
    getStore: async (root, args, context) => {
      const mid = metro.metricStart('get Store');
      try {
        const storeId = args.storeId;
        const storeQ = getStore(storeId);
        const inventoryQ = getStoreInventory(storeId);
        // get user orders
        const [store, inventory] = await Promise.all([storeQ, inventoryQ]);
        store.inventory = inventory;
        metro.metricStop(mid);
        return store;
      } catch (err) {
        metro.metricStop(mid);
        throw err.message;
      }
    },
    // ADMIN ONLY: get private stores
  },
  Mutation: {
    updateStore: async (root, args, context) => {
      const mid = metro.metricStart('update store');
      try {
        if (!context.user) {
          throw new ApolloError('You must login first');
        }
        if (!hasPermission(args.storeId, 'store', 'store_admin', context.user.permissions)) {
          throw new ApolloError('You do not have permissions to make that change');
        }
        const store = await updateStore(args.storeId, args.store);
        metro.metricStop(mid);
        return store;
      } catch (err) {
        metro.metricStop(mid);
        throw err.message;
      }
    },
    createStore: async (root, args, context) => {
      const mid = metro.metricStart('create store');
      try {
        if (!context.user) {
          throw new ApolloError('You must login first');
        }
        const store = await createStore(context.user.id, args.store);
        metro.metricStop(mid);
        return store;
      } catch (err) {
        metro.metricStop(mid);
        throw err.message;
      }
    },
    // STORE ADMIN: Submit Store For Review
    // ADMIN ONLY: Public Store
  },
};
