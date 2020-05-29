import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './store.resolver';
import genericsTypes from '../generics.types';

export const storeSchema = makeExecutableSchema({
  typeDefs: [
    genericsTypes,
    `      
      type Query {
        getStores(search: SearchInput): [Store]
        getStore(storeId: String): StoreWithInventory
      }
      type Mutation {
        updateStore(storeId: String, store: StoreUpdate): StoreWithInventory
        createStore(store: StoreInput): StoreWithInventory
      }
      input SearchInput {
        limit: Int
        geoHash: String
        type: String
      }
    `,
  ],
  resolvers: [resolvers],
});
