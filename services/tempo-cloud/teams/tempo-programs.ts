import { request, ServicesBearerCreds } from '@util/request';

//https://tempo-io.github.io/tempo-api-docs/#programs

/**
 * Retrieve all programs
 * GET api.tempo.io/core/3/programs
 */
export const getPrograms = (credentials: ServicesBearerCreds) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/programs`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Create a new program
 * POST api.tempo.io/core/3/programs
 */
interface CloudProgram {
  name: string;
  managerAccountId: string;
  teamIds: [];
}
export const createProgram = (credentials: ServicesBearerCreds, program: CloudProgram) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/programs`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify(program)
  );
};

/**
 * Retrieve a program
 * GET api.tempo.io/core/3/programs/${id}
 */
export const getProgram = (credentials: ServicesBearerCreds, id: string) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/programs/${id}`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Update a program
 * PUT api.tempo.io/core/3/programs/{id}
 */
export const updateTeamRole = (credentials: ServicesBearerCreds, id: string, program: CloudProgram) => {
  return request(
    {
      protocol: 'https:',
      method: 'put',
      host: 'api.tempo.io',
      path: `/core/3/programs/${id}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(program)
  );
};

/**
 * Retrieve teams associated to this program
 * GET api.tempo.io/core/3/programs/${id}/teams
 */
export const getProgramTeam = (credentials: ServicesBearerCreds, id: string) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/programs/${id}/teams`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};
