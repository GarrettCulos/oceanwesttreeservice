import jwt from 'jsonwebtoken';
import { environment } from '@config/environment';

export const jwtSign = (d: { data: any; expiresIn: number }) => {
  const { data, expiresIn } = d;
  return jwt.sign(data, environment.SESSION_SECRET, {
    expiresIn: expiresIn,
  });
};

export const decodeJwtToken = (token: string, withErrors = false): Promise<any> => {
  return new Promise((resolve: Function) => {
    if (token) {
      jwt.verify(token, environment.SESSION_SECRET, (err: any, decoded: any) => {
        if (err) {
          return resolve(withErrors ? err : undefined);
        } else {
          return resolve(decoded);
        }
      });
    } else {
      return resolve();
    }
  });
};

const checkJwtToken = (token: string) => {
  return new Promise((resolve: Function, reject: Function) => {
    if (token) {
      jwt.verify(token, environment.SESSION_SECRET, (err: any, decoded: any) => {
        if (err) {
          return reject({
            status: 401,
            data: err,
            message: 'Failed to authenticate your token',
            source: 'jwt.middleware.service',
          });
        } else {
          return resolve(decoded);
        }
      });
    } else {
      return reject({
        status: 401,
        message: 'Failed to authenticate your token',
        source: 'jwt.middleware.service',
      });
    }
  });
};
export const lambdaDecode = (event: any, context: any) => {
  const token = event.headers && (event.headers['x-access-token'] || event.headers['X-Access-Token']);
  return decodeJwtToken(token);
};

export const lambdaCheck = (event: any, context: any) => {
  const token = context.headers['x-access-token'];
  return checkJwtToken(token);
};
