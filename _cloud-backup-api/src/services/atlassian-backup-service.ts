import https from 'https';
import { pipeline } from 'stream';
import { s3PutObject, getSignedDownload } from '@services/aws-s3';
import { jwtSign } from '@services/atlassian-jwt';
import { putRule, putTarget, getLambdaFunction } from '@services/aws-cloud-watch';
import { request } from '@util/request';
import { PROJECT_TAG_KEY, POLLING_LAMBDA_FUNCTION_NAME } from '../constants';
import { Client } from '../models/client';
/**
 * Start atlassian backup
 * call `/rest/backup/1/export/runbackup`
 * create cloudWatch event for export task
 */
export const startBackup = (client: Client, includeAttachements: boolean) => {
  // basic auth email:apiToken -> move to oath based method
  const path = `/rest/backup/1/export/runbackup`;
  const method = 'post';
  const jwtToken = jwtSign([method, path], client.sharedSecret);
  console.log(client.atlassianHost, path, jwtToken);
  return request(
    {
      protocol: 'https:',
      host: client.atlassianHost,
      path,
      method,
      headers: { Authorization: `JWT ${jwtToken}` },
    },
    JSON.stringify({
      cbAttachments: includeAttachements,
    })
  );
};

/**
 * Check atlassian backup status
 * `/rest/backup/1/export/getProgress?taskId=${TASK_ID}`
 */
export const checkBackup = (client: Client, taskId: string) => {
  const path = `/rest/backup/1/export/getProgress`;
  const method = 'get';
  const jwtToken = jwtSign([method, path], client.sharedSecret);
  return request({
    protocol: 'https:',
    host: client.atlassianHost,
    path: `${path}?taskId=${taskId}`,
    method: 'get',
    headers: { Authorization: `JWT ${jwtToken}` },
  });
};

/**
 * Download Atlassian Backup
 */
export const transferCompletedDownload = (client: Client, backupFileName: string, doneCallback: (err) => void) => {
  const path = `/plugins/servlet/${backupFileName}`;
  const method = 'get';
  const jwtToken = jwtSign([method, path], client.sharedSecret);

  const s3Stream = s3PutObject({ Bucket: client.bucket, Key: backupFileName }).createReadStream();
  https.request(
    {
      method,
      path,
      host: client.atlassianHost,
      headers: {
        Authorization: `JWT ${jwtToken}`,
      },
    },
    (getFileScream) => {
      pipeline(getFileScream, s3Stream, doneCallback);
    }
  );
};

export const initiateBackupPolling = async (client: Client, taskId: string) => {
  const clientId = client.id;
  const ruleName = `backupPolling-${clientId}-${taskId}`;
  await putRule({
    Name: ruleName,
    ScheduleExpression: `rate(1 minutes)`,
    Tags: [
      {
        Key: 'sector',
        Value: PROJECT_TAG_KEY,
      },
      {
        Key: 'clientId',
        Value: clientId,
      },
      {
        Key: 'taskId',
        Value: taskId,
      },
    ],
    Description: `Poll for atlassian jira cloud backup status for client ${client.atlassianHost}`,
  });
  const lambda = await getLambdaFunction(POLLING_LAMBDA_FUNCTION_NAME);
  console.log(lambda);
  await putTarget({
    Rule: ruleName,
    Targets: [
      {
        Id: 1,
        Arn: lambda.FunctionArn,
        Input: JSON.stringify({
          clientId,
          taskId,
        }),
      },
    ],
  });
};

export const getBackupDownloadLink = (bucket: string, name: string) => {
  return getSignedDownload({ Bucket: bucket, Key: name, Expires: 600 });
};
