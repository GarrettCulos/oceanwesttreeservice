import { request, ServicesBearerCreds } from '@util/request';

//https://tempo-io.github.io/tempo-api-docs/#teams

/**
 * Retrieve all teams
 * GET api.tempo.io/core/3/teams
 */
export const getTeams = (credentials: ServicesBearerCreds) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/teams`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Create a new team
 * POST api.tempo.io/core/3/teams
 */
interface CloudTeamBody {
  name: string;
  summary?: string;
  leadAccountId?: string;
  programId?: number | string;
}
export const createTeam = (credentials: ServicesBearerCreds, team: CloudTeamBody) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/teams`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify(team)
  );
};

/**
 * Retrieve specific team
 * GET api.tempo.io/core/3/teams/{id}
 */
export const getTeam = (credentials: ServicesBearerCreds, id: string) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/teams/${id}`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Update specific team
 * PUT api.tempo.io/core/3/teams/{id}
 */
export const updateTeam = (credentials: ServicesBearerCreds, id: string, team: CloudTeamBody) => {
  return request(
    {
      protocol: 'https:',
      method: 'put',
      host: 'api.tempo.io',
      path: `/core/3/teams/${id}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(team)
  );
};

/**
 * Retrieve list of team members
 * GET api.tempo.io/core/3/teams/{id}/members
 */
export const getTeamMembers = (credentials: ServicesBearerCreds, id: string | number) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/teams/${id}/members`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Retrieve list of team permissions
 * GET api.tempo.io/core/3/teams/{id}/permissions
 */
export const getTeamPermissions = (credentials: ServicesBearerCreds, id: string) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/teams/${id}/permissions`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Retrieve list of team links
 * GET api.tempo.io/core/3/teams/{id}/links
 */
export const getTeamLinks = (credentials: ServicesBearerCreds, id: string | number) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/teams/${id}/links`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};
