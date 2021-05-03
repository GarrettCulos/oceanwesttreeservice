import { IResolvers } from 'graphql-tools';

export const resolvers: IResolvers = {
  Query: {
    ping: async (root, args, context) => {
      console.log('pong');
      return 'pong';
    },
  },
};
