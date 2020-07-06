import uuid from 'uuid';
import { backupSkPrefix } from '../constants';

export interface AddBackupInterface {
  withAttachments?: boolean;
  taskId: string;
}

export interface UpdateBackupInterface {
  s3Location?: string;
  state?: BackupState;
}

export enum BackupState {
  'Pending',
  'Completed',
  'Errored',
}

export class BackupType {
  readonly id?: string;
  clientId: string;
  backupDate: Date;
  state: BackupState;
  withAttachments: boolean;
  s3Location?: string;
  updatedAt: Date;
  createdAt: Date;
}

export class Backup extends BackupType {
  readonly pk: string;
  readonly sk: string;
  constructor(backup: BackupType) {
    super();
    if (!backup.id) {
      (backup as any).id = uuid();
    }
    const now = new Date();
    Object.assign(this, { ...backup, pk: backup.clientId, sk: backupSkPrefix(backup.backupDate.getTime()) });
    this.updatedAt = backup.updatedAt ? new Date(backup.updatedAt) : now;
    this.createdAt = backup.createdAt ? new Date(backup.createdAt) : now;
  }
  serialize(): BackupType {
    return {
      ...this,
      updatedAt: this.updatedAt.getTime(),
      createdAt: this.createdAt.getTime(),
    };
  }
}
