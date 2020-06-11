import { IResolvers } from 'graphql-tools';
import { ApolloError } from 'apollo-server';
import * as metro from '@util/metrica';
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

        const backups = await addBackupRecord(clientId, args.backupOptions);
        await updateClient(clientId, { activeBackupChange: [{ type: 'add', id: backups.id }] });
        /**
         * @TODO start backup
         */

        /**
         * @TODO start backup polling events
         */
        metro.metricStop(mid);
        return backups;
      } catch (err) {
        metro.metricStop(mid);
        throw err.message;
      }
    },
  },
};
