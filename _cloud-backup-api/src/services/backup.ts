import { update, query, put } from '@services/dynamo-connect';
import { environment } from '@config/environment';
import * as metro from '@util/metrica';
import { backupSkPrefix } from '../constants';
import { Backup, UpdateBackupInterface, AddBackupInterface, BackupState } from '../models/backup';

export const getBackups = async (clientId: string, backupDate?: Date): Promise<Backup> => {
  const mid = metro.metricStart('getBackups');
  try {
    const params = {
      TableName: environment.TABLE_NAMES.Store,
      ReturnConsumedCapacity: 'TOTAL',
    };
    const { Items, ...rest } = await query({
      ...params,
      KeyConditionExpression: 'pk = :id AND begins_with (sk, :sk)',
      ExpressionAttributeValues: { ':id': clientId, ':sk': backupSkPrefix(backupDate ? backupDate.getTime() : '') },
    });
    return Items.map((item) => new Backup(item as any));
  } catch (err) {
    metro.metricStop(mid);
    throw err;
  }
};

export const addBackupRecord = async (clientId: string, backup: AddBackupInterface) => {
  const mid = metro.metricStart('addBackupRecord');
  try {
    const now = new Date();
    const backupRecord = new Backup({
      withAttachments: false,
      ...backup,
      state: BackupState.Pending,
      backupDate: now,
      clientId: clientId,
      createdAt: now,
      updatedAt: now,
    });
    await put({
      TableName: environment.TABLE_NAMES.Client,
      ReturnConsumedCapacity: 'TOTAL',
      Item: backupRecord.serialize() as any,
    });
    metro.metricStop(mid);
    return backupRecord;
  } catch (err) {
    metro.metricStop(mid);
    throw err.message;
  }
};

export const updateBackupRecord = async (clientId: string, backupDate: Date, backup: UpdateBackupInterface) => {
  const mid = metro.metricStart('updateBackupRecord');
  try {
    const now = new Date();
    await update({
      TableName: environment.TABLE_NAMES.Client,
      ReturnConsumedCapacity: 'TOTAL',
      Key: {
        pk: clientId,
        sk: backupSkPrefix(backupDate.getTime()),
      },
      UpdateExpression: 'SET #state = :state, #updatedAt = :now, #s3Location = :s3Location',
      ExpressionAttributeNames: { '#state': 'state', '#storeIndexSK': 'storeIndexSk', '#s3Location': 's3Location' },
      ExpressionAttributeValues: {
        ':s3Location': backup.s3Location,
        ':state': backup.state,
        ':now': `${now}`,
      },
    });
    const backupRecord = await getBackups(clientId, backupDate);
    metro.metricStop(mid);
    return backupRecord;
  } catch (err) {
    metro.metricStop(mid);
    throw err.message;
  }
};
