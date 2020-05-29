import { request, ServicesBearerCreds } from '@util/request';

//https://tempo-io.github.io/tempo-api-docs/#roles

/**
 * Retrieve all roles
 * GET api.tempo.io/core/3/roles
 */
export const getRoles = (credentials: ServicesBearerCreds) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/roles`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Create a new role
 * POST api.tempo.io/core/3/roles
 */
interface CloudTeamRole {
  name: string;
}
export const createTeamRole = (credentials: ServicesBearerCreds, teamRole: CloudTeamRole) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/roles`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify(teamRole)
  );
};

/**
 * Retrieve a role
 * GET api.tempo.io/core/3/roles/${id}
 */
export const getRole = (credentials: ServicesBearerCreds, id: string) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/roles/${id}`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Update a role
 * PUT api.tempo.io/core/3/roles/{id}
 */
export const updateTeamRole = (credentials: ServicesBearerCreds, id: string, teamRole: CloudTeamRole) => {
  return request(
    {
      protocol: 'https:',
      method: 'put',
      host: 'api.tempo.io',
      path: `/core/3/roles/${id}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(teamRole)
  );
};
