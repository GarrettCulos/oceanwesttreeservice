import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './order.resolver';
import genericsTypes from '../generics.types';

export const orderSchema = makeExecutableSchema({
  typeDefs: [
    genericsTypes,
    `      
      type Query {
        getOrders(search: OrderSearchInput): [OrderSearch]
        getOrder(userId: String, orderId: String): Order
      }
      type Mutation {
        createOrder(order: CreateOrderInput): Order
        updateOrder(orderId: String, order: UpdateOrderInput): Order
        submitOrder(orderId: String): Boolean
        transitionOrderState(storeId: String, orderUserId: String, orderId: String, state: OrderStateEnum ): Boolean
      }
      input OrderSearchInput {
        userId: String
        storeId: String
        state: OrderStateEnum
        limit: Int
      }
    `,
  ],
  resolvers: [resolvers],
});
