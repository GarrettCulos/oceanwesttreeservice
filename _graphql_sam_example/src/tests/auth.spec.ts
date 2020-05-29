import { newTestUser, gqlRequest } from './helpers';
import { deleteUserData } from '../services/user';

describe('Unauthenticated User', () => {
  it('create account flow', async () => {
    try {
      // authorize with google or FB spoof this half
      const userData = newTestUser('create');
      expect(userData.token).toBeDefined();
      expect(typeof userData.token).toEqual('string');

      const {
        data: { createAccount },
      } = await gqlRequest({
        query: `
        mutation createAccount($creation: CreationInput) {
          createAccount(creation: $creation) {
            type
            token
            expiresIn
            user {
              id
              userName
              userIcon
              phone
              email
            }
          }
        }
      `,
        variables: {
          creation: {
            ...userData,
          },
        },
      });

      expect(createAccount).toBeDefined();
      expect(createAccount.user.id).toBeDefined();
      expect(createAccount.user.userName).toEqual(userData.userName);
      expect(createAccount.user.userIcon).toEqual(userData.userIcon);
      expect(createAccount.user.phone).toEqual(userData.phone);
      expect(createAccount.user.email).toEqual(userData.email);
      // delete user
      await deleteUserData({ userId: createAccount.user.id });
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  /**
   * @TODO Store owners can add store privileges
   */
});
