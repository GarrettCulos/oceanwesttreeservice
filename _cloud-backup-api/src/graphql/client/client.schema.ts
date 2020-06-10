import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './client.resolver';
import { resolvers as authResolvers } from './auth.resolver';
import genericsTypes from '../generics.types';

export const clientSchema = makeExecutableSchema({
  typeDefs: [
    genericsTypes,
    `      
      type Query {
        currentUser: User
      }
      
      type Mutation {
        createAccount(creation: CreationInput): AuthToken
        refreshToken: AuthToken
      }

      input CreationInput {
        name: String!
        email: String!
        key: String!
        secret: String!
        atlassianHost: String
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
