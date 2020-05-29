import moment from 'moment';
import async from 'async';

import { ServicesBasicCreds, ServicesBearerCreds } from '@util/request';
import { createCsv } from '@util/csv';

import { getTempoConfiguration } from '@services/jira-server/tempo-config';
import { getUserPermissions } from '@services/jira-server/jira-auth';
import { getWorklogAttributes, getTempoWorklogs } from '@services/jira-server/tempo-worklog';
import { getTempoAccounts, getTempoAccountLinks } from '@services/jira-server/tempo-accounts';
import { getTempoServerCategories } from '@services/jira-server/tempo-catagories';

import {
  getCloudWorklogAttributes,
  getCloudWorklog,
  updateCloudWorklog,
  getCloudTempoWorklogs,
  createCloudWorklog,
  deleteCloudWorklog,
} from '@services/tempo-cloud/tempo-worklogs';
import { getCloudJiraUsers, getAccountIds } from '@services/jira-cloud/jira-user';
import { getTempoCloudAccounts, updateCloudAccount } from '@services/tempo-cloud/tempo-accounts';
import { getTempoCloudCategories, createCategory } from '@services/tempo-cloud/tempo-categories';
import { getJiraCloudProjects, getJiraCloudProject, getJiraCloudBoards } from '@services/jira-cloud/jira-projects';
import { getJiraServerProjects, getJiraServerProject, getJiraServerBoards } from '@services/jira-server/jira-projects';
import { searchJiraServerUser, getJiraUser } from '@services/jira-server/jira-user';
import {
  CloudWorklogAttributes,
  CloudWorklogType,
  ServerWorklogTpeEnum,
  WorklogAttributeType,
  ServerWorklogType,
  Account,
  CloudAccount,
  Category,
  CloudCategoryCreateBody,
  CloudAccountUpdateBody,
  Customers,
  Role,
  Program,
  TeamCloud,
  TeamServer,
  CreateCloudTeam,
  ServerTeamMember,
  CreateCloudTeamMembers,
  ServerTeamLink,
  CreateCloudTeamLink,
  CloudTeamLink,
  CloudBoard,
  ServerBoard,
} from '_types/types';
import { getTempoServerCustomers } from '@services/jira-server/tempo-customer';
import { getTempoCloudCustomers, createCustomer } from '@services/tempo-cloud/tempo-customers';
import {
  getTempoTeamRoles,
  getTempoPrograms,
  getTempoTeams,
  getTempoTeamMembers,
  getTempoTeamLinks,
} from '@services/jira-server/tempo-teams';
import { getRoles, createTeamRole } from '@services/tempo-cloud/teams/team-roles';
import { getPrograms, createProgram } from '@services/tempo-cloud/teams/tempo-programs';
import { getTeams, createTeam, getTeamMembers, getTeamLinks } from '@services/tempo-cloud/teams/tempo-teams';
import { createTeamMembership } from '@services/tempo-cloud/teams/team-membership';
import { createTeamLink } from '@services/tempo-cloud/teams/team-links';

const H3_CLOUD_MIGRATION_ORIGINID_KEY = 'h3-cloud-migration-originId';

export class MigrationApi {
  serverJiraCreds: ServicesBasicCreds;
  cloudJiraCreds: ServicesBasicCreds;
  cloudTempoCreds: ServicesBearerCreds;
  dryRun: boolean;
  forceFullMigration: boolean;
  metrics: any = {};
  errors: any[] = [];
  serverUsers: any = {};

  constructor(init: {
    serverJiraCreds: ServicesBasicCreds;
    cloudTempoCreds: ServicesBearerCreds;
    cloudJiraCreds: ServicesBasicCreds;
    dryRun?: boolean;
    forceFullMigration: boolean;
    manualUserMaping?: { key: string; cloudAccountId: string; accountId: string; errors?: string[] };
  }) {
    if (!init || !init.serverJiraCreds || !init.cloudTempoCreds || !init.cloudJiraCreds) {
      throw `You must provide server & cloud credetials`;
    }
    this.dryRun = init.dryRun === undefined ? true : init.dryRun;
    this.forceFullMigration = init.forceFullMigration === undefined ? false : init.forceFullMigration;
    /**
     * @NiceToHaves
     * give the user the option of mapping specific account keys to cloud accounts     *
     */
    this.serverUsers = init.manualUserMaping || {};
    this.serverJiraCreds = init.serverJiraCreds;
    this.cloudTempoCreds = init.cloudTempoCreds;
    this.cloudJiraCreds = init.cloudJiraCreds;
  }

  private track = (tag: string, type: 'value' | 'set' | 'increment', val?: number) => {
    switch (type) {
      case 'value':
        this.metrics[tag] = val;
      case 'set':
        this.metrics[tag] = val;
      case 'increment':
        if (this.metrics[tag] !== undefined) {
          this.metrics[tag]++;
        } else {
          this.metrics[tag] = 1;
        }
      default:
    }
  };

  private getUserAccountId = async (searchName?: string) => {
    if (this.serverUsers[searchName]) {
      return this.serverUsers[searchName];
    }

    const [{ key, accountId }] = await getAccountIds(this.cloudJiraCreds, { keys: [searchName] });
    if (accountId !== 'unknown') {
      this.serverUsers[searchName] = { key, accountId };
      this.track('cloud-accounts-used', 'increment');
      return this.serverUsers[searchName];
    }

    /**
     * The above api doesnt always return an accountId, we can do better by looking for exact matches in DisplayName from server to cloud.
     */
    const searchResults = await searchJiraServerUser(this.serverJiraCreds, searchName);
    if (searchResults.length >= 1) {
      const [{ key, emailAddress }] = searchResults;
      const cloudUserLog = await getCloudJiraUsers(this.cloudJiraCreds, `query=${emailAddress}`);
      if (cloudUserLog[0]) {
        const [{ accountId: cloudAccountId }] = cloudUserLog;
        this.serverUsers[searchName] = { key, cloudAccountId };
        this.track('cloud-accounts-used', 'increment');
      } else {
        const error = `Could not find user with key ${key}`;
        this.serverUsers[searchName] = { errors: [error] };
        this.errors.push(error);
        this.track('worklog-user-accounts-not-found', 'increment');
      }
    } else {
      const error = `Could not determin unique user with key ${key}`;
      this.serverUsers[searchName] = { errors: [error] };
      this.errors.push(error);
      this.track('worklog-accounts-indistinguishable', 'increment');
    }
    return this.serverUsers[searchName];
  };

