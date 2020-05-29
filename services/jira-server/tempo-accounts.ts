import { ServicesBasicCreds, request } from '@util/request';

/**
 * get tempo accounts
 * url: /rest/tempo-accounts/1/account
 */
export const getTempoAccounts = (credentials: ServicesBasicCreds, includeArchive: boolean) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-accounts/1/account${includeArchive ? '?skipArchived=false' : ''}`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * get tempo accounts links
 * url /rest/tempo-accounts/1/account/{id}/link
 */
export const getTempoAccountLinks = (credentials: ServicesBasicCreds, id: string | number) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-accounts/1/account/${id}/link`,
    headers: {
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
