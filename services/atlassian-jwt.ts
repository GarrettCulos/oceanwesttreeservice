import * as jwt from 'atlassian-jwt';

export const jwtDecode = (token: string, secret: string): Promise<any> => {
  return new Promise((resolve: Function) => {
    try {
      const decode = jwt.decode(token, secret, true);
      return resolve(decode);
    } catch (err) {
      console.log(err);
      return resolve();
    }
  });
};
