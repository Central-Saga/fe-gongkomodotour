// lib/api.ts
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { apiCache } from './browserCache';

// Untuk debugging
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com';
console.log('API Base URL:', API_BASE_URL);

// 1. Buat Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // CSRF: kirim cookie (session) dan terima Set-Cookie dari API
  timeout: 30000, // Menambahkan timeout 30 detik
  // Tambahkan proxy untuk bypass CORS issue
  proxy: false
});

// CSRF token dari GET /api/csrf-token (cross-origin: FE tidak bisa baca cookie, jadi backend return di JSON)
let csrfToken: string | null = null;

export async function ensureCsrf(): Promise<void> {
  const r = await api.get<{ csrf_token?: string }>('/api/csrf-token');
  csrfToken = (r.data?.csrf_token ?? null) as string | null;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}

// 2. Interceptor: CSRF (X-XSRF-TOKEN), Bearer, FormData
api.interceptors.request.use(async (config: InternalAxiosRequestConfig<unknown>) => {
  if (typeof window === "undefined") return config;

  // CSRF: untuk POST/PUT/PATCH/DELETE, tambah X-XSRF-TOKEN (skip untuk GET /api/csrf-token)
  const method = (config.method ?? 'get').toLowerCase();
  const isMutation = ['post', 'put', 'patch', 'delete'].includes(method);
  const isCsrfUrl = String(config.url ?? '').includes('/api/csrf-token');
  if (isMutation && !isCsrfUrl) {
    if (!csrfToken) await ensureCsrf();
    if (csrfToken && config.headers) config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  // Bearer
  try {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`;
  } catch {
    // ignore
  }

  // FormData: hapus Content-Type, biarkan browser set boundary
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  return config;
});

// 3. Helper function apiRequest<T>
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: Record<string, unknown> | FormData,
  config?: AxiosRequestConfig & { useCache?: boolean; cacheTTL?: number }
): Promise<T> {
  // Untuk GET requests, cek cache terlebih dahulu
  // useCache: false berarti TIDAK menggunakan cache sama sekali
  const useCache = method === 'GET' && (config?.useCache !== false);
  const cacheTTL = config?.cacheTTL || 5 * 60 * 1000; // Default 5 menit

  // Di localhost/development, disable cache untuk memastikan data fresh
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const shouldUseCache = useCache && !isLocalhost; // Jangan gunakan cache di localhost

  // Jika useCache: false atau localhost, clear cache terlebih dahulu untuk memastikan fresh data
  if ((config?.useCache === false || isLocalhost) && typeof window !== 'undefined') {
    apiCache.clear(url);
    console.log(`🗑️ Cache cleared for ${url} (useCache: ${config?.useCache}, localhost: ${isLocalhost})`);
  }

  if (shouldUseCache && typeof window !== 'undefined') {
    const cached = apiCache.get<T>(url);
    if (cached) {
      console.log(`Cache hit for ${url}`);
      return cached;
    }
  }

  try {
    console.log(`Making ${method} request to ${url}`);
    console.log('Request config:', { method, url, data, config });
    console.log('API Base URL:', API_BASE_URL);
    
    // Jika data adalah FormData, hapus Content-Type dari headers agar Axios set otomatis dengan boundary
    const requestConfig: AxiosRequestConfig = { ...config };
    if (data instanceof FormData) {
      if (requestConfig.headers) {
        // Hapus Content-Type jika ada, biarkan Axios set otomatis
        const headers = { ...requestConfig.headers };
        delete headers['Content-Type'];
        delete headers['content-type'];
        requestConfig.headers = headers;
      }
    }
    
    const response = await api({
      method,
      url,
      data,
      ...requestConfig,
    });
    console.log(`Successful response from ${url}`, response.status);
    console.log('Response data:', response.data);
    
    // Cache GET responses (jangan cache di localhost)
    if (shouldUseCache && typeof window !== 'undefined') {
      apiCache.set(url, response.data, cacheTTL);
    }
    
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { 
      message?: string; 
      response?: { status?: number }; 
      config?: unknown 
    };
    console.error(`Error in apiRequest to ${url}:`, axiosError.message || 'Unknown error');
    console.error('Full error object:', error);
    console.error('Error response:', axiosError.response);
    console.error('Error config:', axiosError.config);
    
    // If we get a 500 error, try alternative approaches
    if (axiosError.response?.status === 500) {
      console.log('Received 500 error, trying alternative approaches...');
      
      // Try 1: Direct fetch without axios
      try {
        console.log('Attempting direct fetch...');
        const fullUrl = `${API_BASE_URL}${url}`;
        const fetchResponse = await fetch(fullUrl, {
          method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        });
        
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          console.log('Direct fetch successful:', fetchData);
          return fetchData as T;
        } else {
          console.error('Direct fetch failed:', fetchResponse.status, fetchResponse.statusText);
        }
      } catch (fetchError) {
        console.error('Direct fetch error:', fetchError);
      }
      
      // Try 2: XHR fallback (hanya di client-side)
      if (method === 'GET' && typeof window !== "undefined" && typeof XMLHttpRequest !== "undefined") {
        console.log('Attempting XHR fallback...');
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const fullUrl = `${API_BASE_URL}${url}`;
          
          xhr.open(method, fullUrl, true);
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          
          xhr.timeout = 30000;
          
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                console.log('XHR fallback successful', response);
                resolve(response as T);
              } catch (e) {
                reject(new Error(`JSON parse error: ${e}`));
              }
            } else {
              reject(new Error(`HTTP error status: ${xhr.status}`));
            }
          };
          
          xhr.onerror = function() {
            console.error('XHR error occurred');
            reject(new Error('Network error occurred'));
          };
          
          xhr.ontimeout = function() {
            reject(new Error('Request timed out'));
          };
          
          xhr.send();
        });
      }
    }
    
    // If axios fails and no fallback worked, try with native fetch as fallback (hanya di client-side)
    if (!axiosError.response && method === 'GET' && typeof window !== "undefined" && typeof XMLHttpRequest !== "undefined") {
      console.log('Attempting fallback with XHR');
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const fullUrl = `${API_BASE_URL}${url}`;
        
        xhr.open(method, fullUrl, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        
        xhr.timeout = 30000;
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('XHR fallback successful', response);
              resolve(response as T);
            } catch (e) {
              reject(new Error(`JSON parse error: ${e}`));
            }
          } else {
            reject(new Error(`HTTP error status: ${xhr.status}`));
          }
        };
        
        xhr.onerror = function() {
          console.error('XHR error occurred');
          reject(new Error('Network error occurred'));
        };
        
        xhr.ontimeout = function() {
          reject(new Error('Request timed out'));
        };
        
        xhr.send();
      });
    }
    
    throw error;
  }
}

// 4. Error handler global untuk menangani token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    console.error('API Error:', {
      message: error.message,
      config: error.config,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        clearCsrfToken();
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        } catch {
          // ignore
        }
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - consider increasing the timeout value');
    }
    
    if (!error.response) {
      console.error('Network error - check your internet connection or API endpoint availability');
    }
    
    return Promise.reject(error);
  }
);

// 5. Export default instance dan apiRequest
export default api;
