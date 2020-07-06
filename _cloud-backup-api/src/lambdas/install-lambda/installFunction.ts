import { Context, APIGatewayEvent } from 'aws-lambda';
import { createBucket, tagBucket } from '@services/aws-s3';
import { addClient, getClientById, setClientStatus } from '../../services/client';
import { EXPIRES_IN, PROJECT_TAG_KEY } from '../../constants';
import { jwtSign } from '@services/jwt';

export const installFunction = async (
  clientId: string,
  data: { clientKey: string; publicKey: string; sharedSecret: string }
) => {
  try {
    const isClient = await getClientById(clientId);
    if (isClient) {
      await setClientStatus(clientId, true);
    } else {
      // Create s3 bucket for client resources (backups);
      const bucketName = `AtlassianClientCloudBackups-${clientId}`;
      await createBucket({
        Bucket: bucketName,
      });
      // Tag AWS resources created for this project;
      await tagBucket({
        bucketName,
        tags: [
          {
            Key: 'sector',
            Value: PROJECT_TAG_KEY,
          },
          {
            Key: 'clientId',
            Value: clientId,
          },
        ],
      });

      await addClient({
        clientKey: data.clientKey,
        publicKey: data.publicKey,
        sharedSecret: data.sharedSecret,
        id: clientId,
        atlassianHost: clientId,
        email: '',
        bucket: bucketName,
      });
    }

    const client = await getClientById(clientId);
    const token = jwtSign({
      data: client.serialize(),
      expiresIn: EXPIRES_IN,
    });
    console.log({
      token,
      client,
      expiresIn: EXPIRES_IN,
    });
    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const installFunction = async (
  clientId: string,
  data: { clientKey: string; publicKey: string; sharedSecret: string }
) => {
  const isClient = await getClientById(clientId);
  if (isClient) {
    await setClientStatus(clientId, true);
  } else {
    await addClient({
      clientKey: data.clientKey,
      publicKey: data.publicKey,
      sharedSecret: data.sharedSecret,
      id: clientId,
      atlassianHost: clientId,
      email: '',
    });
  }
  return true;
};

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
          "Path": "/api/installed",
          "Method": "post"
        }
      }
    }
  }
})WebpackLanbda@
*/
export const handler = async (event: APIGatewayEvent, context: Context) => {
  try {
    /**
     * Example playload
     * {
        key: 'cloud-backup-utility',
        clientKey: '14c84c8d-9062-366a-8962-0c40f07ef680',
        publicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpahQlmLWRJP9UbupxflPOYgcL42Vlfm0B8+UxK0wWlnL4A03VCiMAWo0+8HOOj7PobUAPmaQT64AyEoeVMqCD2ZmhLp3/JiP9qRhb8CICTl9zm3xNa11TsokvPPPnm7AH/+ZRmTPTKiet9Ld6g2uhtzK2w4X8qBAw1Y2GNhlpVwIDAQAB',
        sharedSecret: '0t7g/Pnf8OejzEEJg7JyHpyNmEJ74ss31IjCtx4qSDbBg1X9zotBLA6uD9dXMtaPZvZeENofXXUdBl9rgHW0rA',
        serverVersion: '100128',
        pluginsVersion: '1001.0.0.SNAPSHOT',
        baseUrl: 'https://h3testing.atlassian.net',
        productType: 'jira',
        description: 'Atlassian JIRA at https://h3testing.atlassian.net ',
        eventType: 'installed'
      }
    */
    const data: any = event.body;
    const clientId = data.baseUrl.data.baseUrl.replace('https://', '');
    await installFunction(clientId, data);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
