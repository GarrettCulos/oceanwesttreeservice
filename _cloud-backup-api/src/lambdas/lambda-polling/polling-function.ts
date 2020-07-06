import { Context, ScheduledEvent } from 'aws-lambda';

/*
@WebpackLambda({
    "Properties": {
      "FunctionName": "atlassianCloudBackupPollingFunction",
      "Handler": "polling-function.handler",
      "Policies":[ 
        "AWSLambdaExecute", 
        { 
          "DynamoDBCrudPolicy": {
            "TableName" : "*"
          }
        }
      ]
    }
  })WebpackLanbda@
*/
export const handler = async (event: ScheduledEvent, context: Context) => {
  try {
    /*
     * TODO fill out this function with the coresponding util/service calls.
     */

    // get client data from clientID
    // sign jwt
    // check status

    // if complete,
    //      - trigger download,
    //      - update dynamodb record,
    //      - remove cloudWatchEvent and Target,
    // if not, do nothing
    console.log(event);
    console.log(context);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
