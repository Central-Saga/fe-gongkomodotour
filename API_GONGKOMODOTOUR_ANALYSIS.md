# API Gongkomodotour.com - Analisis Penggunaan

## 📋 Ringkasan

✅ **Ya, `api.gongkomodotour.com` ada di dalam codebase ini.**

Domain API ini digunakan secara ekstensif di seluruh aplikasi frontend sebagai endpoint backend utama.

---

## 🔍 Lokasi Penggunaan

### 1. **Konfigurasi Next.js** (`next.config.ts`)

**Baris 14, 38, 66:**
- Dikonfigurasi sebagai hostname yang diizinkan untuk Next.js Image Optimization
- Digunakan dalam rewrites untuk proxy API requests
- Ditambahkan ke daftar domains yang diizinkan

```typescript
// Remote patterns untuk image optimization
{
  protocol: 'https',
  hostname: 'api.gongkomodotour.com',
  pathname: '/storage/**',
}

// Rewrites untuk proxy API
{
  source: '/api/:path*',
  destination: 'https://api.gongkomodotour.com/api/:path*',
}
```

### 2. **Library API Utama** (`src/lib/api.ts`)

**Baris 6:**
- Digunakan sebagai base URL default untuk semua API requests
- Fallback jika `NEXT_PUBLIC_API_URL` environment variable tidak diset

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com';
```

### 3. **Helper Functions**

#### `src/lib/imageUrl.ts` (Baris 4)
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com';
```

#### `src/lib/fallbackRequest.ts` (Baris 9)
```typescript
baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com'
```

### 4. **UI Components**

#### Image Components:
- **`src/components/ui/cached-image.tsx`** (Baris 43)
- **`src/components/ui/optimized-image.tsx`** (Baris 40)
- **`src/components/ui/authenticated-image.tsx`** (Baris 100)

Digunakan untuk mengidentifikasi apakah image source berasal dari API remote:
```typescript
const isRemoteAPI = src.includes('api.gongkomodotour.com')
```

#### Form Components:
- **`src/components/ui/file-upload.tsx`** (Baris 28)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com'
```

#### Home Components:
- **`src/components/ui-home/TripHighlight.tsx`** (Baris 50)
- **`src/components/ui-home/LandingHero.tsx`** (Baris 124)
- **`src/components/ui-home/Testimonials.tsx`** (Baris 461)

#### Detail Components:
- **`src/components/ui-detail/ui-call/DetailReview.tsx`** (Baris 259)
- **`src/components/ui-detail/intermediary/DetailOpenTrip.tsx`** (Baris 356)

#### Debug Components:
- **`src/components/DebugApi.tsx`** (Baris 41, 82, 84)

### 5. **Dashboard Pages**

- **`src/app/dashboard/transactions/data-table.tsx`** (Baris 71)
- **`src/app/dashboard/galleries/data-table.tsx`** (Baris 70)
- **`src/app/dashboard/blogs/data-table.tsx`** (Baris 129)

### 6. **Public HTML Files**

- **`public/cookie.html`** (Baris 27)

Digunakan untuk CSRF cookie:
```javascript
const response = await fetch('https://api.gongkomodotour.com/sanctum/csrf-cookie', {
```

---

## 📊 Statistik Penggunaan

| Kategori | Jumlah File |
|----------|-------------|
| **Configuration** | 1 file (next.config.ts) |
| **Core Libraries** | 3 files (api.ts, imageUrl.ts, fallbackRequest.ts) |
| **UI Components** | 10 files |
| **Dashboard Pages** | 3 files |
| **Public Files** | 1 file |
| **Documentation** | 1 file (TRIP_IMAGE_DELETE_ERROR_FIX.md) |
| **TOTAL** | **19+ files** |

---

## 🎯 Fungsi Utama

1. **Base URL untuk API Requests**
   - Semua komunikasi dengan backend menggunakan domain ini
   - Fallback default jika environment variable tidak diset

2. **Image Optimization**
   - Next.js Image component menggunakan domain ini untuk optimize images
   - Configured dalam remotePatterns dan domains di next.config.ts

3. **API Proxy**
   - Next.js rewrites digunakan untuk proxy `/api/*` requests ke `https://api.gongkomodotour.com/api/*`

4. **Authentication**
   - CSRF cookie handling
   - Bearer token authentication

5. **File Upload & Storage**
   - Image dan file uploads dikirim ke domain ini
   - Storage path: `/storage/**`

---

## 🔒 Security & Configuration

### Environment Variables
Domain ini digunakan sebagai fallback untuk:
```
NEXT_PUBLIC_API_URL=https://api.gongkomodotour.com
```

### CORS Configuration
Headers dikonfigurasi di `next.config.ts` untuk mengizinkan cross-origin requests.

### Image Security
- dangerouslyAllowSVG: true
- contentSecurityPolicy configured
- minimumCacheTTL: 3600 (1 hour)

---

## ✅ Kesimpulan

**Domain `api.gongkomodotour.com` adalah bagian integral dari aplikasi frontend ini.**

Ini adalah:
- ✅ Backend API endpoint utama
- ✅ Image storage server
- ✅ Authentication server
- ✅ File upload destination

**Status:** Aktif dan digunakan secara ekstensif di seluruh aplikasi.

---

## 📝 Catatan

Jika domain ini perlu diubah atau diganti, berikut lokasi yang perlu diupdate:
1. Environment variable `NEXT_PUBLIC_API_URL`
2. Fallback values di 19+ files (gunakan grep untuk mencari: `api\.gongkomodotour\.com`)
3. next.config.ts configuration
4. Documentation files

**Rekomendasi:** Gunakan environment variable `NEXT_PUBLIC_API_URL` untuk semua references, sehingga lebih mudah mengganti domain di masa depan tanpa perlu mengubah banyak file.
