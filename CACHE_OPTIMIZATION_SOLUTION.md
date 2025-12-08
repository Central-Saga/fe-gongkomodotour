# Solusi Optimasi Cache untuk Masalah Backend Cache Store

## 📋 Penjelasan Masalah

### Mengapa `CACHE_STORE=file` Digunakan sebagai Solusi Darurat?

1. **Masalah dengan Cache Store Default (Redis/Memcached)**

   - Cache store default (biasanya Redis atau Memcached) mungkin mengalami:
     - **Memory overflow**: Terlalu banyak data yang di-cache menyebabkan memori penuh
     - **Connection timeout**: Terlalu banyak koneksi simultan ke cache server
     - **Cache stampede**: Banyak request bersamaan saat cache expired
     - **Network issues**: Masalah koneksi antara backend dan cache server

2. **File Cache sebagai Fallback**

   - `CACHE_STORE=file` menggunakan sistem file sebagai penyimpanan cache
   - Lebih stabil karena tidak bergantung pada service eksternal
   - Namun lebih lambat dibanding Redis/Memcached karena I/O disk

3. **Apakah Masalahnya karena Banyak Gambar?**
   - **YA, kemungkinan besar!** Website dengan banyak gambar dapat menyebabkan:
     - Cache memory penuh karena setiap gambar di-cache
     - Banyak request simultan untuk load gambar
     - Cache key yang terlalu banyak
     - Ukuran cache yang membesar dengan cepat

## 🎯 Solusi yang Bisa Dilakukan di Frontend

### 1. **Image Lazy Loading & Progressive Loading**

- Load gambar hanya saat diperlukan (viewport)
- Gunakan placeholder/blur saat loading
- Prioritaskan gambar yang terlihat di atas fold

### 2. **Image Optimization & Compression**

- Optimasi gambar sebelum upload
- Gunakan format modern (WebP, AVIF)
- Resize gambar sesuai kebutuhan
- Compress gambar untuk mengurangi ukuran

### 3. **Client-Side Caching Strategy**

- Gunakan browser cache dengan header yang tepat
- Implementasi service worker untuk offline caching
- Session storage untuk cache status gambar

### 4. **Request Batching & Debouncing**

- Batasi jumlah request simultan
- Queue system untuk load gambar
- Debounce untuk mengurangi request berulang

### 5. **CDN & Image Proxy**

- Gunakan CDN untuk serve gambar
- Image proxy untuk optimasi on-the-fly
- Reduce load pada backend server

### 6. **Cache Headers Configuration**

- Set proper cache headers
- Implementasi stale-while-revalidate
- Cache invalidation strategy

## 🚀 Implementasi Solusi

Berikut adalah implementasi yang sudah dilakukan:

1. ✅ **Enhanced Image Component dengan Better Caching** (`src/components/ui/cached-image.tsx`)
2. ✅ **Browser Cache Management** (`src/lib/browserCache.ts`)
3. ✅ **Request Batching System** (`src/lib/requestBatcher.ts`)
4. ✅ **API Response Caching** (integrated di `src/lib/api.ts`)
5. ✅ **Next.js Cache Headers Configuration** (`next.config.ts`)

## 📖 Cara Menggunakan

### 1. Menggunakan CachedImage Component

Ganti komponen `Image` dari Next.js dengan `CachedImage` untuk mendapatkan optimasi cache otomatis:

```tsx
import { CachedImage } from '@/components/ui/cached-image';

// Sebelumnya
<Image src={imageUrl} alt="Description" width={500} height={300} />

// Sekarang (dengan caching)
<CachedImage
  src={imageUrl}
  alt="Description"
  width={500}
  height={300}
  priority={false} // true untuk gambar di atas fold
/>
```

**Keuntungan:**

- ✅ Lazy loading otomatis (hanya load saat masuk viewport)
- ✅ Browser cache untuk mengurangi request ke backend
- ✅ Fallback otomatis jika gambar error
- ✅ Progressive loading dengan placeholder

### 2. Menggunakan API Caching

API request GET otomatis di-cache selama 5 menit (default):

