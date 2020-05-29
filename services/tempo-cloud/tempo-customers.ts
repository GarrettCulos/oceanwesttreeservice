import { request, ServicesBearerCreds } from '@util/request';

/**
 * get tempo customers
 * url: /core/3/customers
 */
export const getTempoCloudCustomers = (credentials: ServicesBearerCreds) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/customers`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Create Customer
 * POST api.tempo.io/core/3/customers
 */
interface CloudCustomerBody {
  key: string;
  name: string;
}
export const createCustomer = (credentials: ServicesBearerCreds, customerData: CloudCustomerBody) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/customers`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify(customerData)
  );
};
