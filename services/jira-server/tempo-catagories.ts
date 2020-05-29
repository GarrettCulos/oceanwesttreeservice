import { ServicesBasicCreds, request } from '@util/request';

/**
 * get tempo accounts categories
 * url /rest/tempo-accounts/1/category
 */
export const getTempoServerCategories = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-accounts/1/category`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
