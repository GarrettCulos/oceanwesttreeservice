import AWS, { CloudWatchEvents, Lambda } from 'aws-sdk';
import { environment } from '@config/environment';

const cwe = new AWS.CloudWatchEvents(environment.aws.cloudWatchEventsConfig);
const lambda = new AWS.Lambda(environment.aws.lambdaConfig);

export const putRule = (params: CloudWatchEvents.PutRuleRequest): Promise<CloudWatchEvents.PutRuleResponse> => {
  return new Promise((resolve, reject) => {
    cwe.putRule(params, (err, data) => {
      if (err) {
        return reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export const deleteRule = (params: CloudWatchEvents.DeleteRuleRequest): Promise<null> => {
  return new Promise((resolve, reject) => {
    cwe.deleteRule(params, (err, data) => {
      if (err) {
        return reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const putTarget = (params: CloudWatchEvents.PutTargetsRequest): Promise<CloudWatchEvents.PutTargetsResponse> => {
  return new Promise((resolve, reject) => {
    cwe.putTargets(params, (err, data) => {
      if (err) {
        return reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
export const getLambdaFunction = (functionName: string): Promise<Lambda.FunctionConfiguration> => {
  return new Promise((resolve, reject) => {
    lambda.listFunctions(
      {
        FunctionVersion: 'ALL',
        MasterRegion: environment.aws.region,
      },
      (err, data) => {
        if (err) {
          return reject(err);
        } else {
          console.log('getlambda functions', data);
          const lambda = data.Functions.find((lambda) => lambda.FunctionName === functionName);
          resolve(lambda);
        }
      }
    );
  });
};
