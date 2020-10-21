import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiErrorResponse } from '../types/api';

const client = axios.create({
  baseURL: process.env.REACT_APP_REST_URL,
});

// Boilerplate
class BaseAPI {
  public get<T = any>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return processRequest(url, client.get(url, { params }));
  }

  public post<T = any>(url: string, data: any = {}): Promise<AxiosResponse<T>> {
    return processRequest(url, client.post(url, data));
  }

  public put<T = any>(url: string, data: any = {}): Promise<AxiosResponse<T>> {
    return processRequest(url, client.put(url, data));
  }

  public delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return processRequest(url, client.delete(url));
  }

  // Methods whereby the data is immediately extracted from the HTTP response.
  public getData<T = any>(url: string, params?: any): Promise<T> {
    return this.get(url, params).then(response => response.data);
  }

  public postData<T = any>(url: string, data: any = {}): Promise<T> {
    return this.post(url, data).then(response => response.data);
  }

  public putData<T = any>(url: string, data: any = {}): Promise<T> {
    return this.put(url, data).then(response => response.data);
  }
}

function processRequest<T>(
  endpoint: string,
  promise: Promise<AxiosResponse<T>>
): Promise<AxiosResponse<T>> {
  return promise.catch((error: AxiosError) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[API] ${error.code} ${endpoint} : ${error.message}`);
    }
    throw makeApiErrorResponse(error);
  });
}

// Extracts error message.
function makeApiErrorResponse(error: AxiosError): ApiErrorResponse {
  return {
    code: error.response?.status || -1,
    body: error.response?.data,
  };
}

const base = new BaseAPI();

export default base;
