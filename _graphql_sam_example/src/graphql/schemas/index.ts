import { mergeSchemas } from 'graphql-tools';
import GraphQLJSON from 'graphql-type-json';

import { heaterSchema } from '../heater/heater.schema';
import { userSchema } from '../user/user.schema';
import { dateResolvers } from '../directives/date';
import { storeSchema } from '../store/store.schema';
import { orderSchema } from '../order/order.schema';

const JSONResolver = {
  JSON: GraphQLJSON,
};
export const schema = mergeSchemas({
  schemas: [heaterSchema, userSchema, storeSchema, orderSchema],
  resolvers: [dateResolvers, JSONResolver],
});
