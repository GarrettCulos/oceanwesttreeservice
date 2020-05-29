import { ServicesBasicCreds, request } from '@util/request';

/**
 * get tempo accounts customers
 * url /rest/tempo-accounts/1/customer
 */
export const getTempoServerCustomers = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-accounts/1/customer`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
