import { ApolloServer } from 'apollo-server-lambda';
import graphql from 'graphql';

import { schema } from './schemas';
import { decodeJwtToken } from '@services/jwt';

/*
@WebpackLambda({
  "Properties": {
    "Handler": "graphFunction.graphHandler",
    "Policies":[ 
      "AWSLambdaExecute", 
      "AWSLambdaVPCAccessExecutionRole",
      { 
        "DynamoDBCrudPolicy": {
          "TableName" : "*"
        }
      }
    ],
    "Events":{
      "graphql":{
        "Type": "Api",
        "Properties": {
          "Path": "/api/graphql",
          "Method": "post"
        }
      }
    }
  }
})WebpackLanbda@
*/
if (graphql) {
}

const server = new ApolloServer({
  schema,
  context: async ({ event }) => {
    let token = (event && event.headers && event.headers['x-access-token']) || '';
    token = Array.isArray(token) ? token[0] : token;
    const user = await decodeJwtToken(token);
    return { user };
  },
  formatError: (err) => {
    return err;
  },
});
export const graphHandler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});
