import axios from 'axios';

// Define the base URL from environment variables or default to local development
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL,
  withCredentials: true, // Enable credentials to include cookies
  headers: {
    'Accept': 'application/json',
    'Accept-Language': 'id,en-US;q=0.7,en;q=0.3',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Function to retrieve a cookie by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Request interceptor to handle CSRF token
api.interceptors.request.use(async (config) => {
  if (!config.url?.includes('sanctum/csrf-cookie')) {
    const xsrfToken = getCookie('XSRF-TOKEN');
    console.log('Current XSRF Token from cookie:', xsrfToken);
    
    if (!xsrfToken) {
      console.log('No XSRF token found, fetching new one...');
      await fetchCsrfToken();
      const newXsrfToken = getCookie('XSRF-TOKEN');
      if (newXsrfToken) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(newXsrfToken);
        console.log('Updated XSRF Token:', newXsrfToken);
      }
    } else {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
    console.log('Final Request Headers:', config.headers);
  }
  return config;
});

// Function to fetch CSRF token
export const fetchCsrfToken = async (): Promise<void> => {
  try {
    const response = await fetch(`${baseURL}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    
    console.log('CSRF Response status:', response.status);
    console.log('Set-Cookie Header:', response.headers.get('set-cookie'));
    console.log('All cookies after request:', document.cookie);
  } catch (error) {
    console.error('CSRF Token Error:', error);
    throw error;
  }
};

interface RequestOptions {
  headers?: Record<string, string>;
  [key: string]: unknown;
}

// Generic API request function
export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: Record<string, unknown> | FormData,
  options?: RequestOptions
): Promise<T> => {
  try {
    console.log('Making request to:', `${baseURL}${url}`);
    console.log('Request data:', data);

    // Ensure CSRF token is fetched if not present
    let xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) {
      console.log('No CSRF token found, fetching first...');
      await fetchCsrfToken();
      xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) {
        throw new Error('Failed to retrieve CSRF token');
      }
    }

    const headers: HeadersInit = {
      ...options?.headers,
      'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
      ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    };

    const response = await api({
      method,
      url,
      data,
      headers,
    });

    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw new Error(error.response?.data?.message || 'API request failed');
    }
    throw error;
  }
};

export default api;