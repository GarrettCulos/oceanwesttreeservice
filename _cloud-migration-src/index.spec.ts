import { MigrationApi } from '../cloud-migration-src/index';
import { createCsv } from '@util/csv';
import { promises as fsPromises } from 'fs';
import { base64This } from '@util/helpers';
import * as getServerTempoAccounts from '@services/jira-server/tempo-accounts';
import * as getCloudTempoAccounts from '@services/tempo-cloud/tempo-accounts';
import * as serverCategories from '@services/jira-server/tempo-catagories';
import * as cloudCategories from '@services/tempo-cloud/tempo-categories';
import { Account, CloudAccount, Category } from '_types/types';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('sanity checks', () => {
  it('export is valid class', () => {
    const classTest = new MigrationApi({
      cloudTempoCreds: { token: 'string' },
      serverJiraCreds: {
        protocol: 'https:',
        host: 'host',
        basicAuth: 'auth',
      },
      cloudJiraCreds: {
        protocol: 'https:',
        host: 'host',
        basicAuth: 'auth',
      },
    });
    expect(classTest instanceof MigrationApi).toBeTruthy();
  });

  it('createCsv fails with unequal header and body row lengths', async () => {
    const header: string[] = ['header'];
    const body = [['body'], ['body', 'body'], ['body']];
    try {
      let callback;
      jest.spyOn(fsPromises, 'writeFile').mockImplementation((path, data, cb) => {
        callback = cb;
      });
      await createCsv('test.csv', header, body);
      expect('none').toEqual('no');
    } catch (error) {
      expect(error).toEqual(
        Error('Unable to create csv file because there is a row that does not have the correct amount of columns.')
      );
    }
  });

  it('createCsv creates a file with equal length rows', async () => {
    const header: string[] = ['"header"'];
    const body = [['"body"'], ['"body"']];
    let callback;
    jest.spyOn(fsPromises, 'writeFile').mockImplementation((path, data, cb) => {
      callback = cb;
    });
    const bodyStrings: string[] = [];
    const columns = header.join(';');
    body.forEach((row) => {
      bodyStrings.push(row.join(';'));
    });
    const rows = bodyStrings.join('\n');
    const finalText = columns + '\n' + rows + '\n';
    await createCsv('test.csv', header, body);
    expect(fsPromises.writeFile).toBeCalledWith('test.csv', finalText);
  });

  it('createCsv fails making file', async () => {
    const outputFileName = 'test.csv';
    const header: string[] = ['"header"'];
    const body = [['"body"'], ['"body"']];
    jest.spyOn(fsPromises, 'writeFile').mockImplementation(() => Promise.reject());
    try {
      await createCsv(outputFileName, header, body);
      expect('none').toEqual('no');
    } catch (error) {
      expect(error).toEqual(Error());
    }
  });

  it('There is an account to add. Lines in migrateAccounts are applicable and do not error when mocked', async () => {
    const migrationApi = new MigrationApi({
      serverJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudTempoCreds: {
        token: 'token',
      },
    });
    jest.spyOn(migrationApi, 'serverUserHasPermissions').mockImplementation(() => Promise.resolve());
    const getAccounts = jest
      .spyOn(getServerTempoAccounts, 'getTempoAccounts')
      .mockImplementation((path, data, cb) => {
        const callback = cb;
      })
      .mockReturnValue([
        {
          id: 1,
          key: 'key1',
          name: 'Example Accound',
          lead: {
            key: 'JIRAUSER10000',
            username: 'username1',
            name: 'name2',
            active: true,
            emailAddress: 'fakeEmail',
            displayName: 'User Name',
            titleI18nKey: 'tempo-accounts.lead',
          },
          leadAvatar: 'string',
          status: 'CLOSED',
          global: false,
        },
      ]);
    jest
      .spyOn(Promise, 'all')
      .mockRejectedValue(() => Promise.resolve())
      .mockReturnValue([{ results: [] }, { results: [] }, { results: [] }]);
    const getCloudAccounts = jest
      .spyOn(getCloudTempoAccounts, 'getTempoCloudAccounts')
      .mockImplementation((path, data, cb) => {
        const callback = cb;
      })
      .mockReturnValue([{ results: [] }]);
    jest.spyOn(migrationApi, 'checkCloudAccounts').mockImplementation((path, data, cb) => {
      const callback = cb;
    });
    const callCreateAccountCsvData = jest.spyOn(migrationApi, 'createAccountsCSVData').mockReturnValue([]);
    let callback;
    jest.spyOn(fsPromises, 'writeFile').mockImplementation((path, data, cb) => {
      callback = cb;
    });
    try {
      await migrationApi
        .migrateAccounts()
        .then((res) => {
          const resolve = res;
        })
        .catch((err) => {
          const error = err;
        });
    } catch (err) {}

    expect(migrationApi.serverUserHasPermissions).toHaveBeenCalled();
    expect(getAccounts).toHaveBeenCalled();
    expect(getCloudAccounts).toHaveBeenCalled();
    expect(callCreateAccountCsvData).toHaveBeenCalled();

    jest.resetAllMocks();
  });

  it('No accounts to add', async () => {
    const migrationApi = new MigrationApi({
      serverJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudTempoCreds: {
        token: 'token',
      },
    });
    jest.spyOn(migrationApi, 'serverUserHasPermissions').mockImplementation(() => Promise.resolve());
    const getAccounts = jest.spyOn(getServerTempoAccounts, 'getTempoAccounts').mockReturnValue([]);
    jest
      .spyOn(Promise, 'all')
      .mockRejectedValue(() => Promise.resolve())
      .mockReturnValue([
        { results: [] },
        {
          results: [
            {
              id: 1,
              key: 'key1',
              name: 'Example Accound',
              lead: {
                self: 'string',
                accountId: 'JIRAUSER10000',
                displayName: 'User Name',
              },
              leadAvatar: 'string',
              status: 'CLOSED',
              global: false,
            },
          ],
        },
        { results: [] },
      ]);
    const getCloudAccounts = jest.spyOn(getCloudTempoAccounts, 'getTempoCloudAccounts').mockReturnValue([
      {
        id: 1,
        key: 'key1',
        name: 'Example Accound',
        lead: {
          self: 'string',
          accountId: 'JIRAUSER10000',
          displayName: 'User Name',
        },
        leadAvatar: 'string',
        status: 'CLOSED',
        global: false,
      },
    ]);
    jest.spyOn(migrationApi, 'checkCloudAccounts').mockImplementation((path, data, cb) => {
      const callback = cb;
    });
    jest.spyOn(migrationApi, 'compareAccounts').mockReturnValue([]);

    const consoleLog = jest.spyOn(console, 'log').mockReturnValue('Made it to the else statement');

    try {
      await migrationApi
        .migrateAccounts()
        .then((res) => {
          const resolve = res;
        })
        .catch((err) => {
          const error = err;
        });
    } catch (err) {}

    expect(migrationApi.serverUserHasPermissions).toHaveBeenCalled();
    expect(getAccounts).toHaveBeenCalled();
    expect(getCloudAccounts).toHaveBeenCalled();
    expect(migrationApi.compareAccounts).toHaveBeenCalled();
    expect(consoleLog.mock.calls.length).toBe(1);
    expect(consoleLog.mock.calls[0].join('')).toBe('All accounts in Jira Server Tempo are in Jira Cloud Tempo.');
    jest.resetAllMocks();
  });

  it('compareAccounts pass new account', async () => {
    const migrationApi = new MigrationApi({
      serverJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudTempoCreds: {
        token: 'token',
      },
    });
    const serverAccounts: Account[] = [
      {
        id: 1,
        key: 'key1',
        name: 'Example Accound',
        lead: {
          key: 'JIRAUSER10000',
          username: 'username1',
          name: 'name2',
          active: true,
          emailAddress: 'fakeEmail',
          displayName: 'User Name',
          titleI18nKey: 'tempo-accounts.lead',
        },
        leadAvatar: 'string',
        status: 'CLOSED',
        global: false,
      },
    ];
    const cloudAccounts: CloudAccount[] = [];
    const result = await migrationApi.compareAccounts(serverAccounts, cloudAccounts);
    expect(result).toEqual(serverAccounts);
  });

  it('categoryMigration calls properly', async () => {
    const migrationApi = new MigrationApi({
      serverJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudTempoCreds: {
        token: 'token',
      },
    });
    jest.spyOn(migrationApi, 'serverUserHasPermissions').mockImplementation(() => Promise.resolve());
    const tempoServerCategories = jest
      .spyOn(serverCategories, 'getTempoServerCategories')
      .mockImplementation((path, data, cb) => {
        const callback = cb;
      })
      .mockReturnValue([]);
    const tempoCloudCategories = jest
      .spyOn(cloudCategories, 'getTempoCloudCategories')
      .mockImplementation((path, data, cb) => {
        const callback = cb;
      })
      .mockReturnValue([{ results: [] }]);
    jest.spyOn(migrationApi, 'createAllCategories').mockImplementation(() => Promise.resolve());

    try {
      await migrationApi
        .categoryMigration()
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {}

    expect(tempoServerCategories).toHaveBeenCalled();
    expect(tempoCloudCategories).toHaveBeenCalled();
    expect(migrationApi.createAllCategories).toHaveBeenCalled();

    jest.resetAllMocks();
  });

  it('createAllCategories passes', async () => {
    const migrationApi = new MigrationApi({
      serverJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudJiraCreds: {
        protocol: 'https:',
        host: 'exampleHost',
        basicAuth: base64This(`exampleUser:examplePassword`),
      },
      cloudTempoCreds: {
        token: 'token',
      },
    });

    const tempoServerCategories: Category[] = [
      { key: 'Example', id: 1, name: 'Example Name' },
      { key: 'Second', id: 1, name: 'Example Two', categorytype: { name: 'BILLABLE' } },
    ];
    const tempoCloudCategories: Category[] = [{ id: 1, key: 'Cloud', name: 'Instance', type: { name: 'OPERATIONAL' } }];
    jest.spyOn(Array.prototype, 'find').mockReturnValue(undefined);

    jest.spyOn(cloudCategories, 'createCategory').mockImplementation(() => Promise.resolve());
    try {
      await migrationApi
        .createAllCategories(tempoServerCategories, tempoCloudCategories)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {}

    expect(cloudCategories.createCategory).toHaveBeenCalledTimes(2);

    jest.resetAllMocks();
  });
});
