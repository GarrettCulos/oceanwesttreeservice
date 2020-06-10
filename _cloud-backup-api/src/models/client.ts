import uuid from 'uuid';
import { CLIENT_PRIMARY_KEY, storePkPrefix } from '../constants';

export interface AddClientInterface {
  name: string;
  key: string;
  secret: string;
  atlassianHost: string;
  email: string;
}

export class ClientType {
  readonly id?: string;
  name: string;
  key: string;
  secret: string;
  atlassianHost: string;
  email: string;
  enabled: boolean;
  updatedAt: Date;
  createdAt: Date;
}

export class Client extends ClientType {
  readonly pk: string;
  readonly sk: string;
  constructor(client: ClientType) {
    super();
    if (!client.id) {
      (client as any).id = uuid();
    }
    const now = new Date();
    Object.assign(this, { ...client, pk: CLIENT_PRIMARY_KEY, sk: client.id });
    this.updatedAt = client.updatedAt ? new Date(client.updatedAt) : now;
    this.createdAt = client.createdAt ? new Date(client.createdAt) : now;
  }
  serialize(): ClientType {
    return {
      ...this,
      updatedAt: this.updatedAt.getTime(),
      createdAt: this.createdAt.getTime(),
    };
  }
}
