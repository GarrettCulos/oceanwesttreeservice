import { ServicesBasicCreds, request, ServicesBearerCreds } from '@util/request';

/**
 * get tempo accounts
 * url: /core/3/accounts
 */
export const getTempoCloudAccounts = (credentials: ServicesBearerCreds, query = '') => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/accounts${query}`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Update Status
 * PUT api.tempo.io/core/3/accounts/{key}
 */
interface CloudAccountUpdateBody {
  key: string;
  name: string;
  status: string;
  leadAccountId: string;
  contactAccountId?: string;
  externalContactName?: string;
  categoryKey?: string;
  customerKey?: string;
  monthlybudget?: number | string;
  global?: boolean;
}
export const updateCloudAccount = (
  credentials: ServicesBearerCreds,
  tempoAccountKey: string,
  accountData: CloudAccountUpdateBody
) => {
  const key = encodeURIComponent(tempoAccountKey);
  return request(
    {
      protocol: 'https:',
      method: 'put',
      host: 'api.tempo.io',
      path: `/core/3/accounts/${key}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify(accountData)
  );
};
