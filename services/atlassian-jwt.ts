import * as jwt from 'atlassian-jwt';
import moment from 'moment';

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

export const jwtSign = (requestFor: [string, string], secret: string) => {
  const now = moment().utc();

  // Simple form of [request](https://npmjs.com/package/request) object
  const req: jwt.Request = jwt.fromMethodAndUrl(...requestFor);

  const tokenData = {
    iss: 'issuer-val',
    iat: now.unix(), // The time the token is generated
    exp: now.add(3, 'minutes').unix(), // Token expiry time (recommend 3 minutes after issuing)
    qsh: jwt.createQueryStringHash(req), // [Query String Hash](https://developer.atlassian.com/cloud/jira/platform/understanding-jwt/#a-name-qsh-a-creating-a-query-string-hash)
  };

  return jwt.encode(tokenData, secret);
};
