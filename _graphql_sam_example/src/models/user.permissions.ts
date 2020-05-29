import { permissionsPrefix } from '../constants';
export type PermissionType = 'store_admin' | 'store_employee' | 'admin';
export interface UserPermissionsInput {
  userId: string;
  permissionType: PermissionType;
  entityType: 'store' | string;
  entityId: string;
}

export class UserPermissionsType {
  id: string;
  userId: string;
  permissionType: PermissionType;
  entityType: 'store' | string;
  entityId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserPermissions extends UserPermissionsType {
  constructor(perm: UserPermissionsType) {
    super();
    const now = new Date();
    Object.assign(this, { ...perm, pk: permissionsPrefix(perm.userId), sk: perm.permissionType });
    this.updatedAt = perm.updatedAt ? new Date(perm.updatedAt) : now;
    this.createdAt = perm.createdAt ? new Date(perm.createdAt) : now;
  }
  serialize(): UserPermissionsType {
    return {
      ...this,
      updatedAt: this.updatedAt.getTime(),
      createdAt: this.createdAt.getTime(),
    };
  }
}
