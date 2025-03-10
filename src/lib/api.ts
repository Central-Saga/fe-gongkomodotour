// lib/api.ts
import axios, { AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true,
});

export const fetchCsrfToken = async (): Promise<void> => {
  await api.get('/sanctum/csrf-cookie');
};

export const apiRequest = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any
): Promise<T> => {
  try {
    await fetchCsrfToken();
    const response: AxiosResponse<T> = await api({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default api;