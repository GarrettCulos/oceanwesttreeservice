import { gqlRequest } from './helpers';
describe('System', () => {
  it('can play ping pong', async () => {
    try {
      const {
        data: { ping },
      } = await gqlRequest({
        query: `
        query {
          ping
        }
      `,
      });
      expect(ping).toEqual('pong');
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });
});
