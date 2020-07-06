import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './backup.resolver';
import genericsTypes from '../generics.types';

export const backupSchema = makeExecutableSchema({
  typeDefs: [
    genericsTypes,
    `      
      type Query {
        getBackups(backupDate: Date): [Backup]
        getBackupLink(backupName: String): String
      }
      
      type Mutation {
        startBackup(backupOptions: StartBackupInput): Backup
      }

      input StartBackupInput {
        withAttachments: Boolean
      }
    `,
  ],
  resolvers: [resolvers],
});
