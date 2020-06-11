import { mergeSchemas } from 'graphql-tools';
import GraphQLJSON from 'graphql-type-json';

import { heaterSchema } from '../heater/heater.schema';
import { dateResolvers } from '../directives/date';
import { backupSchema } from '../backup/backup.schema';
import { clientSchema } from '../client/client.schema';

const JSONResolver = {
  JSON: GraphQLJSON,
};
export const schema = mergeSchemas({
  schemas: [heaterSchema, clientSchema, backupSchema],
  resolvers: [dateResolvers, JSONResolver],
});
