import { Observable } from 'rxjs';
// eslint-disable-next-line no-unused-vars
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AP from './ap';

interface RequestLibConfig {
  headers?: Headers;
  baseUrl?: string;
}

interface AppRequest {
  path?: string;
  url?: string;
  data?: any;
  headers?: { [s: string]: string};
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

class RequestLib {
  private _config: RequestLibConfig;
  constructor(config: RequestLibConfig) {
    this._config = config;
    if (!this._config.baseUrl) {
      this._config.baseUrl = '';
    }
  }

  private joinHeaders(headers: Headers[]): Headers {
    const h = new Headers();
    headers.forEach(header => {
      header.forEach((value: string, key: string) => {
        if (h.has(key)) {
          h.append(key, value);
        } else {
          h.set(key, value);
        }
      });
    });
    return h;
  }

  request<T>(req: AppRequest): Promise<T> {
    const url = req.url || (req.path && `${this._config.baseUrl}${req.path}`);
    const method = req.method || 'GET';
    const headers = {};
    this._config.headers?.forEach((val, key) => {
      headers[key] = val
    })
    // this.joinHeaders([
    //   new Headers(req.headers ? req.headers : []),
    //   this._config.headers || new Headers()
    // ]);
    return axios.request({
      ...req,
      url,
      method,
      headers: {
        ...headers,
        ...req.headers
      },
      withCredentials: true
    }).then(res => res.data);
  }

  jira(options: { path: string; data?: string; type?: 'POST' | 'GET' | 'PUT' | 'DELETE' }) {
    const requestOptions: any = { url: options.path, type: 'GET' };
    if (options.type) {
      requestOptions.type = options.type;
    }
    if (options.data) {
      requestOptions.data = options.data;
      requestOptions.contentType = 'application/json';
    }
    return new Observable(observer => {
      AP.request({
        ...requestOptions,
        success: function(response) {
          // convert the string response to JSON
          response = JSON.parse(response);
          //console.log(response);
          observer.next(response);
          observer.complete();
        },
        error: function(err) {
          console.log(err);
          observer.error(err);
          observer.complete();
        }
      });
    });
  }

  jiraRequest(options: { path: string; data?: string; type?: 'POST' | 'GET' | 'PUT' | 'DELETE' }) {
    const requestOptions: any = { url: options.path, type: 'GET' };
    if (options.type) {
      requestOptions.type = options.type;
    }
    if (options.data) {
      requestOptions.data = options.data;
      requestOptions.contentType = 'application/json';
    }
    return new Promise((resolve, reject) => {
      AP.request({
        ...requestOptions,
        success: function(response) {
          // convert the string response to JSON
          if (response) {
            response = JSON.parse(response);
            //console.log(response);
            resolve(response);
          } else {
            //no return response but still successful
            resolve();
          }
        },
        error: function(err) {
          console.log(err);
          reject(err);
        }
      });
    });
  }
}

export default new RequestLib({
  headers: new Headers([
    // ['Access-Control-Allow-Origin', '*'],
    ['Content-Type', 'application/json']
  ])
});
