import { Order } from './user.order';
import { USER_PRIMARY_KEY } from '../constants';
import { UserPermissions } from './user.permissions';

export class UserType {
  readonly id: string;
  userName: string;
  userIcon: string;
  email?: string;
  phone?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Users are part of the Users Table (with sort key USER_DETAILS)
 * This table will hold the user entities (orders, order items) having different sort keys
 */
export class User extends UserType {
  orders?: Order[];
  permissions?: UserPermissions[];

  readonly pk: string;
  readonly sk: string;
  constructor(user: UserType) {
    super();
    Object.assign(this, { ...user, pk: USER_PRIMARY_KEY, sk: user.id });
    this.orders = this.orders || [];
    this.permissions = this.permissions || [];
    this.updatedAt = new Date(this.updatedAt);
    this.createdAt = new Date(this.createdAt);
  }
  serialize(): UserType {
    const { orders, permissions, ...savedData } = this;
    return {
      ...savedData,
      updatedAt: this.updatedAt.getTime(),
      createdAt: this.createdAt.getTime(),
    };
  }
}

export interface AddUserInterface {
  userName: string;
  email: string;
  phone: number;
  userIcon: string;

  [s: string]: any;
}
