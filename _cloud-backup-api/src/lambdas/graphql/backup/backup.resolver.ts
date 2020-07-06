import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';
import * as metro from '@util/metrica';
import { startBackup, initiateBackupPolling, getBackupDownloadLink } from '../../../services/atlassian-backup-service';
import { getBackups, addBackupRecord } from '../../../services/backup';
import { getClientById, updateClient } from '../../../services/client';

export const resolvers: IResolvers = {
  Query: {
    getBackups: async (root, args, context) => {
      const mid = metro.metricStart('get backups');
      try {
        if (!context.client) {
          throw new ApolloError('You are not authorized for that');
        }
        const clientId = context.client.id;
        const { backupDate } = args;
        const backups = await getBackups(clientId, backupDate);
        metro.metricStop(mid);
        return backups;
      } catch (err) {
        metro.metricStop(mid);
        throw err.message;
      }
    },
    getBackupLink: async (root, args, context) => {
      const mid = metro.metricStart('get backup signed url');
      try {
        if (!context.client) {
          throw new ApolloError('You are not authorized for that');
        }
        const clientId = context.client.id;
        const client = await getClientById(clientId);
        const downloadLink = await getBackupDownloadLink(client.bucket, args.backupName);
        metro.metricStop(mid);
        return downloadLink;
      } catch (err) {
        console.log(err);
        metro.metricStop(mid);
        throw err.message;
      }
    },
  },
  Mutation: {
    startBackup: async (root, args, context) => {
      const mid = metro.metricStart('start backup');
      try {
        if (!context.client) {
          throw new ApolloError('You are not authorized for that');
        }
        const clientId = context.client.id;
        const client = await getClientById(clientId);
        if (client.activeBackups.length > 0) {
          // if theres already a backup in progress, reject.
          throw new ApolloError('There is already a backup in progress');
        }
        const withAttachments = args.backupOptions.withAttachments;

        /**
         * TODO What happens if one of these tasks fails? how should we roleback? or try again. set backup record to errored?
         */
        /**
         * trigger backup
         */
        const backupTask = await startBackup(client, withAttachments);
        console.log(backupTask);
        const taskId = backupTask.taskId;
        console.log(taskId);

        // This should fail baecause the above payload is currently unknown
        // TODO document startBackup structure
        const backups = await addBackupRecord(clientId, { ...args.backupOptions, taskId: taskId });
        await updateClient(clientId, { activeBackupChange: [{ type: 'add', id: backups.id }] });

        /**
         * start backup polling events
         */
        await initiateBackupPolling(clientId, taskId);
        metro.metricStop(mid);
        return backups;
      } catch (err) {
        console.log(err);
        metro.metricStop(mid);
        throw err.message;
      }
    },
  },
};
