import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';
import * as metro from '@util/metrica';
import {
  submitOrder,
  transitionOrder,
  getOrderProperties,
  getOrder,
  getOrders,
  createOrder,
  updateOrder,
} from '../../services/order';
import { sendOrderSubmittedEmail } from '@services/email.service';
import { getStore } from '../../services/store';
import { Order } from '../../models/user.order';
import { Store } from '../../models/store';
import { hasPermission } from '../../services/user.permissions';
export const resolvers: IResolvers = {
  Query: {
    getOrders: async (root, args, context) => {
      const mid = metro.metricStart('get orders');
      try {
        if (!context.user) {
          throw new ApolloError('You must login first');
        }
        const params: any = {};
        /**
         * user permission are currently attached to
         */
        if (
          args.search.storeId &&
          (hasPermission(args.search.storeId, 'store', 'store_admin', context.user.permissions) ||
            hasPermission(args.search.storeId, 'store', 'store_employee', context.user.permissions))
        ) {
          params.storeId = args.search.storeId;
          params.state = args.search.state;
        }
        if (
          args.search.userId === context.user.id ||
          hasPermission(args.search.storeId, 'store', 'admin', context.user.permissions)
        ) {
          params.userId = args.search.userId;
        }

        const orders = await getOrders(params);
        metro.metricStop(mid);
        return orders;
      } catch (err) {
        console.error(err);
        metro.metricStop(mid);
        throw err;
      }
    },
    getOrder: async (root, args, context) => {
      const mid = metro.metricStart('get order');
      try {
        const order = await getOrder(args.userId, args.orderId);
        metro.metricStop(mid);
        return order;
      } catch (err) {
        metro.metricStop(mid);
        throw err;
      }
    },
    // ADMIN ONLY: get private stores
  },
  Mutation: {
    submitOrder: async (root, args, context) => {
      const mid = metro.metricStart('submit order');
      try {
        if (!context.user) {
          throw new ApolloError('You must login first');
        }
        const order = await getOrderProperties(context.user.id, args.orderId);
        if (order.state !== 'open') {
          throw new ApolloError('You have already submitted this order');
        }
        const returnVal = await submitOrder(context.user.id, args.orderId);
        /**
         * @TODO Add storeName and correct order link
         */
        sendOrderSubmittedEmail('order.store.name', 'https://app.com', args.orderId, context.user.email);
        metro.metricStop(mid);
        return returnVal;
      } catch (err) {
        metro.metricStop(mid);
        throw err;
      }
    },
    transitionOrderState: async (root, args, context) => {
      const mid = metro.metricStart('transition order');
      try {
        if (!context.user) {
          throw new ApolloError('You must login first');
        }
        // user must have store permissions to transition orders for the given storeId
        if (
          !hasPermission(args.storeId, 'store', 'store_admin', context.user.permissions) &&
          !hasPermission(args.storeId, 'store', 'store_employee', context.user.permissions)
        ) {
          throw new ApolloError('You do not have the permissions to transition this order');
        }
        const order = await getOrderProperties(args.orderUserId, args.orderId);
        if (order.storeId !== args.storeId) {
          throw new ApolloError('You cannot transition this order');
        }
        await transitionOrder(args.orderUserId, args.orderId, args.state);
        metro.metricStop(mid);
        return;
      } catch (err) {
        metro.metricStop(mid);
        throw err;
      }
    },
    updateOrder: async (root, args, context) => {
      const mid = metro.metricStart('update order');
      try {
        if (!context.user) {
          throw new ApolloError('You must login first');
        }
        const ogOrder = await getOrder(context.user.id, args.orderId);
        if (ogOrder.state !== 'open') {
          throw new ApolloError('Order has been submitted');
        }
        const order = await updateOrder(context.user.id, args.order, ogOrder);
        metro.metricStop(mid);
        /**
         * @TODO must get user and store data to add to order object
         */

        return order;
      } catch (err) {
        metro.metricStop(mid);
        throw err;
      }
    },
    createOrder: async (root, args, context) => {
      const mid = metro.metricStart('create order');
      try {
        if (!context.user) {
          throw new ApolloError('You must login first');
        }
        const [order, store]: [Order, Store] = await Promise.all([
          createOrder(context.user.id, args.order),
          getStore(args.order.storeId),
        ]);
        (order as any).store = store;
        (order as any).user = context.user;

        metro.metricStop(mid);
        return order;
      } catch (err) {
        metro.metricStop(mid);
        throw err;
      }
    },
    // STORE ADMIN: Submit Store For Review
    // ADMIN ONLY: Public Store
  },
};
