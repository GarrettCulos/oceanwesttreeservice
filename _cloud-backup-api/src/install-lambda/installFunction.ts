import { Context, APIGatewayEvent } from 'aws-lambda';
/*
@WebpackLambda({
  "Properties": {
    "Handler": "installFunction.handler",
    "Policies":[ 
      "AWSLambdaExecute", 
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
          "Path": "/api/install",
          "Method": "post"
        }
      }
    }
  }
})
*/
export const handler = (event: APIGatewayEvent, context: Context) => {
  console.log(event, context);
  // check client doesn't exist
  // if exists, enable client
  // if not, create new client
};
