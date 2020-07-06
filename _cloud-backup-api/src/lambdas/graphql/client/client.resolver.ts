import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';
import * as metro from '@util/metrica';
import { getClientById, updateClient } from '../../../services/client';
export const resolvers: IResolvers = {
  Query: {
    currentClient: async (root, args, context) => {
      const mid = metro.metricStart('get client');
      try {
        if (!context.client) {
          throw new ApolloError('You must login first');
        }
        const client = await getClientById(context.client.id);
        metro.metricStop(mid);
        return client;
      } catch (err) {
        metro.metricStop(mid);
        throw err.message;
      }
    },
  },
};
