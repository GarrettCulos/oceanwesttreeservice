import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './client.resolver';
import { resolvers as authResolvers } from './auth.resolver';
import genericsTypes from '../generics.types';

export const clientSchema = makeExecutableSchema({
  typeDefs: [
    genericsTypes,
    ` 
      enum BackupChangeEnum {
        add
        remove
      }

      input BackupChange {
        type: BackupChangeEnum
        id: String
      }

      type AuthToken {
        token: String
        expiresIn: Int
        client: Client
      }

      type Query {
        currentUser: Client
      }
      
      type Mutation {
        refreshToken: AuthToken
      }
    `,
  ],
  resolvers: [resolvers, authResolvers],
});
