import { Kind, GraphQLScalarType } from 'graphql';

export const getTimeTypeDefs = `
  scalar Date
`;

export const dateResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return new Date(value).getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      // tslint:disable-next-line:no-null-keyword
      return null;
    },
  }),
};
