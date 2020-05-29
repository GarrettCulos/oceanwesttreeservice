import { request, ServicesBearerCreds } from '@util/request';

/**
 * get tempo categories
 * url: /core/3/account-categories
 */
export const getTempoCloudCategories = (credentials: ServicesBearerCreds) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/account-categories`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Create Category
 * POST api.tempo.io/core/3/account-categories/{key}
 */
interface CloudCategoryCreateBody {
  key: string;
  name: string;
  typeName?: string;
}
export const createCategory = (credentials: ServicesBearerCreds, categoryData: CloudCategoryCreateBody) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/account-categories/`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify(categoryData)
  );
};
