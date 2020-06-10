import http from 'http';
import { EXPIRES_IN, CREATE_TOKEN_TYPE } from '../constants';
import { jwtSign } from '@services/jwt';
import uuid from 'uuid';
const LOC = {
  PORT: 4000,
  PATH: '/',
};
// const LOC = {
//   PORT: 8080,
//   PATH: '/graphql'
// }
export const gqlRequest = async (d: {
  query: string;
  variables?: object;
  operationName?: string;
  authToken?: string;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(d);
    const headers: { [s: string]: string } = {};
    if (d.authToken) {
      headers['x-access-token'] = d.authToken;
    }
    const req = http.request(
      {
        hostname: 'localhost',
        port: LOC.PORT,
        method: 'post',
        path: LOC.PATH,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      },
      (res) => {
        res.setEncoding('utf8');
        res.on('data', (d) => {
          const data = JSON.parse(d);
          if (data.errors) {
            reject(data.errors);
            return;
          }
          resolve(data);
        });
      }
    );

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

export const fakeCreateAuthResponse = (email: string) => {
  const token = jwtSign({
    data: {
      type: CREATE_TOKEN_TYPE,
      email: email,
    },
    expiresIn: EXPIRES_IN,
  });
  return {
    token,
    type: CREATE_TOKEN_TYPE,
  };
};

export const newTestUser = (emailType?: string) => {
  const userEmail = `automat-${emailType ? emailType + '-' : ''}${uuid.v1()}@test.com`;
  return {
    token: fakeCreateAuthResponse(userEmail).token,
    email: userEmail,
    phone: 123456789010,
    userName: 'automaton',
    userIcon: '/no-icon',
  };
};

export const newStore = (type?: string) => {
  const storeName = `auto-store-${type ? type + '-' : ''}${uuid.v1()}@test.com`;
  return {
    lat: 12,
    long: 12,
    geoHash: uuid(),
    name: storeName,
    type: 'grocery',
    phone: 12345678910,
    email: 'store@store.com',
    summary: 'test summary',
    hours: {
      monday: [700, 1600],
      tuesday: [700, 1600],
      wednesday: [700, 1600],
      thursday: [700, 1600],
      friday: [700, 1600],
      saturday: [700, 1600],
      sunday: [700, 1600],
    },
  };
};

export const newStoreItem = (stockLevel: string, storeId?: string) => ({
  name: 'candy-bar',
  price: 3.99,
  currency: 'CAD',
  storeId,
  description: 'Home made candy bar',
  stockStatus: stockLevel,
  isPublic: true,
  productSkew: uuid(),
  productUrl: uuid(),
  images: ['/no-images'],
  lowImage: 'asdfa',
});

export const newOrderItem = () => {
  const inventoryId = uuid();
  return { brand: `brand-${inventoryId}`, inventoryId: inventoryId, quantity: 1, name: `item-${inventoryId}` };
};
