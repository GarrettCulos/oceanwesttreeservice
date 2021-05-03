import { mergeSchemas } from 'graphql-tools';
import GraphQLJSON from 'graphql-type-json';

import { heaterSchema } from '../heater/heater.schema';
import { dateResolvers } from '../directives/date';
import genericSchemes from '../generics.types';
const JSONResolver = {
  JSON: GraphQLJSON,
};
export const schema = mergeSchemas({
  schemas: [heaterSchema, genericSchemes],
  resolvers: [dateResolvers, JSONResolver],
});
