import { request, ServicesBasicCreds } from '@util/request';

/**
 * get user Authentication
 * /rest/api/3/permissions
 */
export const getUserPermissions = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/3/permissions`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
