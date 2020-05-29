import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';

import * as metro from '@util/metrica';
import { verifyGoogleToken } from '@services/google.service';
import { verifyFacebookToken } from '@services/facebook.service';
import { sendCreateAccountEmail } from '@services/email.service';
import { EXPIRES_IN, CREATE_TOKEN_TYPE, AUTHENTICATION_TOKEN_TYPE } from '../../constants';

import { jwtSign, decodeJwtToken } from '@services/jwt';
import { getUserByEmail, getUserById, addUser } from '../../services/user';
import { getUserPermissions } from '../../services/user.permissions';
import { UserType } from '../../models/user';

export const resolvers: IResolvers = {
  Mutation: {
    exchangeGoogle: async (root, args, context) => {
      const mid = metro.metricStart('exchange-google');
      try {
        const { idToken, email } = args.auth;
        const response: { [s: string]: string | number | UserType } = {
          token: undefined,
          type: AUTHENTICATION_TOKEN_TYPE,
          expiresIn: EXPIRES_IN,
        };
        const googleData = await verifyGoogleToken(idToken);

        if (!googleData.payload.email_verified) {
          throw 'email not verified';
        }
        // get user data for email.
        const user = await getUserByEmail(email);
        // if its not in the db, add data to user table
        if (!user) {
          // send response back triggering user to enter data to create account.
          // send back token that next step decodes
          const token = jwtSign({
            data: {
              type: CREATE_TOKEN_TYPE,
              email: email,
            },
            expiresIn: EXPIRES_IN,
          });
          return {
            token,
            expiresIn: EXPIRES_IN,
            type: CREATE_TOKEN_TYPE,
          };
        } else {
          const permissions = await getUserPermissions(user.id);
          user.permissions = permissions || [];
        }

        // get user orders
        // const [favorites, proj, privateProj] = await Promise.all([favoritesQ, getUserProjectsQ, getPrivateProjectsQ]);

        response.user = user;
        response.token = jwtSign({ data: response.user, expiresIn: EXPIRES_IN });
        metro.metricStop(mid);
        return response;
      } catch (err) {
        metro.metricStop(mid);
        throw new Error(err);
      }
    },
    refreshToken: async (root, args, context) => {
      const mid = metro.metricStart('refresh-token');
      try {
        if (!context.user) {
          throw new ApolloError('Cannot refresh token when its been expired');
        }
        const user = await getUserById(context.user.id);
        const permissions = await getUserPermissions(context.user.id);
        user.permissions = permissions || [];
        metro.metricStop(mid);
        const token = jwtSign({
          data: { ...user.serialize(), permissions: user.permissions.map((prm) => prm.serialize()) },
          expiresIn: EXPIRES_IN,
        });
        return {
          token,
          user,
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
        const { phone, userName, userIcon, token } = args.creation;
        const decodedToken = await decodeJwtToken(token, true);
        if (!decodedToken || decodedToken.type !== CREATE_TOKEN_TYPE) {
          throw 'token provided is invalid';
        }
        // check that user has not been registered already.
        const userCheck = await getUserByEmail(decodedToken.email);
        if (userCheck) {
          throw 'User has already been created';
        }
        const user = await addUser({
          email: decodedToken.email,
          phone,
          userName,
          userIcon,
        });
        user.permissions = [];
        user.orders = [];
        const authToken = jwtSign({ data: user.serialize(), expiresIn: EXPIRES_IN });
        /**
         * @TODO Add storeName and correct order link
         */
        sendCreateAccountEmail(user.userName, user.email);
        metro.metricStop(mid);
        return {
          type: AUTHENTICATION_TOKEN_TYPE,
          token: authToken,
          user: user.serialize(),
          expiresIn: EXPIRES_IN,
        };
      } catch (err) {
        metro.metricStop(mid);
        throw new Error(err);
      }
    },
    exchangeFacebook: async (root, args, context) => {
      const mid = metro.metricStart('exchange-facebook');
      try {
        const { idToken, email } = args.auth;
        const response: { [s: string]: string | number | UserType } = {
          token: undefined,
          type: AUTHENTICATION_TOKEN_TYPE,
          expiresIn: EXPIRES_IN,
        };
        const fbData = await verifyFacebookToken(idToken);
        // get user data for email.
        const user = await getUserByEmail(email);
        // if its not in the db, add data to user table
        if (!user) {
          // send response back triggering user to enter data to create account.
          // send back token that next step decodes
          const token = jwtSign({
            data: {
              type: CREATE_TOKEN_TYPE,
              email: email,
            },
            expiresIn: EXPIRES_IN,
          });
          return {
            token,
            expiresIn: EXPIRES_IN,
            type: CREATE_TOKEN_TYPE,
          };
        } else {
          const permissions = await getUserPermissions(user.id);
          user.permissions = permissions || [];
        }
        // get user orders
        // const [favorites, proj, privateProj] = await Promise.all([favoritesQ, getUserProjectsQ, getPrivateProjectsQ]);
        // user.favorites = favorites;
        // user.myProjects = [...proj, ...privateProj];
        response.user = user;
        response.token = jwtSign({ data: response.user, expiresIn: EXPIRES_IN });
        metro.metricStop(mid);
        return response;
      } catch (err) {
        metro.metricStop(mid);
        throw new Error(err);
      }
    },
  },
};
