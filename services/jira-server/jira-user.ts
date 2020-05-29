import { ServicesBasicCreds, request } from '@util/request';

/**
 * get tempo accounts
 * url: /rest/tempo-accounts/1/account
 */
export const searchJiraServerUser = (credentials: ServicesBasicCreds, name: string) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/2/user/search?username=${name}&includeInactive=true`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * get Jira Server user by key
 * url: /rest/api/2/user?key=${key}&includeInactive=true
 */
export const getJiraUser = (credentials: ServicesBasicCreds, key: string) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/2/user?key=${key}&includeInactive=true`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
