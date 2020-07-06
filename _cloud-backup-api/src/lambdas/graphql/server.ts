import { ApolloServer } from 'apollo-server-express';

import { schema } from './schemas';
import { decodeJwtToken } from '@services/jwt';

export const gqlExpress = new ApolloServer({
  schema,
  context: async ({ req }) => {
    let token = req.headers['x-access-token'] || '';
    token = Array.isArray(token) ? token[0] : token;
    const client = await decodeJwtToken(token);
    return { client };
  },
  formatError: (err) => {
    return err;
  },
});
