import { request, ServicesBearerCreds } from '@util/request';

//https://tempo-io.github.io/tempo-api-docs/#team_memberships

/**
 * Create a new membership (team member)
 * POST api.tempo.io/core/3/team-memberships
 */
interface CloudTeamMembership {
  teamId: number | string;
  accountId: string;
  roleId?: number | string;
  commitmentPercent?: number | string;
  from?: string;
  to?: string;
}
export const createTeamMembership = (credentials: ServicesBearerCreds, teamMembership: CloudTeamMembership) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/team-memberships`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify(teamMembership)
  );
};

/**
 * Retrieve an existing membership
 * GET api.tempo.io/core/3/team-memberships/{id}
 */
export const getTeamMembership = (credentials: ServicesBearerCreds, id: string | number) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/team-memberships/${id}`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Update an existing membership
 * PUT api.tempo.io/core/3/team-memberships/{id}
 */
interface CloudTeamMembershipUpdate {
  roleId: number;
  commitmentPercent: number;
  from: string;
  to: string;
}
export const UpdateTeamMembership = (
  credentials: ServicesBearerCreds,
  id: string,
  teamMembership: CloudTeamMembershipUpdate
) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/team-memberships/${id}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(teamMembership)
  );
};
