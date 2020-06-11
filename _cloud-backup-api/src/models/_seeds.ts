import uuid from 'uuid';
import { Client } from './client';
import { Backup, BackupState } from './backup';

export const SeedClient = () => {
  return new Client({
    key: 'super secret key',
    secret: 'secret secret key',
    atlassianHost: uuid.v4(),
    email: 'response@test.com',
    enabled: true,
    activeBackups: ['testBackup'],
  } as any);
};

export const SeedBackup = (clientId: string) => {
  return new Backup({
    clientId,
    backupDate: new Date(),
    state: BackupState.Pending,
    withAttachments: false,
    s3Location: 'testing',
  } as any);
};
