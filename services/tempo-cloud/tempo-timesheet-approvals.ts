import { request, ServicesBearerCreds } from '@util/request';

/**
 * Submit Timesheet for approvals
 * POST api.tempo.io/core/3/timesheet-approvals/user/{accountId}/submit
 * Query Parameter(s): from, to
 */
interface CloudTimesheet {
  comment: string;
  reviewerAccountId: string;
}
export const createTimesheet = (credentials: ServicesBearerCreds, timesheet: CloudTimesheet, queryParams = '') => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/timesheet-approvals/user/{accountId}/submit${queryParams}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(timesheet)
  );
};

/**
 * Approve Timesheet
 * POST api.tempo.io/core/3/timesheet-approvals/user/{accountId}/approve
 * Query Parameter(s): from, to
 */
interface CloudTimesheetApprovalRejectOrReopen {
  comment: string;
}
export const approveTimesheet = (
  credentials: ServicesBearerCreds,
  timesheetApproved: CloudTimesheetApprovalRejectOrReopen,
  queryParams = ''
) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/timesheet-approvals/user/{accountId}/approve${queryParams}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(timesheetApproved)
  );
};

/**
 * Reject Timesheet
 * POST api.tempo.io/core/3/timesheet-approvals/user/{accountId}/reject
 * Query Parameter(s): from, to
 */
export const rejectTimesheet = (
  credentials: ServicesBearerCreds,
  timesheetRejected: CloudTimesheetApprovalRejectOrReopen,
  queryParams = ''
) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/timesheet-approvals/user/{accountId}/reject${queryParams}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(timesheetRejected)
  );
};

/**
 * Re-open Timesheet
 * POST api.tempo.io/core/3/timesheet-approvals/user/{accountId}/reopen
 * Query Parameter(s): from, to
 */
export const reopenTimesheet = (
  credentials: ServicesBearerCreds,
  timesheetReopened: CloudTimesheetApprovalRejectOrReopen,
  queryParams = ''
) => {
  return request(
    {
      protocol: 'https:',
      method: 'post',
      host: 'api.tempo.io',
      path: `/core/3/timesheet-approvals/user/{accountId}/reopen${queryParams}`,
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    },
    JSON.stringify(timesheetReopened)
  );
};