  private migrateWorklogsThatHavePreservedWorklogId = async (
    serverWorklogs: ServerWorklogType[],
    cloudWorklogs: CloudWorklogType[]
  ) => {
    const q = async.queue(async (task: any | { worklog: any; attempts: number }, callback: Function) => {
      const worklog = task.attempts ? task.worklog : task;
      const attempts = task.attempts || 1;
      const {
        jiraWorklogId, // this is the servers original id
        issue: { key: cloudIssueKey },
      } = worklog;
      try {
        /**
         * if theres a different in the billable or timeSpent or some worklog attributes perform update
         */
        const serverWorklog = serverWorklogs.find((loo: ServerWorklogType) => loo.originId === jiraWorklogId);
        if (!serverWorklog) {
          throw [{ message: 'Worklog cannot be found' }];
        }

        const { billableSeconds, timeSpentSeconds, attributes } = serverWorklog;
        if (billableSeconds !== timeSpentSeconds || Object.keys(attributes).length > 0) {
          /**
           * get cloud worklog
           */
          const worklogData = {
            issueKey: cloudIssueKey,
            timeSpentSeconds: worklog.timeSpentSeconds,
            startDate: worklog.startDate,
            startTime: worklog.startTime,
            billableSeconds,
            authorAccountId: worklog.author.accountId,
            attributes: Object.keys(attributes).map((attributeKey) => ({
              key: attributes[attributeKey].key,
              value: attributes[attributeKey].value,
            })),
          };

          /**
           * use cloud worklog data to update tempo cloud data;
           */
          if (!this.dryRun) {
            const newCloudWorklog = await updateCloudWorklog(this.cloudTempoCreds, worklog.tempoWorklogId, worklogData);
          }
          this.track('updated-cloud-worklog', 'increment');
        }
      } catch (error) {
        if (error.some((err: { message?: string }) => err.message === 'Worklog cannot be found')) {
          /**
           * drain and finish migration if worklog cannot be found (migration of jira data hasen't been finished yet.)
           */
          console.log(`Tempo data hasn't been migrated yet`);
          q.kill();
          return;
        } else if (attempts < 3) {
          /**
           * generic retry
           */
          console.log(error);
          console.log(`Will try again: count ${attempts}`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
          q.push({ worklog, attempts: attempts + 1 });
        }
      } finally {
        callback();
        return;
      }
    }, 1);
    // assign a callback
    q.drain(function () {
      console.log(`all items have been processed`);
    });

    // assign an error callback
    q.error((err: any, task: any) => {
      console.error(`Migration of ${task.worklog || task.worklog.originalId || task.originalId} failed`);
    });

    q.push(cloudWorklogs);

    // Finish when q is drained.
    try {
      await q.drain();
    } catch (err) {
      throw err;
    }
  };
  private fullTempoWorklogMigration = async () => {
    const { values: cloudProjects, ...rest } = await getJiraCloudProjects(this.cloudJiraCreds);
    const serverProjects = await getJiraServerProjects(this.serverJiraCreds);
    const cloudProjectsToMigrate = cloudProjects.filter((cloudProject: any) =>
      serverProjects.some(
        (serverProject: any) => cloudProject.name === serverProject.name && cloudProject.key === serverProject.key
      )
    );
    // console.log(cloudProjects, rest);
    console.log(
      'migrating these projects',
      cloudProjectsToMigrate.map((project: any) => project.key)
    );
    /**
     * Delete cloud worklogs without key
     */
    // await async.eachSeries(cloudProjectsToMigrate, async (cloudProject: any, callback) => {
    //   try {
    //     const cloudWorklogs = await this.getAllCloudWorklogs({
    //       from: '1900-01-01',
    //       to: moment().format('YYYY-MM-DD'),
    //       limit: 1000,
    //       project: cloudProject.key,
    //     });
    //     const cloudWorklogsWithoutMigrationKeys = cloudWorklogs.results.filter((cwl: CloudWorklogType) => {
    //       // cwl.attributes.values.length > 0 && console.log(cwl.attributes);
    //       return !(
    //         cwl.attributes.values.length > 0 &&
    //         cwl.attributes.values.some((att) => att.key === `_${H3_CLOUD_MIGRATION_ORIGINID_KEY}_`)
    //       );
    //     });
    //     console.log(
    //       `${cloudWorklogsWithoutMigrationKeys.length} of ${cloudWorklogs.results.length} cloudworklogs have the migration saftey check`
    //     );

    //     await async.eachOfLimit(cloudWorklogsWithoutMigrationKeys, 6, async (cwl: CloudWorklogType, key, cb) => {
    //       try {
    //         if (!this.dryRun) {
    //           // console.log('delete jira worklog', cwl.issue.key, cwl.jiraWorklogId)
    //           await deleteCloudWorklog(this.cloudTempoCreds, `${cwl.tempoWorklogId}`);
    //         }
    //         this.track('cloud-worklogs-removed', 'increment');
    //         cb();
    //         return;
    //       } catch (err) {
    //         console.log(err);
    //         this.track('cloud-worklogs-errored', 'increment');
    //         cb();
    //       }
    //     });
    //   } catch (error) {
    //     console.log(error);
    //   } finally {
    //     console.log('DELETION SUMMARY:');
    //     console.log(this.metrics);
    //     console.log('\n');
    //     callback();
    //   }
    // });
    // return;

    await async.eachSeries(cloudProjectsToMigrate, async (cloudProject: any, callback) => {
      try {
        const cloudWorklogs = await this.getAllCloudWorklogs({
          from: '1900-01-01',
          to: moment().format('YYYY-MM-DD'),
          limit: 1000,
          project: cloudProject.key,
        });
        const serverWorklogs = await getTempoWorklogs(this.serverJiraCreds, {
          from: '1900-01-01',
          to: moment().format('YYYY-MM-DD'),
          projectKey: [cloudProject.key],
        });
        const serverToCloudMap: any = {};
        const cloudWorklogsWithMatches = cloudWorklogs.results.filter((cwl: CloudWorklogType) => {
          const cloudMatches = serverWorklogs.filter(
            (swl: ServerWorklogType) =>
              swl.issue.key === cwl.issue.key &&
              // jira worklogs are not trimmed
              cwl.description.trim() === swl.comment.trim() &&
              cwl.timeSpentSeconds === swl.timeSpentSeconds &&
              // were assuming that the swl.started milliseconds is always 000
              new Date(`${cwl.startDate} ${cwl.startTime}`).getTime() === new Date(swl.started).getTime()
            // cwl.author.displayName === swl.worker
          );
          if (cloudMatches.length === 1) {
            serverToCloudMap[cloudMatches[0].originId] = cwl.tempoWorklogId;
            return true;
          } else {
            console.log(
              {
                issueKey: cwl.issue.key,
                description: cwl.description,
                timeSpentSeconds: cwl.timeSpentSeconds,
                startDate: cwl.startDate,
                startTime: cwl.startTime,
              },
              cloudMatches
            );
            return false;
          }
        });
        const worklogsToMigrate = serverWorklogs.filter(
          (wl: ServerWorklogType) =>
            !cloudWorklogs.results.some((cwl: CloudWorklogType) => {
              return (
                cwl.attributes.values.length > 0 &&
                cwl.attributes.values.some(
                  (att) => att.key === `_${H3_CLOUD_MIGRATION_ORIGINID_KEY}_` && att.value === `${wl.originId}`
                )
              );
            })
        );
        console.log(
          `${cloudWorklogsWithMatches.length}/${cloudWorklogs.results.length} cloud worklogs have been matched`
        );
        console.log(
          `${cloudWorklogs.results.length}/${serverWorklogs.length} worklogs have been migrated from server to cloud`
        );
        console.log(`${serverWorklogs.length - worklogsToMigrate.length} worklogs have already been migrated`);
        console.log('\n');
        await async.eachOfLimit(worklogsToMigrate, 3, async (serverWorklog: ServerWorklogType, key, callback) => {
          try {
            // get issue worklogs from server
            const authorAccount = await this.getUserAccountId(serverWorklog.worker);
            if (authorAccount.error) {
              callback();
              return;
            }

            const createUserBody = {
              issueKey: serverWorklog.issue.key,
              timeSpentSeconds: serverWorklog.timeSpentSeconds,
              billableSeconds: serverWorklog.billableSeconds,
              startDate: serverWorklog.started.split(' ')[0],
              startTime: serverWorklog.started.split(' ')[1].replace('.000', ''),
              description: serverWorklog.comment,
              authorAccountId: authorAccount.accountId || 'unknown', //keyUsernameMap[serverWorklog.worker],
              attributes: [
                ...Object.keys(serverWorklog.attributes).map((attributeKey) => ({
                  key: serverWorklog.attributes[attributeKey].key,
                  value: serverWorklog.attributes[attributeKey].value,
                })),
                {
                  key: `_${H3_CLOUD_MIGRATION_ORIGINID_KEY}_`,
                  value: serverWorklog.originId,
                },
              ],
            };
            // match worklogs in serve with those in cloud
            // if not a perfect match, flag for review.
            // transaction the following
            //  - add worklogs to cloud
            //  - remove old worklogs from cloud
            if (!this.dryRun) {
              await createCloudWorklog(this.cloudTempoCreds, createUserBody);
            }
            this.track('cloud-worklogs-created', 'increment');
            if (serverToCloudMap[serverWorklog.originId]) {
              if (!this.dryRun) {
                await deleteCloudWorklog(this.cloudTempoCreds, serverToCloudMap[serverWorklog.originId]);
              }
              this.track('cloud-worklogs-removed', 'increment');
            }
            callback();
          } catch (error) {
            this.track('cloud-worklogs-error', 'increment');
            callback();
            return;
          }
        });
      } catch (error) {
        console.log(error);
      } finally {
        console.log('MIGRATION SUMMARY:');
        console.log(this.metrics);
        console.log('\n');
        callback();
      }
    });

    return;
  };
  serverUserHasPermissions = async (requiredPermissions: string[]) => {
    const userData = await getUserPermissions(this.serverJiraCreds);
    const hasAllPermission = requiredPermissions.reduce((hasPermissions, requiredKey) => {
      if (!userData.permissions[requiredKey] || !userData.permissions[requiredKey].havePermission) {
        console.log(`User missing ${requiredKey}`);
        // if No PROJECT_VIEW_ALL_WORKLOGS permission, you may need to set user project role as Tempo Project Manager
        return false;
      }
      return hasPermissions;
    }, true);
    if (!hasAllPermission) {
      throw `User doesn't have sufficient permissions \nACTION: Update server credentials, or change users permissions`;
    } else {
      console.log(`User has all permissions required`);
    }
  };

  private cloudTempoIsInstalled = async () => {
    const config = await getTempoConfiguration(this.serverJiraCreds);
    const tempoInstalled = Boolean(config);
    if (!tempoInstalled) {
      throw `Tempo not installed on your server, there isn't anything to migrate`;
    } else {
      console.log(`Tempo installed on server`);
    }
  };

  private getCloudWorklogAttributes = async (): Promise<CloudWorklogAttributes[]> => {
    const cloudWorkLogs: {
      errors: any;
      metadata: any;
      results: CloudWorklogAttributes[];
    } = await getCloudWorklogAttributes(this.cloudTempoCreds);
    console.log('Cloud user has required permissions');
    const { errors, metadata, results: cloudAttributes } = cloudWorkLogs;

    if (errors) {
      console.log(`cloud errors`, errors);
    }
    if (cloudAttributes) {
      console.log(`${cloudAttributes.length} Cloud attributes loaded`);
    }
    return cloudAttributes;
  };

  private getAllCloudWorklogs = async (search: any) => {
    let next = '';
    let offset = 0;
    const worklogs: CloudWorklogType[] = [];
    do {
      try {
        const { metadata, results } = await getCloudTempoWorklogs(this.cloudTempoCreds, {
          limit: 1000,
          ...search,
          offset,
        });
        offset = metadata.offset + metadata.limit;
        next = metadata.next;
        worklogs.push(...results);
        next;
      } catch (error) {
        next = null;
      }
    } while (Boolean(next));
    return { metadata: { count: worklogs.length }, results: worklogs };
  };

  migrateWorklogs = async () => {
    try {
      /**
       * check that tempo is installed on both server and cloud
       */
      await this.cloudTempoIsInstalled();

      /**
       * Check that user has the right permissions
       */
      await this.serverUserHasPermissions([
        'GLOBAL_TEMPO_ADMINISTRATOR',
        'GLOBAL_TEMPO_TEAM_ADMINISTRATOR',
        'PROJECT_VIEW_ALL_WORKLOGS',
      ]);

      /**
       * @TODO Check that cloud users has all of the right permissions
       */
      // browse projects
      // view all worklogs
      // edit all worklogs
      // delete all worklogs
      // Log Work for Others.

      /**
       * get cloud worklog attributes
       */
      const cloudAttributes = await this.getCloudWorklogAttributes();

      /**
       * Get server worklog attributes
       */
      const serverAttributes: WorklogAttributeType[] = await getWorklogAttributes(this.serverJiraCreds);

      /**
       * If theres no worklogs on the server then theres no manual steps needed.
       */
      if (serverAttributes.length === 0) {
        console.log(`No tempo worklog attributes are configured. Proceed to automated migration of worklogs`);
      }

      /**
       * Get a list of worklogs that need to be migrated from the server to the cloud
       */
      const serverAttributesToMigrate = [
        { key: `_${H3_CLOUD_MIGRATION_ORIGINID_KEY}_`, name: 'H3_CLOUD_MIGRATION_ORIGINID_KEY' },
        ...serverAttributes,
      ].filter(({ key }) => !cloudAttributes.some((att) => att.key === key));
      if (serverAttributesToMigrate.length > 0) {
        if (serverAttributesToMigrate.length > 100) {
          console.log(
            `Your server instance has ${serverAttributesToMigrate.length} worklog attributes. You may want to contact Tempo with help. Migrating this manually is inefficient.`
          );
        } else {
          console.log(`Add the following worklog attributes to your cloud instance:`);
          console.log(serverAttributesToMigrate.map(({ id, ...att }: any) => ({ ...att })));
        }
        throw `ACTION: MIGRATE WORKLOG ATTRIBUTES`;
      }

      /**
       * Start automated migration of data
       */
      const search = {
        from: '1900-07-04',
        to: moment().format('YYYY-MM-DD'),
      };

      /**
       * getCloudTempoWorlogs a paginated api call, this wont return all the data. so we should redesign to avoid this.
       */
      const { metadata: cloudWorklogsMetadata, results: cloudWorklogs } = await this.getAllCloudWorklogs(search);
      const serverWorklogs = await getTempoWorklogs(this.serverJiraCreds, search);

      /**
       * if the number of worklogs in the cloud doesn't match that of the server, stop migration & throw an error;
       */
      if (!this.forceFullMigration && cloudWorklogsMetadata.count === 0) {
        throw `ERROR: It doesn't look like the worklogs have been migrated to the cloud yet`;
      }
      console.log(`Migrating ${cloudWorklogs.length} worklogs:`);

      /**
       * Fork migration strategy based on the
       *
       * If the cloudWorklogData refernces the correct jiraWorklogId in server, proceed with update strategy,
       * else proceed with delete and post strategy.
       */
      const migrationPreservesWorklogs = cloudWorklogs.every((cloudWorklog: any) => {
        const serverWorklog = serverWorklogs.find(
          (serverWL: ServerWorklogType) => cloudWorklog.jiraWorklogId === serverWL.originId
        );
        if (!serverWorklog) {
          return false;
        }
        return (
          serverWorklog.comment === cloudWorklog.description &&
          serverWorklog.timeSpentSeconds === cloudWorklog.timeSpentSeconds &&
          serverWorklog.issue.key === cloudWorklog.issue.key &&
          (Object.keys(serverWorklog.attributes).length === 0 ||
            Object.keys(serverWorklog.attributes).every((attribute) =>
              cloudWorklog.attributes.values.some(
                (cloudAttribute: any) => cloudAttribute.key === serverWorklog.attributes[attribute].key
              )
            ))
        );
      });
      /**
       * queue for updating worklogs
       */
      if (!this.forceFullMigration && migrationPreservesWorklogs) {
        await this.migrateWorklogsThatHavePreservedWorklogId(serverWorklogs, cloudWorklogs);
      } else {
        await this.fullTempoWorklogMigration();
      }
      console.log('MIGRATION DONE');
      console.log(this.metrics);
      console.log('\n\nErrors\n');
      console.log(this.errors);
    } catch (err) {
      throw err;
    }
  };

  migrateAccounts = async () => {
    try {
      /**
       * Check that user has the right permissions
       */
      await this.serverUserHasPermissions(['GLOBAL_TEMPO_ADMINISTRATOR', 'GLOBAL_TEMPO_ACCOUNT_ADMINISTRATOR']);

      /**
       * Get server tempo accounts
       */
      const serverTempoAccounts = await getTempoAccounts(this.serverJiraCreds, true);

      /**
       * Get cloud tempo accounts
       */
      const tempoCloudAccountsFull = await Promise.all([
        getTempoCloudAccounts(this.cloudTempoCreds, '?status=OPEN'),
        getTempoCloudAccounts(this.cloudTempoCreds, '?status=CLOSED'),
        getTempoCloudAccounts(this.cloudTempoCreds, '?status=ARCHIVED'),
      ]);
      const cloudTempoAccountsResults = [
        ...tempoCloudAccountsFull[0].results,
        ...tempoCloudAccountsFull[1].results,
        ...tempoCloudAccountsFull[2].results,
      ];

      /**
       * Check if there is an account in the cloud that is not in the Server
       */
      await this.checkCloudAccounts(serverTempoAccounts, cloudTempoAccountsResults);

      /**
       * Check account migration.
       * If account is not in Jira Cloud Tempo, it will be added to the csv file.
       * Else, all accounts are in Jira Cloud Tempo, and no csv file will be made.
       */
      const serverAccountsToAdd = await this.compareAccounts(serverTempoAccounts, cloudTempoAccountsResults);

      if (serverAccountsToAdd && serverAccountsToAdd.length > 0) {
        /**
         * Create CSV file
         */
        const outputFileName = 'account.csv';
        const columnNames = [
          'Account Key', //Account Key = Column 0
          'Account Name', //Account Name = Column 1
          'Customer Key', //Customer Key = Column 2
          'Customer Name', //Customer Name = Column 3
          'Contact', //Contact = Column 4
          'Contact Id', //Contact Id = Column 5
          'Category Key', //Category Key = Column 6
          'Category Name', //Category Name = Column 7
          'Account Lead Id', //Account Lead Id = Column 8
          'Account Lead Username', //Account Lead Username = Column 9
          'Account Lead Name', //Account Lead Nam = Column 10
          'JIRA Project Keys', //JIRA Project Keys = Column 11
          'Global Account', //Global Account = Column 12
          'Monthly Budget', //Monthly Budget = Column 13
          'Status', //Status = Column 14
        ];
        const csvRows = await this.createAccountsCSVData(serverAccountsToAdd);
        await createCsv(outputFileName, columnNames, csvRows);
      } else {
        console.log('All accounts in Jira Server Tempo are in Jira Cloud Tempo.');
      }
    } catch (err) {
      throw err;
    }
    /**
     * Update Tempo Accounts Category Type and Status once account.csv has been imported into Jira Cloud's Tempo
     */
  };

  checkCloudAccounts = async (serverAccounts: Account[], cloudAccounts: CloudAccount[]) => {
    if (cloudAccounts && cloudAccounts.length > 0) {
      await async.eachOfLimit(cloudAccounts, 2, async (account, key, callback) => {
        try {
          const accountMatch = serverAccounts.find((item: { key: string }) => item.key === account.key);
          if (!accountMatch) {
            console.log(
              'Account ' +
                account.name +
                ' exists in Jira Cloud Tempo with key ' +
                account.key +
                ', but the account key does not exist in Jira Server Tempo.'
            );
          }
          callback();
          return;
        } catch (err) {
          callback();
          return;
        }
      });
    }
  };

  compareAccounts = async (serverAccounts: Account[], cloudAccounts: CloudAccount[]) => {
    /**
     * By key, check to see if Jira Server Tempo accounts already exist in Jira Cloud Tempo.
     * If cloudAccounts is empty, return all of accounts in serverAccounts
     */
    try {
      if (cloudAccounts || cloudAccounts.length > 0) {
        const newAccounts: Account[] = [];
        await async.eachOfLimit(serverAccounts, 2, async (account, key, callback) => {
          try {
            const accountMatch = cloudAccounts.find((item: { key: string }) => item.key === account.key);
            if (!accountMatch) {
              newAccounts.push(account);
            } else {
              /**
               * If the keys and names of the accounts are the same, check that
               * their customers are the same (if they have a customer)
               * Else the names do not match, so a warning is logged since
               * there is an account with the same key in Server and Cloud
               * Tempos that does not match the same account between them.
               */
              if (accountMatch.name === account.name) {
                if (accountMatch.customer && account.customer) {
                  if (
                    accountMatch.customer.key !== account.customer.key ||
                    accountMatch.customer.name !== account.customer.name
                  ) {
                    console.warn(
                      'Customer ' +
                        accountMatch.customer.name +
                        ' from Jira Cloud Tempo and customer ' +
                        account.customer.name +
                        ' from Jira Server Tempo do not have the same names and key values. ' +
                        'Please correct this in order to correctly migrate accounts.'
                    );
                  }
                }
                /**
                 * If the statuses between accounts are not the same,
                 * warn that migrate statuses should be run.
                 */
                if (account.status !== accountMatch.status) {
                  console.warn(
                    accountMatch.name +
                      ' in Jira Cloud Tempo does not have the correct status relative to the Jira Server Tempo account. ' +
                      'Please run the migrate for statuses to correct this.'
                  );
                }
              } else {
                console.warn(
                  'Account ' +
                    accountMatch.name +
                    ' has the key ' +
                    accountMatch.key +
                    ' however this does not match the Tempo account in Jira Server with the same key. ' +
                    'Account ' +
                    account.name +
                    ' will not be migrated from the Jira Server Tempo accounts.'
                );
              }
            }
            callback();
            return;
          } catch (err) {
            console.error(err);
            callback();
            return;
          }
        });
        return newAccounts;
      } else {
        return serverAccounts;
      }
    } catch (err) {
      return serverAccounts;
    }
  };

  getProjectLinksKeys = async (id: string | number) => {
    /**
     * Get the links belonging to a project
     */
    const linksToProjects = await getTempoAccountLinks(this.serverJiraCreds, id);
    /**
     * Create a string list of the links, seperated by a comma, that will return inside ""
     */
    let linkKeys = '';
    for (const link of linksToProjects) {
      linkKeys = linkKeys + link.key;
      if (link !== linksToProjects[linksToProjects.length - 1]) {
        linkKeys = linkKeys + ',';
      }
    }
    return `"${linkKeys}"`;
  };

  createAccountsCSVData = async (jiraServerTempoAccounts: Account[]) => {
    let csvRowData: string[] = [];
    const csvRows: string[][] = [];
    const warningMap: { [s: string]: string } = {};
    const csvErrormap: { [s: string]: string } = {};
    /**
     * Get all of the information for the accounts and set them as row data, where each item in the array is a different column.
     * Add this row data as an element in the csvRows.
     * If contactId does not exist, but the account's contact section does, then add a warning
     * If there is no cloudAccountId (Account Lead ID) then add an error to throw.
     */
    await async.eachOfLimit(jiraServerTempoAccounts, 3, async (element, key, cb) => {
      try {
        let contactId: string;
        if (element.contact) {
          const contactKeyAndCloudAccountId = await this.getUserAccountId(element.contact.emailAddress);
          contactId = `${contactKeyAndCloudAccountId.cloudAccountId}`;
          if (contactId === 'undefined' || !contactId) {
            contactId = '';
            warningMap[element.contact.name] = `could not find "${element.contact.name}" user in cloud`;
          }
        } else {
          contactId = '';
        }
        let cloudAccountId: string;
        if (element.lead) {
          const keyAndCloudAccountId = await this.getUserAccountId(element.lead.emailAddress);
          cloudAccountId = `${keyAndCloudAccountId.cloudAccountId}`;
          if (cloudAccountId === 'undefined' || !cloudAccountId) {
            csvErrormap[
              element.lead.name
            ] = `Could not map ${element.lead.username}:${element.lead.emailAddress} to a cloud account.`;
            cb();
            return;
          }
        } else {
          cloudAccountId = '';
        }
        const projectLinkKeys = await this.getProjectLinksKeys(element.id);
        const customerKey = element.customer ? element.customer.key : '',
          customerName = element.customer ? element.customer.name : '',
          contactKey = element.contact ? element.contact.key : '',
          categoryKey = element.category ? element.category.key : '',
          categoryName = element.category ? element.category.name : '',
          leadUsername = element.lead ? element.lead.username : '',
          leadDisplayName = element.lead ? element.lead.displayName : '',
          monthlybudget = element.monthlybudget ? element.monthlybudget : '';

        csvRowData = [
          `${element.key}`,
          `${element.name}`,
          `${customerKey}`,
          `${customerName}`,
          `${contactKey}`,
          `${contactId}`,
          `${categoryKey}`,
          `${categoryName}`,
          `${cloudAccountId}`,
          `${leadUsername}`,
          `${leadDisplayName}`,
          `${projectLinkKeys}`,
          `${element.global}`,
          `${monthlybudget}`,
          `${element.status}`,
        ];
        csvRows.push(csvRowData);
        cb();
        return;
      } catch (err) {
        console.log(element);
        console.error(err);
        cb();
        return;
      }
    });
    if (csvRows.length !== jiraServerTempoAccounts.length) {
      this.errors.push(
        `${
          jiraServerTempoAccounts.length - csvRows.length
        } accounts could not be migrated (check contact, lead, and links)`
      );
    }
    if (Object.keys(warningMap).length > 0) {
      console.warn(
        'There are ' +
          Object.keys(warningMap).length +
          ' accounts that require a Contact Id but does not have one viable with the cloud.'
      );
      console.log(warningMap);
    }
    if (Object.keys(csvErrormap).length > 0) {
      console.error(
        'There are ' +
          Object.keys(csvErrormap).length +
          ' accounts that require a Lead Account Id but does not have one viable with the cloud.'
      );
      console.error(csvErrormap);
      this.errors.push(`Please check that the the Jira Cloud instance contains the user(s). Add any missing user.`);
    }

    return csvRows;
  };

  createAllCategories = async (tempoServerCategories: Category[], tempoCloudCategories: Category[]) => {
    let cloudServerMatches = 0;
    const warningMap: { [s: string]: string } = {};
    await async.eachOfLimit(tempoServerCategories, 2, async (catagory, key, callback) => {
      try {
        const alreadyCreated = tempoCloudCategories.find((item: { key: string }) => item.key === catagory.key);
        /**
         * If the category key already exists in the Jira Tempo Cloud, then tell user and move on.
         * Else, create the category.
         */
        if (alreadyCreated) {
          if (alreadyCreated.name === catagory.name && alreadyCreated.key === catagory.key) {
            cloudServerMatches++;
          } else {
            warningMap[catagory.key] = `${catagory.key} is already a key for a cloud category: ${alreadyCreated.name}.`;
          }
        } else {
          let newCloudCatagory: CloudCategoryCreateBody;
          if (catagory.categorytype) {
            const typeName = catagory.categorytype.name.toUpperCase();
            newCloudCatagory = {
              key: catagory.key,
              name: catagory.name,
              typeName: typeName,
            };
          } else {
            newCloudCatagory = {
              key: catagory.key,
              name: catagory.name,
            };
          }
          await createCategory(this.cloudTempoCreds, newCloudCatagory).catch((err) => {
            console.log(err);
          });
        }
        callback();
        return;
      } catch (err) {
        console.log(catagory.key + ' ' + catagory.name);
        console.error(err);
        callback();
        return;
      }
    });
    if (Object.keys(warningMap).length > 0) {
      console.warn(
        'There are ' +
          Object.keys(warningMap).length +
          ' category keys that were found in the cloud but do not match with the server name.'
      );
      console.log(warningMap);
    } else if (tempoServerCategories && cloudServerMatches === tempoServerCategories.length) {
      console.log('All categories from the Jira Server Tempo are already in the Jira Cloud Tempo.');
    }
  };

  categoryMigration = async () => {
    try {
      await this.serverUserHasPermissions(['GLOBAL_TEMPO_ADMINISTRATOR']);
      /**
       * Get tempo categories from server
       */
      const tempoServerCategories = await getTempoServerCategories(this.serverJiraCreds);
      // console.log(tempoServerCategories);

      /**
       * Get a list of the Tempo Cloud Categories
       */
      const tempoCloudCategoriesFull = await getTempoCloudCategories(this.cloudTempoCreds);
      const tempoCloudCategoriesResults = tempoCloudCategoriesFull.results;

      /**
       * Create all categories from Jira Server Tempo
       */
      await this.createAllCategories(tempoServerCategories, tempoCloudCategoriesResults);
    } catch (err) {
      throw err;
    }
  };

  createCustomers = async (tempoServerCustomers: Customers[], tempoCloudCustomers: Customers[]) => {
    let cloudServerMatches = 0;
    const warningMap: { [s: string]: string } = {};
    await async.eachOfLimit(tempoServerCustomers, 2, async (customer, key, callback) => {
      try {
        const alreadyCreated = tempoCloudCustomers.find((item: { key: string }) => item.key === customer.key);
        if (alreadyCreated) {
          if (alreadyCreated.name === customer.name) {
            cloudServerMatches++;
          } else {
            warningMap[customer.key] = `${customer.key} is already a key for a cloud customer: ${alreadyCreated.name}.`;
          }
        } else {
          await createCustomer(this.cloudTempoCreds, { key: customer.key, name: customer.name });
        }
        callback();
        return;
      } catch (err) {
        console.log(customer.key + ' ' + customer.name);
        console.error(err);
        callback();
        return;
      }
    });
    if (Object.keys(warningMap).length > 0) {
      console.warn(
        'There are ' +
          Object.keys(warningMap).length +
          ' customer keys that were found in the cloud but do not match with the server name.'
      );
      console.log(warningMap);
    } else if (tempoServerCustomers && cloudServerMatches === tempoServerCustomers.length) {
      console.log('All customers from the Jira Server Tempo are already in the Jira Cloud Tempo.');
    }
  };

  customerMigration = async () => {
    try {
      await this.serverUserHasPermissions(['GLOBAL_TEMPO_ADMINISTRATOR']);
      /**
       * GEt tempo customers from server
       */
      const tempoServerCustomers: Customers[] = await getTempoServerCustomers(this.serverJiraCreds);

      /**
       * Get tempo customers from cloud
       */
      const tempoCloudCustomersFull = await getTempoCloudCustomers(this.cloudTempoCreds);
      const tempoCloudCustomersResults: Customers[] = tempoCloudCustomersFull.results;

      /**
       * Create new customers
       */
      await this.createCustomers(tempoServerCustomers, tempoCloudCustomersResults);
    } catch (err) {
      throw err;
    }
  };

  updateAccountStatuses = async () => {
    const warningMap: { [s: string]: string } = {};
    try {
      await this.serverUserHasPermissions(['GLOBAL_TEMPO_ADMINISTRATOR', 'GLOBAL_TEMPO_ACCOUNT_ADMINISTRATOR']);
      /**
       * Get tempo server accounts
       */
      const tempoAccounts: Account[] = await getTempoAccounts(this.serverJiraCreds, true);

      /**
       * Get tempo cloud accounts
       */
      const tempoCloudAccountsFull = await Promise.all([
        getTempoCloudAccounts(this.cloudTempoCreds, '?status=OPEN'),
        getTempoCloudAccounts(this.cloudTempoCreds, '?status=CLOSED'),
        getTempoCloudAccounts(this.cloudTempoCreds, '?status=ARCHIVED'),
      ]);
      const tempoCloudAccounts = [
        ...tempoCloudAccountsFull[0].results,
        ...tempoCloudAccountsFull[1].results,
        ...tempoCloudAccountsFull[2].results,
      ];

      /**
       * Update Account Statuses
       */
      let cloudServerMatches = 0;
      await async.eachOfLimit(tempoAccounts, 2, async (account, key, callback) => {
        try {
          const accountToUpdate = tempoCloudAccounts.find((item: { key: string }) => item.key === account.key);
          if (accountToUpdate && accountToUpdate.status !== account.status) {
            const contactId = accountToUpdate.contact ? accountToUpdate.contact.accountId : undefined,
              contactName = accountToUpdate.contact ? accountToUpdate.contact.displayName : undefined,
              categoryKey = accountToUpdate.category ? accountToUpdate.category.key : undefined,
              customerKey = accountToUpdate.customer ? accountToUpdate.customer.key : undefined;
            const statusChange: CloudAccountUpdateBody = {
              key: accountToUpdate.key,
              name: accountToUpdate.name,
              status: account.status,
              leadAccountId: accountToUpdate.lead.accountId,
              contactAccountId: contactId,
              externalContactName: contactName,
              categoryKey: categoryKey,
              customerKey: customerKey,
              monthlybudget: accountToUpdate.monthlybudget || undefined,
              global: accountToUpdate.global || undefined,
            };
            await updateCloudAccount(this.cloudTempoCreds, accountToUpdate.key, statusChange);
          } else if (!accountToUpdate) {
            warningMap[account.key] = `could not find "${account.key}" account key in cloud`;
          } else {
            cloudServerMatches++;
          }
          callback();
          return;
        } catch (err) {
          console.error(err);
          callback();
          return;
        }
      });
      if (cloudServerMatches === tempoAccounts.length) {
        console.log('All account statuses from the Jira Server Tempo are already applied in the Jira Cloud Tempo.');
      }
    } catch (err) {
      throw err;
    }
    /**
     * If there are any accounts in Jira Server Tempo that are not found in the cloud tempo, give a warning about them
     */
    if (Object.keys(warningMap).length > 0) {
      console.warn(
        'There are ' +
          Object.keys(warningMap).length +
          ' account(s) that were found in the server but not in the cloud.'
      );
      console.log(warningMap);
    }
  };

  addRolesToCloud = async (serverRoles: Role[], cloudRoles: Role[]) => {
    let num = 0;
    await async.eachOfLimit(serverRoles, 2, async (role, key, callback) => {
      try {
        const roleMatch = cloudRoles.find((item: { name: string }) => item.name === role.name);
        if (!roleMatch) {
          await createTeamRole(this.cloudTempoCreds, { name: role.name });
        } else {
          num++;
        }
        callback();
        return;
      } catch (err) {
        console.error(err);
        callback();
        return;
      }
    });
    if (num === serverRoles.length) {
      console.log('All roles from the Jira Server Tempo are in the Jira Cloud Tempo.');
    } else {
      console.log(serverRoles.length - num + ' new role(s) added!');
    }
  };

  addProgramsToCloud = async (serverPrograms: Program[], cloudPrograms: Program[]) => {
    const warningMap: { [s: string]: string } = {};
    let num = 0;
    await async.eachOfLimit(serverPrograms, 2, async (program, key, callback) => {
      try {
        const programMatch = cloudPrograms.find((item: { name: string }) => item.name === program.name);
        if (!programMatch) {
          if (program.manager) {
            const encodedUsername = encodeURIComponent(program.manager.displayname);
            const keyAndCloudAccountId = await this.getUserAccountId(encodedUsername);
            const cloudAccountId = `${keyAndCloudAccountId.cloudAccountId}`;
            if (cloudAccountId === 'undefined' || !cloudAccountId) {
              warningMap[
                program.manager.displayname
              ] = `Could not map ${program.manager.displayname} to a cloud account.`;
              callback();
              return;
            }
            await createProgram(this.cloudTempoCreds, {
              name: program.name,
              managerAccountId: cloudAccountId,
              teamIds: [],
            });
          } else {
            await createProgram(this.cloudTempoCreds, {
              name: program.name,
              managerAccountId: '',
              teamIds: [],
            });
          }
        } else {
          num++;
        }
        callback();
        return;
      } catch (err) {
        console.error(err);
        callback();
        return;
      }
    });
    if (Object.keys(warningMap).length > 0) {
      console.warn(
        'There are ' +
          Object.keys(warningMap).length +
          ' programs(s) that were found in the server but not in the cloud.'
      );
      console.log(warningMap);
    } else if (num === serverPrograms.length) {
      console.log('All programs from the Jira Server Tempo are in the Jira Cloud Tempo.');
    }
  };

  addTeamsToCloud = async (
    serverTeams: TeamServer[],
    cloudTeams: TeamCloud[],
    roles: Role[],
    serverBoards: ServerBoard[],
    cloudBoards: CloudBoard[]
  ) => {
    const warningMap: { [s: string]: string } = {};
    let num = 0;
    let programs: Program[] = [];
    /**
     * Try to get a list of programs to match with teams later in the method
     * If getting programs isn't possible, logs that no programs will be attached to cloud teams.
     */
    try {
      const programsFull = await getPrograms(this.cloudTempoCreds);
      programs = programsFull.results;
    } catch (err) {
      console.log('The teams will not migrate with programs attached.');
    }
    await async.eachOfLimit(serverTeams, 2, async (team, key, callback) => {
      try {
        /**
         * If there is not a team with the name in Jira Cloud Tempo, then make one.
         * Else if the summaries differ, then alert that there is already a team with that name
         * Else, add to count of how many teams are already migrated.
         */
        const teamMatch = cloudTeams.find((item: { name: string }) => item.name === team.name);
        if (!teamMatch) {
          let cloudAccountId = '';
          if (team.lead) {
            try {
              /**
               * Get the leadAccountId from the Jira Cloud using the email gathered from the Jira Server User key
               */
              const encodedUsername = encodeURIComponent(team.lead);
              const jiraUser = await getJiraUser(this.serverJiraCreds, encodedUsername);
              const jiraUserEmail = `${jiraUser.emailAddress}`;
              const keyAndCloudAccountId = await this.getUserAccountId(jiraUserEmail);
              cloudAccountId = `${keyAndCloudAccountId.cloudAccountId}`;
              if (cloudAccountId === 'undefined' || !cloudAccountId) {
                cloudAccountId = '';
              }
            } catch (err) {
              console.log('Unable to get the lead id for ' + team.lead);
              cloudAccountId = '';
            }
          }
          /**
           * Get the summary and program id
           */
          const summary = team.summary ? team.summary : undefined;
          const programFound = programs.find((item: { name: string }) => item.name === team.program);
          const programId = programFound ? programFound.id : undefined;
          /**
           * Create a new Tempo Cloud Team.
           * If any of the parts are missing, exclude them from the body.
           */
          const newTeam: CreateCloudTeam =
            summary && cloudAccountId !== '' && programId
              ? {
                  name: team.name,
                  summary: summary,
                  leadAccountId: cloudAccountId,
                  programId: programId,
                }
              : summary && cloudAccountId !== ''
              ? { name: team.name, summary: summary, leadAccountId: cloudAccountId }
              : summary && programId
              ? { name: team.name, summary: summary, programId: programId }
              : cloudAccountId !== '' && programId
              ? { name: team.name, leadAccountId: cloudAccountId, programId: programId }
              : summary
              ? { name: team.name, summary: summary }
              : cloudAccountId !== ''
              ? { name: team.name, leadAccountId: cloudAccountId }
              : programId
              ? { name: team.name, programId: programId }
              : { name: team.name };

          const teamResult: TeamCloud = await createTeam(this.cloudTempoCreds, newTeam);
          /**
           * Add new Team Members
           */
          await this.addTeamMembers(team, teamResult, roles);
          /**
           * Add new Team Links
           */
          await this.addTeamLinks(team, teamResult, serverBoards, cloudBoards);
        } else {
          if (teamMatch.summary && team.summary !== teamMatch.summary) {
            warningMap[
              team.name
            ] = `${team.name} already exists in the cloud account but does not match server account summary.`;
          } else {
            num++;
            /**
             * Check/Add Team Members
             */
            await this.addTeamMembers(team, teamMatch, roles);
            /**
             * Check/Add new Team Links
             */
            await this.addTeamLinks(team, teamMatch, serverBoards, cloudBoards);
          }
        }
        callback();
        return;
      } catch (err) {
        console.error(err);
        callback();
        return;
      }
    });
    if (Object.keys(warningMap).length > 0) {
      console.warn(
        'There are ' + Object.keys(warningMap).length + ' teams(s) that were found in the server but not in the cloud.'
      );
      console.log(warningMap);
    } else if (num === serverTeams.length) {
      console.log('All teams from the Jira Server Tempo are in the Jira Cloud Tempo.');
    }
  };

  addTeamMembers = async (serverTeam: TeamServer, teamResult: TeamCloud, cloudRoles: Role[]) => {
    try {
      /**
       * If there are any team members to add, begin adding them.
       * Else, the team does not exist in the cloud.
       */
      const serverTeamMembers: ServerTeamMember[] = await getTempoTeamMembers(this.serverJiraCreds, serverTeam.id);
      if (teamResult && serverTeamMembers && serverTeamMembers !== []) {
        let num = 0;
        const cloudTeamMembershipsFull = await getTeamMembers(this.cloudTempoCreds, teamResult.id);
        const cloudTeamMembershipsResults = cloudTeamMembershipsFull.results;
        /**
         * Look through each team member.
         * If there is a cloud account (id) that matches the server account, continue. Else, go to next member.
         * If there are already members in a team, check to see if it's the current member and add them if not.
         * Else, there are no previous members to a team, so the member can be added.
         */
        await async.eachOfLimit(serverTeamMembers, 2, async (member, key, cb) => {
          try {
            let cloudAccountId = '';
            if (member.member) {
              const encodedUsername = encodeURIComponent(member.member.displayname);
              const keyAndCloudAccountId = await this.getUserAccountId(encodedUsername);
              cloudAccountId = `${keyAndCloudAccountId.cloudAccountId}`;
            }
            if (!cloudAccountId || cloudAccountId === '' || cloudAccountId === 'undefined') {
              console.log('Unable to find matching user in cloud for server user in team: ' + teamResult.name);
              cb();
              return;
            }
            if (cloudTeamMembershipsResults && cloudTeamMembershipsResults !== []) {
              const teamMemberMatch = cloudTeamMembershipsResults.find(
                (item: { member: { accountId: string } }) => item.member.accountId === cloudAccountId
              );
              if (!teamMemberMatch) {
                await this.addNewTeamMembership(cloudRoles, member, teamResult, cloudAccountId);
              } else {
                num++;
              }
            } else {
              await this.addNewTeamMembership(cloudRoles, member, teamResult, cloudAccountId);
            }
            cb();
            return;
          } catch (err) {
            console.error(err);
            cb();
            return;
          }
        });
        if (num === serverTeamMembers.length) {
          console.log(
            'All team members in Jira Server Tempo are already part of the Jira Cloud Tempo team: ' + teamResult.name
          );
        }
      } else if (!teamResult) {
        console.log(
          'The team members for ' + serverTeam.name + ' were unable to upload to cloud because the team was not there.'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  addNewTeamMembership = async (
    cloudRolesResults: Role[],
    member: ServerTeamMember,
    teamMatch: TeamCloud,
    cloudAccountId: string
  ) => {
    const roleMatch = cloudRolesResults.find((item: { name: string }) => item.name === member.membership.role.name);
    const commitmentPercent = member.membership.availability;
    const from = member.membership.dateFromANSI;
    const to = member.membership.dateToANSI;
    const newTeamMember: CreateCloudTeamMembers =
      from && to
        ? {
            teamId: teamMatch.id,
            accountId: cloudAccountId,
            roleId: roleMatch.id,
            commitmentPercent: commitmentPercent,
            from: from,
            to: to,
          }
        : from
        ? {
            teamId: teamMatch.id,
            accountId: cloudAccountId,
            roleId: roleMatch.id,
            commitmentPercent: commitmentPercent,
            from: from,
          }
        : to
        ? {
            teamId: teamMatch.id,
            accountId: cloudAccountId,
            roleId: roleMatch.id,
            commitmentPercent: commitmentPercent,
            to: to,
          }
        : {
            teamId: teamMatch.id,
            accountId: cloudAccountId,
            roleId: roleMatch.id,
            commitmentPercent: commitmentPercent,
          };
    await createTeamMembership(this.cloudTempoCreds, newTeamMember);
  };

  addTeamLinks = async (
    serverTeam: TeamServer,
    teamResult: TeamCloud,
    serverBoards: ServerBoard[],
    cloudBoards: CloudBoard[]
  ) => {
    try {
      /**
       * If there are links attached to the server team, add them to the cloud team.
       * Else if the team isn't in the cloud, console log which team is missing.
       */
      const serverTeamLink: ServerTeamLink[] = await getTempoTeamLinks(this.serverJiraCreds, serverTeam.id);
      if (teamResult && serverTeamLink && serverTeamLink !== []) {
        let num = 0;
        const cloudTeamLinksFull = await getTeamLinks(this.cloudTempoCreds, teamResult.id);
        const cloudTeamLinksResults: CloudTeamLink[] = cloudTeamLinksFull.results;
        await async.eachOfLimit(serverTeamLink, 2, async (link, key, cb) => {
          try {
            /**
             * If the link is a 'project' scope type, find the matching project id from the cloud and check if it's already linked to the team. Add link if not.
             * Else if the  link scope type is a 'board', then find the matching board key from the cloud and check if it's already linked. If not, add board link.
             * Else, scope type is not a project or board and cannot be added to the cloud team's links.
             */
            if (link.scopeType === 'project') {
              const projectServer = await getJiraServerProject(this.serverJiraCreds, link.scope);
              const projectCloud = await getJiraCloudProject(this.cloudJiraCreds, projectServer.key);
              const teamLinkMatch = cloudTeamLinksResults.find(
                (item: { scope: { id: number | string } }) => `${item.scope.id}` === `${projectCloud.id}`
              );
              if (!teamLinkMatch) {
                const scopeType = link.scopeType.toUpperCase();
                const newTeamLink: CreateCloudTeamLink = {
                  teamId: teamResult.id,
                  scopeType: scopeType,
                  scopeId: projectCloud.id,
                };
                await createTeamLink(this.cloudTempoCreds, newTeamLink);
              } else {
                num++;
              }
            } else if (link.scopeType === 'board') {
              const teamBoardMatchServer = serverBoards.find((item: { id: string | number }) => item.id === link.scope);
              const teamKeyAndBoard = teamBoardMatchServer ? teamBoardMatchServer.name.split(' ') : [''];
              const teamBoardProjectKey = teamKeyAndBoard[0];
              const board = cloudBoards.find(
                (item: { location: { projectKey: string } }) => item.location.projectKey == teamBoardProjectKey
              );
              if (board) {
                const teamLinkMatch = cloudTeamLinksResults.find(
                  (item: { scope: { id: number | string } }) => item.scope.id === board.id
                );
                if (!teamLinkMatch) {
                  const scopeType = link.scopeType.toUpperCase();
                  const newTeamLink: CreateCloudTeamLink = {
                    teamId: teamResult.id,
                    scopeType: scopeType,
                    scopeId: board.id,
                  };
                  await createTeamLink(this.cloudTempoCreds, newTeamLink);
                } else {
                  num++;
                }
              } else {
                console.log('A board in Jira Server does not have a board in Jira Cloud.');
              }
            } else {
              console.log('A link in ' + link.teamName + ' was neither a project or board');
            }
            cb();
            return;
          } catch (err) {
            console.error(err);
            cb();
            return;
          }
        });
        /**
         * If no links were added and all scope types matched project or board, then all links were already in the team.
         */
        if (num === serverTeamLink.length) {
          console.log(
            'All links in Jira Server Tempo team are already part of the Jira Cloud Tempo team: ' + teamResult.name
          );
        }
      } else if (!teamResult) {
        console.log(
          'The team links for ' + serverTeam.name + ' were unable to upload to cloud because the team was not there.'
        );
      }
    } catch (err) {
      throw err;
    }
  };

  migrateRoles = async () => {
    try {
      /**
       * Get Roles from Server
       */
      const serverRoles: Role[] = await getTempoTeamRoles(this.serverJiraCreds);
      // console.log(serverRoles);

      /**
       * Get Roles from Cloud
       */
      const cloudRolesMetadata = await getRoles(this.cloudTempoCreds);
      const cloudRoles: Role[] = cloudRolesMetadata.results;
      // console.log(cloudRoles);

      /**
       * Add new Roles
       */
      await this.addRolesToCloud(serverRoles, cloudRoles);
    } catch (err) {
      throw err;
    }
  };

  migratePrograms = async () => {
    /**
     * Get Programs from Server
     */
    const serverPrograms: Program[] = await getTempoPrograms(this.serverJiraCreds);
    // console.log(serverPrograms);

    /**
     * Get Programs from Cloud
     */
    const cloudProgramsFull = await getPrograms(this.cloudTempoCreds);
    const cloudProgramsResults: Program[] = cloudProgramsFull.results;
    // console.log(cloudProgramsResults);

    /**
     * Add new Programs
     */
    await this.addProgramsToCloud(serverPrograms, cloudProgramsResults);
  };

  migrateTeams = async () => {
    try {
      /**
       * Check that user has the right permissions
       */
      await this.serverUserHasPermissions(['GLOBAL_TEMPO_ADMINISTRATOR', 'GLOBAL_TEMPO_ACCOUNT_ADMINISTRATOR']);

      /**
       * Migrate Roles
       */
      await this.migrateRoles();

      /**
       * Migrate Programs
       */

      await this.migratePrograms();

      /**
       * Get Teams from Server
       */
      const serverTeams: TeamServer[] = await getTempoTeams(this.serverJiraCreds);
      // console.log(serverTeams);

      /**
       * Get Teams from Cloud
       */
      const cloudTeamsFull = await getTeams(this.cloudTempoCreds);
      const cloudTeamsResults: TeamCloud[] = cloudTeamsFull.results;
      // console.log(cloudTeamsResults);

      /**
       * Get all Tempo Cloud Roles (for Team Memberships/Team Members)
       */
      const cloudRolesAll = await getRoles(this.cloudTempoCreds);
      const cloudRoles: Role[] = cloudRolesAll.results;

      /**
       * Get all Jira Server Boards (for Links)
       */
      const serverJiraBoardsFull = await getJiraServerBoards(this.serverJiraCreds);
      const serverJiraBoardsValues: ServerBoard[] = serverJiraBoardsFull.values;

      /**
       * Get all Jira Cloud Boards (for Links)
       */
      const cloudJiraBoardsFull = await getJiraCloudBoards(this.cloudJiraCreds);
      const cloudJiraBoardsValues: CloudBoard[] = cloudJiraBoardsFull.values;
      /**
       * Add new Teams + Team Memberships/Team Members + Links
       */
      await this.addTeamsToCloud(
        serverTeams,
        cloudTeamsResults,
        cloudRoles,
        serverJiraBoardsValues,
        cloudJiraBoardsValues
      );
    } catch (err) {
      throw err;
    }
  };
}
