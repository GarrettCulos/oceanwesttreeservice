import { ServicesBasicCreds, request } from '@util/request';

/**
 * Get timesheet approvals for a team
 * /rest/tempo-timesheets/4/timesheet-approval(query params)
 * Query Parameter(s): teamId, periodStartDate
 */
export const getTimesheetApprovalsForTeam = (credentials: ServicesBasicCreds, queryParams = '') => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/timesheet-approval${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get timesheet approval for reviewer
 * /rest/tempo-timesheets/4/timesheet-approval/pending
 * Query Parameter(s): reviewerKey
 * https://www.tempo.io/server-api-documentation/timesheets#operation/getTimesheetApprovalsForReviewer_1
 */
export const getTimesheetApprovalPending = (credentials: ServicesBasicCreds, queryParams = '') => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/timesheet-approval/pending${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get all approvals the user is allowed to see for a team in a given period
 * /rest/tempo-timesheets/4/timesheet-approval/log(query params)
 * Query Parameter(s): periodStartDate, teamId
 * https://www.tempo.io/server-api-documentation/timesheets#operation/getTeamApprovalLog_1
 */
export const getTimesheetApprovalLog = (credentials: ServicesBasicCreds, queryParams = '') => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/timesheet-approval/log${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get timesheet approval for specific user
 * /rest/tempo-timesheets/4/timesheet-approval/current(query params)
 * Query Parameter(s): periodStartDate, userKey
 * https://www.tempo.io/server-api-documentation/timesheets#operation/getTimesheetApprovalsForUser_1
 */
export const getUserTimesheetApproval = (credentials: ServicesBasicCreds, queryParams = '') => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/timesheet-approval/current${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get approval statuses for a specific user over multiple periods
 * /rest/tempo-timesheets/4/timesheet-approval/approval-statuses(query params)
 * Query Parameter(s): periodStartDate, userKey, numberOfPeriods
 * https://www.tempo.io/server-api-documentation/timesheets#operation/getTimesheetApprovalsForUserOverMultiplePeriods_2
 */
export const getTimesheetApprovalStatuses = (credentials: ServicesBasicCreds, queryParams = '') => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/timesheet-approval/approval-statuses${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get approval log for a specific user within a time frame
 * /rest/tempo-timesheets/4/timesheet-approval/user/${userKey}/log(query params)
 * Query Parameter(s): from, to
 * https://www.tempo.io/server-api-documentation/timesheets#operation/getUserApprovalLog
 */
export const getUserTimesheetApprovalLog = (credentials: ServicesBasicCreds, userKey: string, queryParams = '') => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/timesheet-approval/user/${userKey}/log${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};

/**
 * Get approval period
 * /rest/tempo-timesheets/5/period/approval(query params)
 * Query Parameter(s): dateFrom, dateTo
 * https://www.tempo.io/server-api-documentation/timesheets#operation/getApprovalPeriods
 */
export const getApprovalPeriod = (credentials: ServicesBasicCreds, queryParams = '') => {
  return request({
    protocol: credentials.protocol,
    method: 'get',
    host: credentials.host,
    port: credentials.port,
    path: `/rest/timesheet-approval${queryParams}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials.basicAuth}`,
    },
  });
};
