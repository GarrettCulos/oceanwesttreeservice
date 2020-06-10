import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';
import * as metro from '@util/metrica';
import { getClientById } from '../../services/client';
export const resolvers: IResolvers = {
  Query: {
    currentUser: async (root, args, context) => {
      const mid = metro.metricStart('user');
      try {
        if (!context.user) {
          throw new ApolloError('You must login first');
        }
        const user = await getClientById(context.user.id);
        metro.metricStop(mid);
        return user;
      } catch (err) {
        metro.metricStop(mid);
        throw err.message;
      }
    },
  },
};
