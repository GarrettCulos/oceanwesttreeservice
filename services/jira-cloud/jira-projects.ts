import { ServicesBasicCreds, request } from '@util/request';

/**
 * get tempo projects
 * url: /rest/api/3/project/search
 */
export const getJiraCloudProjects = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/3/project/search`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * get project by id or key
 * url: /rest/api/3/project/{id}
 */
export const getJiraCloudProject = (credentials: ServicesBasicCreds, id: string | number) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/3/project/${id}`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

export const getJiraCloudProjectIssue = (credentials: ServicesBasicCreds, projectKey: string) => {
  return request(
    {
      protocol: credentials.protocol,
      method: 'post',
      host: credentials.host,
      port: credentials.port,
      path: `/rest/api/3/search`,
      headers: {
        Authorization: `Basic ${credentials.basicAuth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify({
      jql: `project = ${projectKey}`,
      maxResults: 1000,
      startAt: 0,
    })
  );
};

/**
 * get board
 * url: /rest/agile/1.0/board
 */
export const getJiraCloudBoards = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/agile/1.0/board`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
