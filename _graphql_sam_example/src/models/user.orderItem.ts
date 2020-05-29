import { userPkPrefix, orderItemSkPrefix } from '../constants';

export class OrderItemInput {
  inventoryId: string;
  quantity: number;
  name: string;
  brand?: string;
  units?: string;
  // comment?: string;
}

class OrderItemChangeInput extends OrderItemInput {
  id?: string;
  inventoryId: string;
  quantity: number;
  name: string;
  brand?: string;
  units?: string;
  // comment?: string;
}
export class OrderItemChangeType {
  changeType: 'add' | 'remove' | 'update';
  item: OrderItemChangeInput;
}
export class OrderItemType {
  readonly id: string;
  inventoryId: string;
  quantity: number;
  name: string;
  brand?: string;
  units?: string;
  // comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrderItem extends OrderItemType {
  public pk: string;
  public sk: string;
  constructor(userId: string, orderId: string, item: OrderItemType) {
    super();
    const now = new Date();
    Object.assign(this, { ...item, pk: userPkPrefix(userId), sk: orderItemSkPrefix(`${orderId}-${item.id}`) });
    this.updatedAt = item.updatedAt ? new Date(item.updatedAt) : now;
    this.createdAt = item.createdAt ? new Date(item.createdAt) : now;
  }
  serialize(): OrderItemType {
    return {
      ...this,
      updatedAt: this.updatedAt.getTime(),
      createdAt: this.createdAt.getTime(),
    };
  }
}
