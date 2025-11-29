/**
 * Utility untuk manage cache Google images
 * Gunakan untuk clear cache jika gambar tidak tampil
 */

/**
 * Clear semua cache Google images
 */
export function clearGoogleImageCache() {
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.startsWith('google_img_')) {
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(`${key}_error_time`);
    }
  });
  console.log('✅ Google image cache cleared');
}

/**
 * Clear cache untuk URL tertentu
 */
export function clearGoogleImageCacheForUrl(url: string) {
  const cacheKey = `google_img_${url}`;
  sessionStorage.removeItem(cacheKey);
  sessionStorage.removeItem(`${cacheKey}_error_time`);
  console.log(`✅ Google image cache cleared for: ${url.substring(0, 50)}...`);
}

/**
 * Get cache status untuk debugging
 */
export function getGoogleImageCacheStatus() {
  const keys = Object.keys(sessionStorage);
  const googleCache: Record<string, string> = {};
  
  keys.forEach(key => {
    if (key.startsWith('google_img_')) {
      const url = key.replace('google_img_', '');
      const status = sessionStorage.getItem(key);
      const errorTime = sessionStorage.getItem(`${key}_error_time`);
      
      googleCache[url] = {
        status: status || 'none',
        errorTime: errorTime || null,
        age: errorTime ? `${Math.floor((Date.now() - parseInt(errorTime)) / 1000)}s ago` : null
      };
    }
  });
  
  return googleCache;
}

