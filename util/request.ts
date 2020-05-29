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

export const request = (options: http.RequestOptions, data?: string): Promise<any> => {
  return new Promise((resolve, rejects) => {
    const req = (options.protocol === 'https:' ? https : http).request(options, (res) => {
      res.setEncoding('utf8');
      const chunk: string[] = [];
      res.on('data', (d) => {
        chunk.push(d);
      });
      res.on('end', () => {
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          const data = chunk.length > 0 ? JSON.parse(chunk.join('')) : {};
          if (data.errors) {
            rejects({ status: res.statusCode, data: data.errors });
            return;
          }
          resolve(data);
          return;
        }
        if (res.statusCode >= 400) {
          rejects({
            status: res.statusMessage,
            message: res.statusMessage,
            data: chunk.join(''),
          });
          return;
        }
        if (res.statusCode > 200) {
          resolve();
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
