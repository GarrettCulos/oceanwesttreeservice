import uuid from 'uuid';
import { STORE_PRIMARY_KEY, storePkPrefix, storeItemPrefix } from '../constants';
type StockLevel = 'low' | 'med' | 'high' | 'onOrder' | 'removed';
export type StoreActiveState = 'active' | 'creating' | 'under_review';
export class InventoryItemChangeType {
  readonly id?: string;
  name: string;
  price: number;
  currency: string;
  storeId: string;
  description: string;
  stockStatus: StockLevel;
  isPublic: boolean;
  produceSkew: string;
  images?: string[];
  lowImage?: string;
  productUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InventoryItemType {
  readonly id?: string;
  name: string;
  price: number;
  currency: string;
  storeId: string;
  description: string;
  stockStatus: StockLevel;
  isPublic: boolean;
  produceSkew: string;
  images?: string[];
  lowImage?: string;
  productUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InventoryItem extends InventoryItemType {
  readonly pk: string;
  readonly sk: string;
  constructor(item: InventoryItemType) {
    super();
    if (!item.id) {
      (item as any).id = uuid();
    }
    if (!item.storeId) {
      console.error('you must provide item.storeId: Needed for PrimaryKey');
    }
    const now = new Date();
    Object.assign(this, { ...item, pk: storePkPrefix(item.storeId), sk: storeItemPrefix(item.id) });
    this.updatedAt = item.updatedAt ? new Date(item.updatedAt) : now;
    this.createdAt = item.createdAt ? new Date(item.createdAt) : now;
  }
  serialize(): InventoryItemType {
    return {
      ...this,
      updatedAt: this.updatedAt.getTime(),
      createdAt: this.createdAt.getTime(),
    };
  }
}
export class StoreInput {
  lat: number;
  long: number;
  geoHash: string;
  name: string;
  summary: string;
  type: string;
  owner?: string;
  phone: number;
  email: string;
  website?: string;
  delivery?: boolean;
  activeState?: StoreActiveState;
  hours: {
    monday: number[];
    tuesday: number[];
    wednesday: number[];
    thursday: number[];
    friday: number[];
    saturday: number[];
    sunday: number[];
  };
}

export class StoreUpdateInput {
  readonly id: string;
  lat?: number;
  long?: number;
  geoHash?: string;
  name?: string;
  summary?: string;
  type?: string;
  owner?: string;
  phone?: number;
  email?: string;
  website?: string;
  delivery?: boolean;
  hours?: {
    monday?: number[];
    tuesday?: number[];
    wednesday?: number[];
    thursday?: number[];
    friday?: number[];
    saturday?: number[];
    sunday?: number[];
  };
  inventory?: {
    change: 'add' | 'update' | 'remove';
    item: InventoryItemChangeType;
  }[];
}

export class StoreType {
  readonly pk?: string;
  readonly sk?: string;
  readonly id: string;
  lat: number;
  long: number;
  geoHash: string;
  name: string;
  summary?: string;
  type: string;
  owner?: string;
  phone: number;
  email: string;
  website?: string;
  delivery?: boolean;
  activeState?: StoreActiveState;
  hours: {
    monday: number[];
    tuesday: number[];
    wednesday: number[];
    thursday: number[];
    friday: number[];
    saturday: number[];
    sunday: number[];
  };
  inventory?: InventoryItemType[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Store extends StoreType {
  readonly pk: string;
  readonly sk: string;
  constructor(store: StoreType) {
    super();
    const now = new Date();
    if (!store.inventory) {
      store.inventory = [];
    }
    if (!store.id) {
      console.log('you must provide store.id: needed for SortKey');
    }
    Object.assign(this, { ...store, pk: store.pk || STORE_PRIMARY_KEY, sk: store.id });
    this.updatedAt = store.updatedAt ? new Date(store.updatedAt) : now;
    this.createdAt = store.createdAt ? new Date(store.createdAt) : now;
  }
  serialize(): StoreType {
    const { inventory, ...rest } = this;
    return {
      ...rest,
      updatedAt: this.updatedAt.getTime(),
      createdAt: this.createdAt.getTime(),
    };
  }
}
