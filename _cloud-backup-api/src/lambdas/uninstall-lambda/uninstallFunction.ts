import { Context, APIGatewayEvent } from 'aws-lambda';
import { setClientStatus, getClientById } from '../../services/client';
import { jwtDecode } from '@services/atlassian-jwt';
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
          "Path": "/api/uninstalled",
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
  const client = await getClientById(clientId);
  const decode = await jwtDecode(jwt.trim(), client.sharedSecret);
  if (decode && decode.iss === client.clientKey) {
    const valid = await setClientStatus(clientId, false);
    return true;
  } else {
    return Promise.reject('You cannot perform that action.');
  }
};
