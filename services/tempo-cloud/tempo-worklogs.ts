import { request, ServicesBearerCreds } from '@util/request';
import { TempoWorklogsSearch } from '../jira-server/tempo-worklog';

/**
 * Get worklog attributes
 * GET api.tempo.io/core/3/work-attributes
 */
export const getCloudWorklogAttributes = (credentials: ServicesBearerCreds) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/work-attributes`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * GetWorklog
 * GET api.tempo.io/core/3/worklogs/jira/{jiraWorklogId}
 */
export const getCloudWorklog = (
  credentials: ServicesBearerCreds,
  d: { jiraWorklogId?: string; tempoWorklogId?: string }
) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: d.tempoWorklogId ? `/core/3/worklogs/${d.tempoWorklogId}` : `/core/3/worklogs/jira/${d.jiraWorklogId}`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Update Worklog
 * PUT api.tempo.io/core/3/worklogs/{tempoWorklogId}
 */
interface CloudWorklogUpdateBody {
  issueKey: string;
  timeSpentSeconds: number;
  billableSeconds: number;
  startDate: string;
  startTime: string;
  authorAccountId: string;
  attributes: {
    key: string;
    value: string;
  }[];
  [s: string]: any;
}
export const updateCloudWorklog = (
  credentials: ServicesBearerCreds,
  tempoWorklogId: string,
  worklogData: CloudWorklogUpdateBody
) => {
  return request(
    {
      protocol: 'https:',
      method: 'put',
      host: 'api.tempo.io',
      path: `/core/3/worklogs/${tempoWorklogId}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(worklogData)
  );
};

interface CloudWorklogCreateBody {
  issueKey: string;
  timeSpentSeconds: number;
  billableSeconds?: number;
  remainingEstimateSeconds?: number;
  startDate: string;
  startTime: string;
  description?: string;
  authorAccountId: string;
  attributes?: {
    key: string;
    value: string;
  }[];
}
export const createCloudWorklog = (credentials: ServicesBearerCreds, worklogData: CloudWorklogCreateBody) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/worklogs`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(worklogData)
  );
};

export const getCloudTempoWorklogs = (credentials: ServicesBearerCreds, searchOptions: any) => {
  const names = Object.keys(searchOptions);
  const queryParams = names.reduce(
    (str: string, name: string, index: number) =>
      `${str}${name}=${searchOptions[name]}${index < names.length ? '&' : ''}`,
    ''
  );
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/worklogs?${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

export const deleteCloudWorklog = (credentials: ServicesBearerCreds, worklogId: string) => {
  return request({
    protocol: 'https:',
    method: 'delete',
    host: 'api.tempo.io',
    path: `/core/3/worklogs/${worklogId}`,
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};