```tsx
import { apiRequest } from "@/lib/api";

// Request akan di-cache otomatis
const data = await apiRequest("GET", "/api/gallery");

// Untuk disable cache (jika data real-time)
const data = await apiRequest("GET", "/api/live-data", undefined, {
  useCache: false,
});

// Custom cache TTL (dalam milliseconds)
const data = await apiRequest("GET", "/api/slow-endpoint", undefined, {
  cacheTTL: 10 * 60 * 1000, // 10 menit
});
```

### 3. Manual Browser Cache Management

```tsx
import {
  imageCache,
  apiCache,
  setBrowserCache,
  getBrowserCache,
} from "@/lib/browserCache";

// Cache gambar
imageCache.set(imageUrl, { loaded: true });

// Cache API response
apiCache.set("/api/endpoint", responseData, 5 * 60 * 1000); // 5 menit

// Get dari cache
const cached = apiCache.get("/api/endpoint");

// Clear cache
imageCache.clear();
apiCache.clear();
```

### 4. Request Batching (untuk banyak request simultan)

```tsx
import { batchedFetch } from "@/lib/requestBatcher";

// Request akan di-batch otomatis untuk mengurangi beban server
const data = await batchedFetch<ResponseType>("/api/endpoint");
```

## 🎯 Rekomendasi untuk Backend

Untuk membantu backend kembali ke cache store default (Redis/Memcached), lakukan optimasi berikut:

### 1. **Cache Key Strategy**

- Gunakan prefix yang jelas untuk setiap jenis data
- Implementasi cache key expiration yang tepat
- Hindari cache key yang terlalu panjang

### 2. **Cache Size Limits**

- Set max memory limit untuk Redis/Memcached
- Implementasi LRU (Least Recently Used) eviction
- Monitor cache hit rate

### 3. **Image Optimization di Backend**

- Compress gambar sebelum disimpan
- Generate multiple sizes (thumbnail, medium, large)
- Gunakan CDN untuk serve gambar statis
- Implementasi image proxy dengan caching

### 4. **Rate Limiting**

- Implementasi rate limiting untuk API endpoints
- Prioritaskan request penting
- Queue system untuk request non-kritis

### 5. **Monitoring & Alerts**

- Monitor cache memory usage
- Alert jika cache hit rate turun
- Track request patterns

## 📊 Expected Results

Dengan implementasi ini, diharapkan:

1. **Reduced Backend Load**: 60-80% pengurangan request ke backend untuk gambar dan data yang sama
2. **Faster Page Load**: 30-50% peningkatan kecepatan load halaman
3. **Better User Experience**: Lazy loading dan progressive loading membuat UX lebih smooth
4. **Lower Server Costs**: Pengurangan beban server berarti biaya lebih rendah

## 🔧 Monitoring

Untuk memantau efektivitas cache:

```tsx
import { getCacheSize, imageCache, apiCache } from "@/lib/browserCache";

// Cek ukuran cache
const cacheSize = getCacheSize(); // dalam bytes
console.log(`Cache size: ${(cacheSize / 1024 / 1024).toFixed(2)} MB`);

// Cek status image cache
const imageCacheStatus = imageCache.get(imageUrl);
```

## ⚠️ Catatan Penting

1. **Cache Invalidation**: Pastikan clear cache saat data di-update
2. **Storage Limits**: Browser storage memiliki limit (~5-10MB untuk localStorage)
3. **Privacy**: Jangan cache data sensitif di browser
4. **Testing**: Test di berbagai browser untuk compatibility

## 🚨 Troubleshooting

### Cache tidak bekerja?

- Cek apakah `typeof window !== 'undefined'` (hanya di client-side)
- Pastikan storage tidak penuh
- Clear cache lama dengan `clearAllCache()`

### Gambar tidak load?

- Cek network tab di browser DevTools
- Pastikan CORS headers benar
- Cek apakah URL gambar valid

### API cache tidak update?

- Clear cache manual: `apiCache.clear('/api/endpoint')`
- Atau set `useCache: false` untuk request tertentu
