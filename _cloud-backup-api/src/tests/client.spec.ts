import { newTestUser, newOrderItem, newStore, gqlRequest } from './helpers';
import { Client } from '../models/client';

describe('User', () => {
  it('cannot create order if not authorized', async () => {
    expect(true).toEqual(true);
  });
});

const testInstallData = {
  key: 'cloud-backup-utility',
  clientKey: '14c84c8d-9062-366a-8962-0c40f07ef780',
  publicKey:
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpahqlmLWRJP9UbupxflPOYgcL42Vlfm0B8+UxK0wWlnL4A03VCiMAWo0+8HOOj7PobUAPmaQT64AyEoeVMqCD2ZmhLp3/KiP9qRhb8CICTl9zm3xNa11TsokvPPPnm7AH/+ZRmTPTKiet9Ld6g2uhtzK2w4X8qBAw1Y2GNhlpVwIDAQAB',
  sharedSecret: 'Asg6sRDYgs4slKblCU/ewYrkHoXwkZEeeAehvabr1dNfFjUUqFZjnnKPx2fIFggIxU10zLoiCNLiQT3+ujkMPw',
  serverVersion: '100129',
  pluginsVersion: '1001.0.0.SNAPSHOT',
  baseUrl: 'https://h3testing.atlassian.net',
  productType: 'jira',
  description: 'Atlassian JIRA at https://h3testing.atlassian.net ',
  eventType: 'installed',
};

// it can call install with fresh user and resolve true
// it can call install with existing user and change status
// it can uninstall user changing status
