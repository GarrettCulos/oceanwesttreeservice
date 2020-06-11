import { Context, APIGatewayEvent } from 'aws-lambda';
/*
@WebpackLambda({
  "Properties": {
    "Handler": "uninstallFunction.handler",
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
          "Path": "/api/uninstall",
          "Method": "post"
        }
      }
    }
  }
})
*/
export const handler = (event: APIGatewayEvent, context: Context) => {
  console.log(event, context);
  // disable client, dont delete anything.
  return true;
};
