import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './user.resolver';
import { resolvers as authResolvers } from './auth.resolver';
import genericsTypes from '../generics.types';

export const userSchema = makeExecutableSchema({
  typeDefs: [
    genericsTypes,
    `      
      type Query {
        currentUser: User
      }
      
      type Mutation {
        exchangeGoogle(auth: AuthInput): AuthToken
        exchangeFacebook(auth: AuthInput): AuthToken
        createAccount(creation: CreationInput): AuthToken
        refreshToken: AuthToken
      }

      input CreationInput {
        token: String!
        email: String!
        phone: Float!
        userName: String!
        userIcon: String
      }

      input AuthInput {
        email: String
        idToken: String
      }

      type AuthToken {
        type: String
        token: String
        expiresIn: Int
        user: User
      }
    `,
  ],
  resolvers: [resolvers, authResolvers],
});
