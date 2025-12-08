/**
 * Utility untuk manage browser cache dan mengurangi beban pada backend cache
 * Menggunakan browser cache, sessionStorage, dan localStorage untuk caching di client-side
 */

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  useSessionStorage?: boolean; // Use sessionStorage instead of localStorage
}

/**
 * Cache data di browser dengan TTL
 */
export function setBrowserCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void {
  const { ttl = 24 * 60 * 60 * 1000, useSessionStorage = false } = options; // Default 24 jam

  const cacheData = {
    data,
    timestamp: Date.now(),
    ttl,
  };

  const storage = useSessionStorage ? sessionStorage : localStorage;
  
  try {
    storage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    // Jika storage penuh, clear cache lama
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCache(storage);
      try {
        storage.setItem(key, JSON.stringify(cacheData));
      } catch (retryError) {
        console.warn('Failed to set cache after cleanup:', retryError);
      }
    }
  }
}

/**
 * Get data dari browser cache
 */
export function getBrowserCache<T>(key: string, useSessionStorage = false): T | null {
  const storage = useSessionStorage ? sessionStorage : localStorage;
  
  try {
    const cached = storage.getItem(key);
    if (!cached) return null;

    const cacheData = JSON.parse(cached) as { data: T; timestamp: number; ttl: number };
    
    // Cek apakah cache masih valid
    const age = Date.now() - cacheData.timestamp;
    if (age > cacheData.ttl) {
      storage.removeItem(key);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
}

/**
 * Clear cache lama untuk menghemat storage
 */
function clearOldCache(storage: Storage): void {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) keys.push(key);
  }

  const now = Date.now();
  let cleared = 0;

  for (const key of keys) {
    try {
      const cached = storage.getItem(key);
      if (!cached) continue;

      const cacheData = JSON.parse(cached) as { timestamp: number; ttl: number };
      const age = now - cacheData.timestamp;
      
      if (age > cacheData.ttl) {
        storage.removeItem(key);
        cleared++;
      }
    } catch (error) {
      // Jika error parsing, hapus key tersebut
      storage.removeItem(key);
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`Cleared ${cleared} expired cache entries`);
  }
}

/**
 * Clear semua cache dengan prefix tertentu
 */
export function clearCacheByPrefix(prefix: string, useSessionStorage = false): void {
  const storage = useSessionStorage ? sessionStorage : localStorage;
  const keys: string[] = [];
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }

  keys.forEach(key => storage.removeItem(key));
  console.log(`Cleared ${keys.length} cache entries with prefix: ${prefix}`);
}

/**
 * Clear semua cache
 */
export function clearAllCache(useSessionStorage = false): void {
  const storage = useSessionStorage ? sessionStorage : localStorage;
  storage.clear();
  console.log('All cache cleared');
}

/**
 * Get cache size estimate (dalam bytes)
 */
export function getCacheSize(useSessionStorage = false): number {
  const storage = useSessionStorage ? sessionStorage : localStorage;
  let size = 0;

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) {
      const value = storage.getItem(key);
      if (value) {
        size += key.length + value.length;
      }
    }
  }

  return size;
}

/**
 * Image cache helper - khusus untuk cache URL gambar
 */
export const imageCache = {
  set: (url: string, metadata: { loaded: boolean; error?: boolean }, ttl = 24 * 60 * 60 * 1000) => {
    setBrowserCache(`img_cache_${url}`, metadata, { ttl, useSessionStorage: true });
  },
  
  get: (url: string): { loaded: boolean; error?: boolean } | null => {
    return getBrowserCache<{ loaded: boolean; error?: boolean }>(`img_cache_${url}`, true);
  },
  
  clear: () => {
    clearCacheByPrefix('img_cache_', true);
  },
};

/**
 * API response cache helper - untuk cache response API
 */
export const apiCache = {
  set: <T>(endpoint: string, data: T, ttl = 5 * 60 * 1000) => { // Default 5 menit
    const key = `api_cache_${endpoint}`;
    setBrowserCache(key, data, { ttl, useSessionStorage: false });
  },
  
  get: <T>(endpoint: string): T | null => {
    const key = `api_cache_${endpoint}`;
    return getBrowserCache<T>(key, false);
  },
  
  clear: (endpoint?: string) => {
    if (endpoint) {
      const key = `api_cache_${endpoint}`;
      const storage = localStorage;
      storage.removeItem(key);
    } else {
      clearCacheByPrefix('api_cache_', false);
    }
  },
};



