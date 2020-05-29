import { newTestUser, newOrderItem, newStore, gqlRequest } from './helpers';
import { deleteUserData } from '../services/user';
import { User } from '../models/user';
import { Store } from '../models/store';

describe('User', () => {
  let user1: { user: User; token: string };
  let user2: { user: User; token: string };
  let store1: Store;

  it('cannot create order if not authorized', async () => {
    try {
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) {
              id
            }
          }
        `,
        authToken: 'null',
        variables: {
          order: {
            storeId: store1.id,
            items: [],
          },
        },
      });
      expect(createOrder).toBeUndefined();
    } catch (err) {
      expect(err[0].message).toEqual('You must login first');
    }
  });

  it('can create an order with no items', async () => {
    try {
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) {
              id
              userId
              storeId
              user {
                id
                phone
                email
              }
              store {
                id
              }
              items {
                id
              }
            }
          }
        `,
        authToken: user1.token,
        variables: {
          order: {
            storeId: store1.id,
            items: [],
          },
        },
      });
      expect(createOrder).toBeDefined();
      expect(createOrder.id).toBeDefined();
      expect(createOrder.userId).toEqual(user1.user.id);
      expect(createOrder.storeId).toEqual(store1.id);
      expect(createOrder.items).toEqual([]);
      // can get store data
      expect(createOrder.store.id).toEqual(store1.id);
      // user data returned
      expect(createOrder.user).toBeDefined();
      expect(createOrder.user.id).toEqual(user1.user.id);
      expect(createOrder.user.phone).toEqual(user1.user.phone);
      expect(createOrder.user.email).toEqual(user1.user.email);
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('can create an order with items', async () => {
    try {
      const inventoryItems = [
        {
          changeType: 'add',
          item: newOrderItem(),
        },
        {
          changeType: 'add',
          item: newOrderItem(),
        },
        {
          changeType: 'add',
          item: newOrderItem(),
        },
        {
          changeType: 'add',
          item: newOrderItem(),
        },
      ];
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) {
              id
              userId
              items {
                id
                inventoryId
                quantity
                name
                brand
                units
              }
            }
          }
        `,
        authToken: user1.token,
        variables: {
          order: {
            storeId: store1.id,
            items: inventoryItems,
          },
        },
      });
      expect(createOrder).toBeDefined();
      expect(createOrder.items.length).toEqual(inventoryItems.length);
      expect(createOrder.items[0].brand).toEqual(inventoryItems[0].item.brand);
      expect(createOrder.items[0].inventoryId).toEqual(inventoryItems[0].item.inventoryId);
      expect(createOrder.items[0].quantity).toEqual(inventoryItems[0].item.quantity);
      expect(createOrder.items[0].name).toEqual(inventoryItems[0].item.name);
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('can add items to an order', async () => {
    try {
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) {
              id
              userId
              items {
                id
                inventoryId
                quantity
                name
                brand
                units
              }
            }
          }
        `,
        authToken: user1.token,
        variables: {
          order: {
            storeId: store1.id,
            items: [],
          },
        },
      });
      expect(createOrder).toBeDefined();
      expect(createOrder.items.length).toEqual(0);
      expect(createOrder.id).toBeDefined();

      const inventoryItems = [
        {
          changeType: 'add',
          item: newOrderItem(),
        },
        {
          changeType: 'add',
          item: newOrderItem(),
        },
        {
          changeType: 'add',
          item: newOrderItem(),
        },
        {
          changeType: 'add',
          item: newOrderItem(),
        },
      ];
      const {
        data: { updateOrder, ...rest2 },
      } = await gqlRequest({
        query: `
          mutation updateOrder($orderId: String, $order: UpdateOrderInput) {
            updateOrder(order: $order, orderId: $orderId) {
              id
              userId
              items {
                id
                inventoryId
                quantity
                name
                brand
                units
              }
            }
          }
        `,
        authToken: user1.token,
        variables: {
          orderId: createOrder.id,
          order: {
            id: createOrder.id,
            items: inventoryItems,
          },
        },
      });
      expect(updateOrder).toBeDefined();
      expect(updateOrder.items.length).toEqual(inventoryItems.length);
      const testItem = updateOrder.items.find((item: any) => {
        return item.name === inventoryItems[0].item.name;
      });
      expect(testItem).toBeDefined();
      expect(testItem.brand).toEqual(inventoryItems[0].item.brand);
      expect(testItem.inventoryId).toEqual(inventoryItems[0].item.inventoryId);
      expect(testItem.quantity).toEqual(inventoryItems[0].item.quantity);
      expect(testItem.name).toEqual(inventoryItems[0].item.name);
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('update an order', async () => {
    try {
      const inventoryItems = [
        {
          changeType: 'add',
          item: newOrderItem(),
        },
        {
          changeType: 'add',
          item: newOrderItem(),
        },
        {
          changeType: 'add',
          item: newOrderItem(),
        },
        {
          changeType: 'add',
          item: newOrderItem(),
        },
      ];
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) {
              id
              userId
              comments
              items {
                id
                inventoryId
                quantity
                name
                brand
                units
              }
            }
          }
        `,
        authToken: user1.token,
        variables: {
          order: {
            storeId: store1.id,
            items: inventoryItems,
          },
        },
      });
      const firstComment = 'this is the first comment';
      const {
        data: { updateOrder, ...rest2 },
      } = await gqlRequest({
        query: `
          mutation updateOrder($orderId: String, $order: UpdateOrderInput) {
            updateOrder(order: $order, orderId: $orderId) {
              id
              userId
              comments
              items {
                id
                inventoryId
                quantity
                name
                brand
                units
              }
            }
          }
        `,
        authToken: user1.token,
        variables: {
          orderId: createOrder.id,
          order: {
            id: createOrder.id,
            newComments: [firstComment],
          },
        },
      });
      expect(updateOrder).toBeDefined();
      expect(updateOrder.comments).toBeDefined();
      expect(updateOrder.comments[0]).toEqual(firstComment);
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('can submit an order', async () => {
    try {
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) { id }
          }
        `,
        authToken: user1.token,
        variables: {
          order: {
            storeId: store1.id,
            items: [
              {
                changeType: 'add',
                item: newOrderItem(),
              },
            ],
            comments: ['this is the first comment'],
          },
        },
      });
      const {
        data: { submitOrder },
      } = await gqlRequest({
        query: `
          mutation submitOrder($orderId: String) {
            submitOrder(orderId: $orderId)
          }
        `,
        authToken: user1.token,
        variables: {
          orderId: createOrder.id,
        },
      });
      expect(submitOrder).toBeTruthy();
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  it('cannot submit an order twice', async () => {
    try {
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) { id }
          }
        `,
        authToken: user1.token,
        variables: {
          order: {
            storeId: store1.id,
            items: [
              {
                changeType: 'add',
                item: newOrderItem(),
              },
            ],
            comments: ['this is the first comment'],
          },
        },
      });
      await gqlRequest({
        query: `
          mutation submitOrder($orderId: String) {
            submitOrder(orderId: $orderId)
          }
        `,
        authToken: user1.token,
        variables: {
          orderId: createOrder.id,
        },
      });
      const {
        data: { submitOrder },
      } = await gqlRequest({
        query: `
          mutation submitOrder($orderId: String) {
            submitOrder(orderId: $orderId)
          }
        `,
        authToken: user1.token,
        variables: {
          orderId: createOrder.id,
        },
      });
      expect(submitOrder).toBeFalsy();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err[0].message).toEqual('You have already submitted this order');
    }
  });

  it('cannot submit an order if they are not authorized to', async () => {
    try {
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) { id }
          }
        `,
        authToken: user1.token,
        variables: {
          order: {
            storeId: store1.id,
            items: [
              {
                changeType: 'add',
                item: newOrderItem(),
              },
            ],
            comments: ['this is the first comment'],
          },
        },
      });
      await gqlRequest({
        query: `
          mutation submitOrder($orderId: String) {
            submitOrder(orderId: $orderId)
          }
        `,
        variables: {
          orderId: createOrder.id,
        },
      });
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err[0].message).toEqual('You must login first');
    }
  });

  // if the order is not yours, you cannot get it, so it will say the order doesn't exist.
  it('cannot submit an order if its not yours', async () => {
    try {
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) { id }
          }
        `,
        authToken: user1.token,
        variables: {
          order: {
            storeId: store1.id,
            items: [
              {
                changeType: 'add',
                item: newOrderItem(),
              },
            ],
            comments: ['this is the first comment'],
          },
        },
      });
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
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err[0].message).toEqual('Order does not exist');
    }
  });

  it('cannot update order after submitting one', async () => {
    try {
      const {
        data: { createOrder, ...rest },
      } = await gqlRequest({
        query: `
          mutation createOrder($order: CreateOrderInput) {
            createOrder(order: $order) { id }
          }
        `,
        authToken: user1.token,
        variables: {
          order: {
            storeId: store1.id,
            items: [
              {
                changeType: 'add',
                item: newOrderItem(),
              },
            ],
            comments: ['this is the first comment'],
          },
        },
      });
      const {
        data: { submitOrder },
      } = await gqlRequest({
        query: `
          mutation submitOrder($orderId: String) {
            submitOrder(orderId: $orderId)
          }
        `,
        authToken: user1.token,
        variables: {
          orderId: createOrder.id,
        },
      });
      expect(submitOrder).toBeTruthy();
      const {
        data: { updateOrder, ...rest2 },
      } = await gqlRequest({
        query: `
          mutation updateOrder($orderId: String, $order: UpdateOrderInput) {
            updateOrder(order: $order, orderId: $orderId) {
              id
              comments
              items {
                id
              }
            }
          }
        `,
        authToken: user1.token,
        variables: {
          orderId: createOrder.id,
          order: {
            id: createOrder.id,
            newComments: ['testing'],
          },
        },
      });
      expect(updateOrder).toBeUndefined();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err[0].message).toEqual('Order has been submitted');
    }
  });

  it('can view all orders submitted and open', async () => {
    try {
      const [
        {
          data: { createOrder: order1, ...rest },
        },
        {
          data: { createOrder: order2, ...rest2 },
        },
      ] = await Promise.all([
        gqlRequest({
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
                {
                  changeType: 'add',
                  item: newOrderItem(),
                },
              ],
              comments: ['this is the second order'],
            },
          },
        }),
        gqlRequest({
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
              comments: ['this is the first comment'],
            },
          },
        }),
      ]);
      await gqlRequest({
        query: `
          mutation submitOrder($orderId: String) {
            submitOrder(orderId: $orderId)
          }
        `,
        authToken: user2.token,
        variables: {
          orderId: order1.id,
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
              storeId
              state
              comments
              createdAt
              updatedAt
            }
          }
        `,
        authToken: user2.token,
        variables: {
          search: {
            userId: user2.user.id,
          },
        },
      });

      expect(getOrders).toBeDefined();
      expect(getOrders.length).toEqual(2);
      const gOrder1 = getOrders.find((ord: any) => ord.id === order1.id);
      const gOrder2 = getOrders.find((ord: any) => ord.id === order2.id);
      expect(gOrder2.state).toEqual('open');
      expect(gOrder1.state).toEqual('submitted');
      expect(gOrder1.userId).toBeDefined();
      expect(gOrder1.storeId).toBeDefined();
      expect(gOrder1.comments).toBeDefined();
      expect(gOrder1.createdAt).toBeDefined();
      /**
       * @TODO test that order submission updates updateAt
       */
      expect(gOrder1.updatedAt).toBeDefined();
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });

  /**
   * @TODO I cannot get stores orders if I don't have the privileges
   */

  /**
   * @TODO I cannot get someone elses orders
   */

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

        const {
          data: { createStore: st1 },
        } = await gqlRequest({
          query: `
            mutation createStore($store: StoreInput) {
              createStore(store: $store) {
                id
              }
            }
          `,
          authToken: createAccount2.token,
          variables: {
            store: newStore('user'),
          },
        });
        user1 = createAccount1;
        user2 = createAccount2;
        store1 = st1;
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
