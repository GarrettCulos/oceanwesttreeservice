import { mergeSchemas } from 'graphql-tools';
import GraphQLJSON from 'graphql-type-json';

import { heaterSchema } from '../heater/heater.schema';
import { dateResolvers } from '../directives/date';
import { clientSchema } from '../client/client.schema';

const JSONResolver = {
  JSON: GraphQLJSON,
};
export const schema = mergeSchemas({
  schemas: [heaterSchema, clientSchema],
  resolvers: [dateResolvers, JSONResolver],
});
