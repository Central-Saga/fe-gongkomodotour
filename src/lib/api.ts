const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const fetchCsrfToken = async (): Promise<void> => {
  await fetch(`${baseURL}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
  });
};

export const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<T> => {
  try {
    await fetchCsrfToken();
    const options: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(`${baseURL}${url}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};