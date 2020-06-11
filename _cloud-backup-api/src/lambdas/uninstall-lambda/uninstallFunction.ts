import { Context, APIGatewayEvent } from 'aws-lambda';
import { setClientStatus, getClientById } from '../../services/client';
import { decodeJwtToken } from '@services/jwt';
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

export const handler = async (event: APIGatewayEvent, context: Context) => {
  const data: any = event.body;
  const headers = event.headers;
  const jwt = headers.authorization.replace('JWT ', '');
  const clientId = data.baseUrl.match(/[^https://?|^http://].+/g)[0];
  uninstallFunction(clientId, jwt)
    .then((done) => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};

export const uninstallFunction = async (clientId: string, jwt: string) => {
  try {
    const client = await getClientById(clientId);
    const decode = await decodeJwtToken(jwt, false, client.sharedSecret);
    if (decode) {
      const valid = await setClientStatus(clientId, false);
      return true;
    } else {
      return Promise.reject('You cannot perform that action.');
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
