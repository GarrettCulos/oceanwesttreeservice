import { request, ServicesBasicCreds } from '@util/request';

/**
 * Get worklog attributes
 * GET api.tempo.io/core/3/work-attributes
 */
export const getCloudJiraUsers = (credentials: ServicesBasicCreds, query?: string) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/3/user/search?${query ? query : ''}`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

export const getAccountIds = (credentials: ServicesBasicCreds, d: { keys?: string[]; usernames?: string[] }) => {
  const queryString = d.keys ? `key=${d.keys.join('&key=')}` : `usernames=${d.usernames.join('&usernames=')}`;
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/3/user/bulk/migration?maxResults=1000&${queryString}`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
