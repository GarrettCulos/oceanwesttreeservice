import AWS, { CloudWatchEvents, Lambda, EventBridge } from 'aws-sdk';
import { environment } from '@config/environment';

const cwe = new AWS.CloudWatchEvents(environment.aws.cloudWatchEventsConfig);
const lambda = new AWS.Lambda(environment.aws.lambdaConfig);
const eventBridge = new EventBridge();

export const putEventBridgeRule = (params: EventBridge.PutRuleRequest) => eventBridge.putRule(params).promise();
export const deleteEventBridgeRule = (params: EventBridge.DeleteRuleRequest) =>
  eventBridge.deleteRule(params).promise();
export const putEventBridgeTarget = (params: EventBridge.PutTargetsRequest) => eventBridge.putTargets(params).promise();
export const removeEventBridgeTarget = (params: EventBridge.RemoveTargetsRequest) =>
  eventBridge.removeTargets(params).promise();
export const addLambdaPermissions = (params: Lambda.AddPermissionRequest) => lambda.addPermission(params).promise();
export const removeLambdaPermissions = (params: Lambda.RemovePermissionRequest) =>
  lambda.removePermission(params).promise();
export const getLambdaFunction = (functionName: string): Promise<Lambda.FunctionConfiguration> => {
  return new Promise((resolve, reject) => {
    lambda.getFunction(
      {
        FunctionName: functionName,
      },
      (err, data) => {
        if (err) {
          return reject(err);
        } else {
          console.log('getlambda functions', data);
          resolve(data.Configuration);
        }
      }
    );
  });
};
