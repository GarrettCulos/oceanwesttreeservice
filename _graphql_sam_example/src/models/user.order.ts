import { UserType } from './user';
import { Store } from './store';
import { OrderItemType, OrderItemChangeType } from './user.orderItem';
import { userPkPrefix, orderSkPrefix } from '../constants';
export type OrderState = 'open' | 'submitted' | 'received' | 'closed' | 'completed' | string;

export interface CreateOrderInput {
  storeId: string;
  items: OrderItemChangeType[];
  comments: string[];
}

export interface UpdateOrderInput {
  readonly id: string;
  state?: OrderState;
  items?: OrderItemChangeType[];
  newComments?: string[];
}

export class OrderType {
  readonly id: string;
  readonly userId: string;
  readonly user?: UserType;
  readonly storeId: string;
  readonly store?: Store;
  items?: OrderItemType[];
  state: OrderState;
  createdAt?: Date;
  updatedAt?: Date;
  comments?: string[];
}

export class Order extends OrderType {
  readonly pk: string;
  readonly sk: string;
  readonly storeIndexSk: string;
  constructor(order: OrderType) {
    super();
    if (!order.id) {
      console.error('you must provide order id: needed for SortKey');
    }
    if (!order.userId) {
      console.error('you must provide order.userId: needed for PrimaryKey');
    }
    if (!order.items) {
      order.items = [];
    }
    if (!order.comments) {
      order.comments = [];
    }
    const now = new Date();
    order.updatedAt = order.updatedAt ? new Date(order.updatedAt) : now;
    order.createdAt = order.createdAt ? new Date(order.createdAt) : now;
    Object.assign(this, {
      ...order,
      pk: userPkPrefix(order.userId),
      storeIndexSk: `${order.state}-${order.updatedAt}`,
      sk: orderSkPrefix(order.id),
    });
  }
  serialize(): Order {
    const { items, store, user, ...rest } = this;
    return {
      ...rest,
      updatedAt: this.updatedAt.getTime(),
      createdAt: this.createdAt.getTime(),
    };
  }
}
