import uuid from 'uuid';
import { query, put } from '@services/dynamo-connect';
import { environment } from '@config/environment';
import * as metro from '@util/metrica';
import { permissionsPrefix } from '../constants';
import { PermissionType, UserPermissionsInput, UserPermissionsType, UserPermissions } from '../models/user.permissions';

export const addUserPermissions = async (permissionsInput: UserPermissionsInput): Promise<UserPermissionsType> => {
  const mid = metro.metricStart('add user permissions');
  try {
    const permissionId = uuid();
    const perm = new UserPermissions({
      ...permissionsInput,
      id: permissionId,
    });
    const rest = await put({
      TableName: environment.TABLE_NAMES.Users,
      ReturnConsumedCapacity: 'TOTAL',
      Item: perm.serialize(),
    });
    metro.metricStop(mid);
    return perm;
  } catch (err) {
    metro.metricStop(mid);
    throw err.message;
  }
};

export const getUserPermissions = async (userId: string): Promise<UserPermissions[]> => {
  const mid = metro.metricStart('get user permissions');
  try {
    const { Items, ...rest } = await query({
      TableName: environment.TABLE_NAMES.Users,
      ReturnConsumedCapacity: 'TOTAL',
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': permissionsPrefix(userId) },
    });
    metro.metricStop(mid);
    return Items.map((item: any) => new UserPermissions(item));
  } catch (err) {
    metro.metricStop(mid);
    throw err.message;
  }
};

/**
 * @TODO add permissions helper
 */

export const hasPermission = (
  entityId: string,
  entityType: string,
  permissionType: PermissionType,
  permissions: UserPermissionsType[] = []
): boolean => {
  return permissions
    .filter((perm) => perm.entityId === entityId)
    .filter((perm) => perm.entityType === entityType)
    .some((perm) => perm.permissionType === permissionType);
};
