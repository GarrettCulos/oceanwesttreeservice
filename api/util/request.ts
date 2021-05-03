import http from 'http';
import https from 'https';

export interface ServicesBearerCreds {
  token: string;
}
export interface ServicesBasicCreds {
  protocol: 'http:' | 'https:';
  host: string;
  port?: string | number;
  basicAuth: string;
  token?: string;
}

export const request = (options: http.RequestOptions | https.RequestOptions, data?: string): Promise<any> => {
  return new Promise((resolve, rejects) => {
    const req = (options.protocol === 'https:' ? https : http).request(options, (res) => {
      res.setEncoding('utf8');
      const chunk: string[] = [];
      res.on('data', (d) => {
        chunk.push(d);
      });
      res.on('end', () => {
        let data;
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          data = chunk.length > 0 ? JSON.parse(chunk.join('')) : {};
        } else {
          data = chunk.length > 0 ? chunk.join('') : {};
        }
        console.log({ res });
        console.log({ data });
        if (res.statusCode >= 400) {
          rejects({
            status: res.statusCode,
            message: res.statusMessage,
            data: data,
          });
          return;
        }
        if (res.statusCode >= 200) {
          if (data.errors) {
            rejects({ status: res.statusCode, data: data.errors });
            return;
          }
          resolve(data);
          return;
        }
        rejects();
      });
    });
    if (options.method === 'post' || options.method === 'put') {
      req.write(data);
    }
    req.on('error', (error) => {
      rejects(error);
    });
    req.end();
  });
};

export const resolveError = async <T>(prom: Promise<T>): Promise<{ error: any; response: T }> => {
  try {
    const response = await prom;
    return { error: undefined, response };
  } catch (err) {
    return { error: err, response: undefined };
  }
};
