import { request, ServicesBearerCreds } from '@util/request';

//https://tempo-io.github.io/tempo-api-docs/#team_links

/**
 * Create a new team link
 * POST api.tempo.io/core/3/team-links
 */
interface CloudTeamLink {
  teamId: number | string;
  scopeType: string;
  scopeId: number | string;
}
export const createTeamLink = (credentials: ServicesBearerCreds, teamLink: CloudTeamLink) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/team-links`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify(teamLink)
  );
};

/**
 * Retrieve an existing team-link for the given id
 * GET api.tempo.io/core/3/team-links/${id}
 */
export const getTeamLinkById = (credentials: ServicesBearerCreds, id: string) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/team-links/${id}`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};

/**
 * Retrieve team-link by project
 * GET api.tempo.io/core/3/team-links/project/{projectKey}
 */
export const getTeamLinkByProject = (credentials: ServicesBearerCreds, projectKey: string) => {
  return request({
    protocol: 'https:',
    method: 'get',
    host: 'api.tempo.io',
    path: `/core/3/team-links/project/${projectKey}`,
    headers: {
      Authorization: `Bearer ${credentials.token}`,
    },
  });
};
