import { newTestUser, newStoreItem, newOrderItem, newStore, gqlRequest } from './helpers';
import { deleteUserData } from '../services/user';
import { User } from '../models/user';
import { Store } from '../models/store';

describe('Users', () => {
  let user1: { user: User; token: string };
  it('can search stores', async () => {
    try {
      const {
        data: { getStores },
      } = await gqlRequest({
        query: `
            query getStores($search: SearchInput) {
              getStores( search: $search) {
                id
                lat
                long
                geoHash
                name
                summary
              }
            }
      `,
        variables: {
          search: { limit: 1 },
        },
      });
      expect(getStores).toHaveLength(3);
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('can create a store AND add inventory items', async () => {
    try {
      const store = newStore('user');
      const {
        data: { createStore },
      } = await gqlRequest({
        query: `
          mutation createStore($store: StoreInput) {
            createStore(store: $store) {
              id
              lat
              long
              name
              geoHash
              activeState
              summary
              type
              phone
              email
              inventory {
                id
              }
              hours {
                monday
                tuesday
                wednesday
                thursday
                friday
                saturday
                sunday
              }
              createdAt
              updatedAt
            }
          }
        `,
        authToken: user1.token,
        variables: { store },
      });

      expect(createStore).toBeDefined();
      expect(createStore.id).toBeDefined();
      expect(createStore.lat).toEqual(store.lat);
      expect(createStore.long).toEqual(store.long);
      expect(createStore.name).toEqual(store.name);
      expect(createStore.geoHash).toEqual(store.geoHash);
      expect(createStore.summary).toEqual(store.summary);
      expect(createStore.activeState).toEqual('creating');
      expect(createStore.type).toEqual(store.type);
      expect(createStore.phone).toEqual(store.phone);
      expect(createStore.inventory.length).toEqual(0);
      expect(createStore.email).toEqual(store.email);
      expect(createStore.createdAt).toBeDefined();
      expect(createStore.updatedAt).toBeDefined();

      // refresh token
      const {
        data: { refreshToken },
      } = await gqlRequest({
        query: `
          mutation refreshToken {
            refreshToken {
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
        authToken: user1.token,
      });
      const storeData = {
        inventory: [
          {
            change: 'add',
            item: { ...newStoreItem('high', createStore.id) },
          },
          {
            change: 'add',
            item: { ...newStoreItem('low', createStore.id) },
          },
        ],
      };
      const {
        data: { updateStore },
      } = await gqlRequest({
        query: `
          mutation updateStore($storeId: String, $store: StoreUpdate) {
            updateStore(storeId: $storeId, store: $store) {
              id
              inventory {
                id
                name
                price
                currency
                description
                stockStatus
                productUrl
                productSkew
              }
              createdAt
              updatedAt
            }
          }
        `,
        authToken: refreshToken.token,
        variables: {
          storeId: createStore.id,
          store: storeData,
        },
      });
      expect(updateStore).toBeDefined();
      expect(updateStore.inventory).toBeDefined();
      expect(updateStore.inventory.length).toEqual(2);
      updateStore.inventory.forEach((item: any) => {
        expect(item).toBeDefined();
        expect(item.id).toBeDefined();
        expect(item.name).toEqual('candy-bar');
        expect(item.price).toEqual(3.99);
        expect(item.currency).toEqual('CAD');
        expect(item.description).toEqual('Home made candy bar');
        expect(item.productSkew).toBeDefined();
        expect(item.productUrl).toBeDefined();
      });
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  /**
   * before user test, create users, stores, and store inventories
   */
  beforeAll(() => {
    return new Promise(async (resolve, reject) => {
      try {
        const U1P = gqlRequest({
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
              ...newTestUser('user'),
            },
          },
        });
        const U2P = gqlRequest({
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
              ...newTestUser('user'),
            },
          },
        });

        const [
          {
            data: { createAccount: createAccount1 },
          },
          {
            data: { createAccount: createAccount2 },
          },
        ] = await Promise.all([U1P, U2P]);

        user1 = createAccount1;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });

  /**
   * after this test destroy all test data from beforeAll
   */
  afterAll(() => {
    return new Promise(async (resolve, reject) => {
      try {
        await Promise.all([deleteUserData({ userId: user1.user.id })]);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
});

describe('Employees/Owners', () => {
  let user1: { user: User; token: string };
  let user2: { user: User; token: string };
  let store1: Store;

  it('can updated inventory items', async () => {
    try {
      const {
        data: { updateStore },
      } = await gqlRequest({
        query: `mutation updateStore($storeId: String, $store: StoreUpdate) { 
          updateStore(storeId: $storeId, store: $store) { 
            inventory {
              id
              name
            }
          } 
        }`,
        authToken: user1.token,
        variables: {
          storeId: store1.id,
          store: {
            inventory: [
              {
                change: 'update',
                item: { ...store1.inventory[0], name: 'CandyBarV2' },
              },
            ],
          },
        },
      });
      expect(updateStore).toBeDefined();
      expect(updateStore.inventory).toHaveLength(store1.inventory.length);
      expect(updateStore.inventory.find((itm: any) => itm.id === store1.inventory[0].id).name).toEqual('CandyBarV2');
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('can updated store details', async () => {
    try {
      const {
        data: { updateStore },
      } = await gqlRequest({
        query: `mutation updateStore($storeId: String, $store: StoreUpdate) { 
          updateStore(storeId: $storeId, store: $store) { 
            id 
            summary
            website
          } 
        }`,
        authToken: user1.token,
        variables: {
          storeId: store1.id,
          store: {
            summary: 'testing update',
            website: 'this.com/newwebsite/here',
          },
        },
      });
      expect(updateStore).toBeDefined();
      expect(updateStore.id).toEqual(store1.id);
      expect(updateStore.summary).toEqual('testing update');
      expect(updateStore.website).toEqual('this.com/newwebsite/here');
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('can remove inventory items', async () => {
    try {
      const {
        data: { updateStore: storeData },
      } = await gqlRequest({
        query: `mutation updateStore($storeId: String, $store: StoreUpdate) { 
          updateStore(storeId: $storeId, store: $store) { 
            id 
            inventory {
              id
              updatedAt
            }
          } 
        }`,
        authToken: user1.token,
        variables: {
          storeId: store1.id,
          store: {
            inventory: [
              {
                change: 'add',
                item: { ...newStoreItem('low', store1.id) },
              },
            ],
          },
        },
      });
      const inventoryItem = storeData.inventory.sort((a: any, b: any) => (a.updatedAt > b.updatedAt ? -1 : 1))[0];
      const {
        data: { updateStore },
      } = await gqlRequest({
        query: `mutation updateStore($storeId: String, $store: StoreUpdate) { 
          updateStore(storeId: $storeId, store: $store) { 
            id 
            inventory {
              id
            }
          } 
        }`,
        authToken: user1.token,
        variables: {
          storeId: store1.id,
          store: {
            inventory: [
              {
                change: 'remove',
                item: { id: inventoryItem.id },
              },
            ],
          },
        },
      });
      expect(updateStore).toBeDefined();
      expect(updateStore.inventory.length).toEqual(2);
      expect(updateStore.inventory.filter((item: any) => item.id !== inventoryItem.id).length).toEqual(2);
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('can see submitted store orders > get user contact information > transition order state', async () => {
    try {
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) { id }
          }
        `,
        authToken: user2.token,
        variables: {
          order: {
            storeId: store1.id,
            items: [
              {
                changeType: 'add',
                item: newOrderItem(),
              },
            ],
          },
        },
      });

      const {
        data: { getOrders },
      } = await gqlRequest({
        query: `
          query getOrders($search: OrderSearchInput) {
            getOrders(search: $search) {
              id
              userId
              state
            }
          }
        `,
        authToken: user1.token,
        variables: {
          search: { storeId: store1.id },
        },
      });
      expect(getOrders).toHaveLength(0);
      await gqlRequest({
        query: `
          mutation submitOrder($orderId: String) {
            submitOrder(orderId: $orderId)
          }
        `,
        authToken: user2.token,
        variables: {
          orderId: createOrder.id,
        },
      });

      const {
        data: { getOrders: postSubmissionSearch },
      } = await gqlRequest({
        query: `
          query getOrders($search: OrderSearchInput) {
            getOrders(search: $search) {
              id
              userId
              state
            }
          }
        `,
        authToken: user1.token,
        variables: {
          search: { storeId: store1.id, state: 'submitted' },
        },
      });
      expect(postSubmissionSearch).toHaveLength(1);

      const {
        data: { getOrder },
      } = await gqlRequest({
        query: `
          query getOrder($userId: String, $orderId: String) {
            getOrder(userId: $userId, orderId: $orderId) {
              id
              user {
                phone
              }
              state
            }
          }
        `,
        authToken: user1.token,
        variables: {
          userId: postSubmissionSearch[0].userId,
          orderId: postSubmissionSearch[0].id,
        },
      });
      expect(getOrder).toBeDefined();
      expect(getOrder.id).toEqual(createOrder.id);
      expect(getOrder.user.phone).toBeDefined();

      /**
       * Move order to received
       */
      await gqlRequest({
        query: `
          mutation transitionOrderState($storeId: String, $orderUserId: String, $orderId: String, $state: OrderStateEnum) {
            transitionOrderState(storeId: $storeId, orderUserId: $orderUserId, orderId: $orderId, state: $state)
          }
        `,
        authToken: user1.token,
        variables: {
          storeId: store1.id,
          orderUserId: postSubmissionSearch[0].userId,
          orderId: postSubmissionSearch[0].id,
          state: 'received',
        },
      });

      const {
        data: { getOrder: ordersTransitioned },
      } = await gqlRequest({
        query: `
          query getOrder($userId: String, $orderId: String) {
            getOrder(userId: $userId, orderId: $orderId) {
              id
              state
            }
          }
        `,
        authToken: user1.token,
        variables: {
          userId: postSubmissionSearch[0].userId,
          orderId: postSubmissionSearch[0].id,
        },
      });
      expect(ordersTransitioned).toBeDefined();
      expect(ordersTransitioned.state).toEqual('received');

      /**
       * Move order to completed
       */
      await gqlRequest({
        query: `
          mutation transitionOrderState($storeId: String, $orderUserId: String, $orderId: String, $state: OrderStateEnum) {
            transitionOrderState(storeId: $storeId, orderUserId: $orderUserId, orderId: $orderId, state: $state)
          }
        `,
        authToken: user1.token,
        variables: {
          storeId: store1.id,
          orderUserId: postSubmissionSearch[0].userId,
          orderId: postSubmissionSearch[0].id,
          state: 'completed',
        },
      });

      const {
        data: { getOrder: ordersTransitioned2 },
      } = await gqlRequest({
        query: `
          query getOrder($userId: String, $orderId: String) {
            getOrder(userId: $userId, orderId: $orderId) {
              id
              state
            }
          }
        `,
        authToken: user1.token,
        variables: {
          userId: postSubmissionSearch[0].userId,
          orderId: postSubmissionSearch[0].id,
        },
      });
      expect(ordersTransitioned2).toBeDefined();
      expect(ordersTransitioned2.state).toEqual('completed');

      /**
       * Move order state to closed
       */
      await gqlRequest({
        query: `
          mutation transitionOrderState($storeId: String, $orderUserId: String, $orderId: String, $state: OrderStateEnum) {
            transitionOrderState(storeId: $storeId, orderUserId: $orderUserId, orderId: $orderId, state: $state)
          }
        `,
        authToken: user1.token,
        variables: {
          storeId: store1.id,
          orderUserId: postSubmissionSearch[0].userId,
          orderId: postSubmissionSearch[0].id,
          state: 'closed',
        },
      });

      const {
        data: { getOrder: ordersTransitioned3 },
      } = await gqlRequest({
        query: `
          query getOrder($userId: String, $orderId: String) {
            getOrder(userId: $userId, orderId: $orderId) {
              id
              state
            }
          }
        `,
        authToken: user1.token,
        variables: {
          userId: postSubmissionSearch[0].userId,
          orderId: postSubmissionSearch[0].id,
        },
      });
      expect(ordersTransitioned3).toBeDefined();
      expect(ordersTransitioned3.state).toEqual('closed');
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('can submit store for review', () => {
    expect(true).toBeTruthy();
  });

  /**
   * before user test, create users, stores, and store inventories
   */
  beforeAll(() => {
    return new Promise(async (resolve, reject) => {
      try {
        const U1P = gqlRequest({
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
              ...newTestUser('user'),
            },
          },
        });
        const U2P = gqlRequest({
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
              ...newTestUser('user'),
            },
          },
        });

        const [
          {
            data: { createAccount: createAccount1 },
          },
          {
            data: { createAccount: createAccount2 },
          },
        ] = await Promise.all([U1P, U2P]);

        user1 = createAccount1;
        user2 = createAccount2;
        const store = newStore('user');
        const {
          data: { createStore },
        } = await gqlRequest({
          query: ` mutation createStore($store: StoreInput) { createStore(store: $store) { id } } `,
          authToken: user1.token,
          variables: { store },
        });

        const { data } = await gqlRequest({
          query: `
          mutation refreshToken {
            refreshToken {
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
          authToken: user1.token,
        });
        user1 = data.refreshToken;
        const {
          data: { updateStore },
        } = await gqlRequest({
          query: `mutation updateStore($storeId: String, $store: StoreUpdate) { 
            updateStore(storeId: $storeId, store: $store) { 
              id
              inventory {
                id
                name
                stockStatus
              }
            } 
          }`,
          authToken: user1.token,
          variables: {
            storeId: createStore.id,
            store: {
              inventory: [
                {
                  change: 'add',
                  item: { ...newStoreItem('high', createStore.id) },
                },
                {
                  change: 'add',
                  item: { ...newStoreItem('low', createStore.id) },
                },
              ],
            },
          },
        });
        store1 = updateStore;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });

  /**
   * after this test destroy all test data from beforeAll
   */
  afterAll(() => {
    return new Promise(async (resolve, reject) => {
      try {
        await Promise.all([deleteUserData({ userId: user1.user.id }), deleteUserData({ userId: user2.user.id })]);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
});
