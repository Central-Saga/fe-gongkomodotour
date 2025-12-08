# Panduan Implementasi Optimasi Cache

## 🎯 Tujuan

Mengurangi beban pada backend cache store dengan optimasi di frontend, sehingga backend bisa kembali menggunakan cache store default (Redis/Memcached) tanpa masalah.

## 📋 Checklist Implementasi

### Phase 1: Basic Implementation ✅

- [x] Browser cache utility (`src/lib/browserCache.ts`)
- [x] Request batching system (`src/lib/requestBatcher.ts`)
- [x] Cached image component (`src/components/ui/cached-image.tsx`)
- [x] API response caching (`src/lib/api.ts`)
- [x] Next.js cache headers (`next.config.ts`)

### Phase 2: Migration (Yang Perlu Dilakukan)

- [ ] Ganti `Image` dengan `CachedImage` di komponen utama
- [ ] Update gallery components untuk menggunakan `CachedImage`
- [ ] Update detail pages untuk menggunakan `CachedImage`
- [ ] Test cache behavior di production
- [ ] Monitor cache hit rate

### Phase 3: Advanced Optimization (Opsional)

- [ ] Implementasi Service Worker untuk offline caching
- [ ] Setup CDN untuk static assets
- [ ] Image preloading untuk critical images
- [ ] Implementasi stale-while-revalidate pattern

## 🔄 Migration Steps

### Step 1: Update Image Components

Cari semua penggunaan `Image` dari Next.js dan ganti dengan `CachedImage`:

```bash
# Cari file yang menggunakan Image
grep -r "from 'next/image'" src/
grep -r 'from "next/image"' src/
```

### Step 2: Update Gallery Components

File yang perlu di-update:
- `src/components/ui-home/Gallery.tsx`
- `src/components/ui-gallery/Gallery.tsx`
- `src/components/ui/image-gallery.tsx`
- `src/app/dashboard/galleries/data-table.tsx`

### Step 3: Update Detail Pages

File yang perlu di-update:
- `src/components/ui-detail/DetailPaketOpenTrip.tsx`
- `src/components/ui-detail/boat/DetailBoat.tsx`
- Komponen detail lainnya

### Step 4: Test & Monitor

1. Test di development environment
2. Monitor network requests di DevTools
3. Cek cache hit rate
4. Test dengan berbagai ukuran gambar
5. Test dengan slow network (throttling)

## 📝 Contoh Migration

### Before:
```tsx
import Image from 'next/image';

<Image
  src={imageUrl}
  alt="Description"
  width={500}
  height={300}
  className="rounded-lg"
/>
```

### After:
```tsx
import { CachedImage } from '@/components/ui/cached-image';

<CachedImage
  src={imageUrl}
  alt="Description"
  width={500}
  height={300}
  className="rounded-lg"
  priority={false} // true untuk gambar di atas fold
/>
```

## 🧪 Testing Checklist

- [ ] Images load dengan lazy loading
- [ ] Cache bekerja untuk gambar yang sama
- [ ] API responses di-cache dengan benar
- [ ] Fallback images muncul saat error
- [ ] Performance improvement terukur
- [ ] Tidak ada memory leaks
- [ ] Cache cleared dengan benar saat data update

## 📊 Metrics to Track

1. **Cache Hit Rate**: Berapa persen request yang di-serve dari cache
2. **Page Load Time**: Waktu load halaman sebelum dan sesudah
3. **Network Requests**: Jumlah request ke backend
4. **Image Load Time**: Waktu load gambar
5. **Storage Usage**: Penggunaan browser storage

## 🔍 Monitoring Commands

```tsx
// Di browser console
import { getCacheSize, imageCache, apiCache } from '@/lib/browserCache';

// Cek cache size
console.log('Cache size:', getCacheSize() / 1024 / 1024, 'MB');

// Cek image cache status
console.log('Image cache:', imageCache.get(imageUrl));

// Clear cache jika perlu
imageCache.clear();
apiCache.clear();
```

## 🚀 Deployment Checklist

- [ ] Build berhasil tanpa error
- [ ] Test di staging environment
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify cache behavior
- [ ] Update documentation
- [ ] Inform team tentang perubahan

## 📞 Support

Jika ada masalah:
1. Cek browser console untuk errors
2. Cek network tab untuk request patterns
3. Verify cache storage tidak penuh
4. Test dengan cache disabled untuk comparison



