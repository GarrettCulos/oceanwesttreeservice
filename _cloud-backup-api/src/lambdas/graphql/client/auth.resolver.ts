import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';

import * as metro from '@util/metrica';
import { jwtSign } from '@services/jwt';

import { EXPIRES_IN } from '../../../constants';
import { getClientById } from '../../../services/client';

export const resolvers: IResolvers = {
  Mutation: {
    refreshToken: async (root, args, context) => {
      const mid = metro.metricStart('refresh-token');
      try {
        if (!context.client) {
          throw new ApolloError('Cannot refresh token when its been expired');
        }
        const client = await getClientById(context.client.id);
        metro.metricStop(mid);
        const token = jwtSign({
          data: client.serialize(),
          expiresIn: EXPIRES_IN,
        });
        return {
          token,
          client,
          expiresIn: EXPIRES_IN,
        };
      } catch (err) {
        metro.metricStop(mid);
        throw new Error(err);
      }
    },
  },
};
