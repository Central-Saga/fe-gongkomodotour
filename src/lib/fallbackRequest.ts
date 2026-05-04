// lib/fallbackRequest.ts
/**
 * Fallback request function menggunakan XMLHttpRequest dasar
 * untuk mengatasi masalah dengan Axios dan Fetch API
 */
export async function fallbackRequest<T>(
  method: string,
  url: string,
  baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const fullUrl = `${baseUrl}${url}`;
    console.log(`Fallback request to: ${fullUrl}`);
    
    const xhr = new XMLHttpRequest();
    xhr.open(method, fullUrl, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
    // Tambahkan timeout
    xhr.timeout = 30000;
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
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
