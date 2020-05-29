import { ServicesBasicCreds, request } from '@util/request';

/**
 * Get Tempo Teams
 * /rest/tempo-teams/2/team
 * Query Parameter(s): expand
 * https://www.tempo.io/server-api-documentation/teams#operation/getTeams_1
 */
export const getTempoTeams = (credentials: ServicesBasicCreds, queryParams = '') => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-teams/2/team${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get Tempo Team
 * /rest/tempo-teams/2/team/{id}
 * https://www.tempo.io/server-api-documentation/teams#operation/getTeam_1
 */
export const getTempoTeam = (credentials: ServicesBasicCreds, id: string) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-teams/2/team/${id}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get all members for multiple team
 * POST /rest/tempo-teams/2/team/members
 * https://www.tempo.io/server-api-documentation/teams#operation/getTeamMembersForMutlipleTeams
 */
interface ServerMultipleTeamMembers {
  ids: string;
  onlyActive: boolean;
}
export const getMultipleTeamMembers = (credentials: ServicesBasicCreds, searchOptions: ServerMultipleTeamMembers) => {
  return request(
    {
      protocol: credentials.protocol,
      method: 'post',
      host: credentials.host,
      port: credentials.port,
      path: `/rest/tempo-teams/2/team/members`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials.basicAuth}`,
      },
    },
    JSON.stringify(searchOptions)
  );
};

/**
 * Get Information on a member of a team
 * /rest/tempo-teams/2/team/{id}/member/{member-id}
 */
export const getTempoTeamMemberData = (credentials: ServicesBasicCreds, id: string, memberId: string) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-teams/2/team/${id}/member/${memberId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get all members of a team
 * /rest/tempo-teams/2/team/{id}/member
 * Query Parameter(s): type, onlyActive
 * https://www.tempo.io/server-api-documentation/teams#operation/getTeamMembers
 */
export const getTempoTeamMembers = (credentials: ServicesBasicCreds, id: string | number, queryParams = '') => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-teams/2/team/${id}/member${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get all roles
 * /rest/tempo-teams/2/role
 * Tempo Server to Cloud migration PDF
 */
export const getTempoTeamRoles = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-teams/2/role`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get Links from a Team
 * /rest/tempo-teams/2/team/${id}/link
 * https://www.tempo.io/server-api-documentation/teams#operation/getTeam_1
 */
export const getTempoTeamLinks = (credentials: ServicesBasicCreds, id: string | number) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-teams/2/team/${id}/link`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get Programs
 * /rest/tempo-teams/2/program
 * https://www.tempo.io/server-api-documentation/teams#operation/getTeam_1
 */
export const getTempoPrograms = (credentials: ServicesBasicCreds) => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/tempo-teams/2/program`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
