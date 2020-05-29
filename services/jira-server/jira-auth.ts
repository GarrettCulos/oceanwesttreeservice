import { request, ServicesBasicCreds } from '@util/request';

/**
 * get user Authentication
 * /rest/api/2/mypermissions
 */

export const getUserPermissions = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/api/2/mypermissions`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
