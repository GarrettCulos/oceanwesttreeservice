import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';
import * as metro from '@util/metrica';
import { getUserById } from '../../services/user';
import { getUserPermissions } from '../../services/user.permissions';
export const resolvers: IResolvers = {
  Query: {
    currentUser: async (root, args, context) => {
      const mid = metro.metricStart('user');
      try {
        if (!context.user) {
          throw new ApolloError('You must login first');
        }
        const userQ = getUserById(context.user.id);
        const userPermissionsQ = getUserPermissions(context.user.id);
        // get user data, permissions, orders, and affiliated stores
        const [user, permissions] = await Promise.all([userQ, userPermissionsQ]);
        user.permissions = permissions;
        metro.metricStop(mid);
        return user;
      } catch (err) {
        metro.metricStop(mid);
        throw err.message;
      }
    },
  },
};
