import { Context, APIGatewayEvent, Callback } from 'aws-lambda';
import { ApolloServer } from 'apollo-server-lambda';

import { schema } from './schemas';
import { decodeJwtToken } from '@services/jwt';

/**
 * Packages need within lambda but dont get loaded by webpack plugin
 */
import graphql from 'graphql';
import * as xss from 'xss';
if (graphql && xss) {
}

const server = new ApolloServer({
  schema,
  playground: {
    endpoint: 'api/graphql',
  },
  context: async ({ event, context }: any) => {
    let token = (event && event.headers && event.headers['x-access-token']) || '';
    token = Array.isArray(token) ? token[0] : token;
    // const client = await decodeJwtToken(token);
    const client = {};
    return {
      event,
      context,
      client,
    };
  },
  formatError: (err: any) => {
    console.log(err);
    return err;
  },
});
export const handler = (event: APIGatewayEvent, context: Context, callback: Callback) =>
  server.createHandler({
    cors: {
      origin: '*',
      credentials: true,
    },
  })(
    // Event structure doesn't quite work with createHandler for this api event. handle mapping manually.
    { ...event, httpMethod: (event.requestContext as any).http.method },
    context,
    callback
  );
