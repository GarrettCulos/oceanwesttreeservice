import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './heater.resolver';
export const heaterSchema = makeExecutableSchema({
  typeDefs: `
    type Query {
      ping: String
    }
 `,
  resolvers: [resolvers],
});
