import { ServicesBasicCreds, request } from '@util/request';

/**
 * Get Tempo worklogs
 * /rest/tempo-timesheets/4/worklogs/search
 */
export interface TempoWorklogsSearch {
  from: string;
  to: string;
  worker?: string[];
  taskId?: number[];
  taskKey?: string[];
  projectId?: number[];
  projectKey?: string[];
  teamId?: number[];
  roleId?: number[];
  accountId?: number[];
  accountKey?: string[];
  filterId?: number[];
  customerId?: number[];
  categoryId?: number[];
  categoryTypeId?: number[];
  epicKey?: string[];
  locationId?: number[];
  updatedFrom?: string;
  includeSubtasks?: boolean;
  pageNo?: number;
  maxResults?: number;
  offset?: number;
}

export const getTempoWorklogs = (credentials: ServicesBasicCreds, searchOptions: TempoWorklogsSearch) => {
  return request(
    {
      protocol: credentials.protocol,
      method: 'post',
      host: credentials.host,
      port: credentials.port,
      path: `/rest/tempo-timesheets/4/worklogs/search`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials.basicAuth}`,
      },
    },
    JSON.stringify(searchOptions)
  );
};

/**
 * getTempo Worklog Attributes
 * url: /rest/tempo-core/1/work-attribute
 */
export const getWorklogAttributes = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-core/1/work-attribute`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
