import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';

import * as metro from '@util/metrica';
import { sendCreateAccountEmail } from '@services/email.service';
import { EXPIRES_IN, CREATE_TOKEN_TYPE, AUTHENTICATION_TOKEN_TYPE } from '../../constants';

import { jwtSign, decodeJwtToken } from '@services/jwt';
import { getClientById, addClient } from '../../services/client';

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
          type: AUTHENTICATION_TOKEN_TYPE,
          expiresIn: EXPIRES_IN,
        };
      } catch (err) {
        metro.metricStop(mid);
        throw new Error(err);
      }
    },
    createAccount: async (root, args, context) => {
      const mid = metro.metricStart('create-account');
      try {
        const { key, secret, atlassianHost, name, token } = args.creation;
        const decodedToken = await decodeJwtToken(token, true);
        if (!decodedToken || decodedToken.type !== CREATE_TOKEN_TYPE) {
          throw 'token provided is invalid';
        }
        // check that client has not been registered already.
        const clientCheck = await getClientById(atlassianHost);
        if (clientCheck) {
          throw 'Client has already been created';
        }
        const client = await addClient({
          email: decodedToken.email,
          name,
          atlassianHost,
          key,
          secret,
        });
        const authToken = jwtSign({ data: client.serialize(), expiresIn: EXPIRES_IN });
        /**
         * @TODO Add storeName and correct order link
         */
        sendCreateAccountEmail(client.name, client.email);
        metro.metricStop(mid);
        return {
          type: AUTHENTICATION_TOKEN_TYPE,
          token: authToken,
          client: client.serialize(),
          expiresIn: EXPIRES_IN,
        };
      } catch (err) {
        metro.metricStop(mid);
        throw new Error(err);
      }
    },
  },
};
