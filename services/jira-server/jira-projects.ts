import { ServicesBasicCreds, request } from '@util/request';

/**
 * get tempo projects
 * url: /rest/tempo-accounts/1/project
 */
export const getJiraServerProjects = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/2/project`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * get tempo project by id or key
 * url: /rest/tempo-accounts/1/project
 */
export const getJiraServerProject = (credentials: ServicesBasicCreds, id: string | number) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/2/project/${id}`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Get Boards
 * rest/agile/1.0/board/
 */
export const getJiraServerBoards = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/agile/1.0/board/`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
