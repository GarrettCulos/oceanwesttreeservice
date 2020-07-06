export const PROJECT_TAG_KEY = 'jira-cloud-backup-manager';
export const POLLING_LAMBDA_FUNCTION_NAME = 'atlassianCloudBackupPollingFunction';

export const DISALLOWED_PASSWORDS = 'banger';
export const EXPIRES_IN = 14400;

export const CLIENT_PRIMARY_KEY = 'CLIENT';
export const BACKUP_SORTKEY_PREFIX = 'BACKUP';

export const backupSkPrefix = (s: string | number = '') => `${BACKUP_SORTKEY_PREFIX}-${s}`;
