import { request, ServicesBasicCreds } from '../../util/request';
/**
 * Tempo is installed
 */

/**
 * Get Tempo Configurations
 * /rest/tempo-timesheets/3/private/config/
 */
export const getTempoConfiguration = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-timesheets/3/private/config/`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
