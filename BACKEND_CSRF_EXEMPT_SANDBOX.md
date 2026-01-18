# Backend: Exempt CSRF untuk Login & Register (Token-based, Sandbox)

Frontend sandbox (https://sandbox.gongkomodotour.com) memakai **token-based auth**:  
login/register mengirim `email`+`password`, backend mengembalikan `access_token`.  
Request tidak memakai cookie/session untuk autentikasi, jadi CSRF untuk kedua endpoint ini tidak dipakai dan **harus di-exempt** supaya tidak 419 di sandbox.

---

## Perubahan di Laravel API (sandbox & production)

### 1. Exempt `api/login` dan `api/register` dari CSRF

Edit `app/Http/Middleware/VerifyCsrfToken.php` (atau `app/Http/Middleware/EncryptCookies.php` jika struktur Laravel terbaru) — cari property `$except` dan tambahkan:

```php
protected $except = [
    'api/login',
    'api/register',
];
```

Jika route memakai prefix, sesuaikan, mis.:

```php
protected $except = [
    'api/login',      // POST /api/login
    'api/register',   // POST /api/register
];
```

Simpan, deploy ke **sandbox API** (dan production jika ingin perilaku sama).

---

## Kenapa production jalan tapi sandbox tidak?

- **Production (main):**  
  - Mungkin FE & API satu root domain / satu “site” sehingga cookie `XSRF-TOKEN` bisa dibaca dan dikirim sebagai `X-XSRF-TOKEN`, **atau**
  - CORS + Sanctum stateful + `SameSite` sudah dikonfigurasi untuk production.

- **Sandbox:**  
  - FE: `sandbox.gongkomodotour.com`, API: `sandbox.api.gongkomodotour.com` (cross-origin).
  - `document.cookie` di FE tidak bisa baca cookie domain API, jadi header `X-XSRF-TOKEN` tidak terisi.
  - Tanpa `X-XSRF-TOKEN` yang valid → Laravel memblokir dengan **419 CSRF token mismatch**.

Exempt `api/login` dan `api/register` aman karena:

- Keduanya **tidak mengandalkan cookie/session** untuk auth, hanya `email`+`password` (dan data register).
- Response hanya berisi `access_token` (+ user, dll); setelah itu FE mengirim `Authorization: Bearer {token}`.
- Endpoint lain yang memakai session/cookie tetap dilindungi CSRF.

---

## Opsi lain: Tetap pakai cookie/CSRF di sandbox

Jika Anda ingin **tetap pakai cookie + CSRF** di sandbox (bukan token-only), yang harus diatur di backend:

1. **CORS** (`config/cors.php`):  
   - `'supports_credentials' => true`  
   - `'allowed_origins' => [..., 'https://sandbox.gongkomodotour.com']`

2. **Sanctum** (`config/sanctum.php`):  
   - `'stateful' => [..., 'sandbox.gongkomodotour.com']`

3. **Session** (`config/session.php`):  
   - `'same_site' => 'none'`  
   - `'secure' => true` (wajib jika pakai HTTPS)

4. **Endpoint `/sanctum/csrf-cookie`** harus mengembalikan **token CSRF di response body** (JSON atau header),  
   karena di cross-origin FE tidak bisa baca cookie `XSRF-TOKEN` untuk mengisi `X-XSRF-TOKEN`.

Itu membutuhkan lebih banyak perubahan backend. **Exempt `api/login` dan `api/register` (token-based) lebih sederhana** dan sudah dipakai di FE sandbox.

---

## Ringkasan

| Opsi              | Perubahan backend utama                        | Perubahan frontend (sudah dilakukan)     |
|-------------------|-----------------------------------------------|------------------------------------------|
| **Token-based**   | Exempt `api/login`, `api/register` di CSRF    | Hapus `ensureCsrf` sebelum login/register |
| Cookie + CSRF     | CORS, Sanctum, session, + token di csrf-cookie| Pakai `ensureCsrf` + baca token dari API  |

Saran: pakai **token-based** dan exempt `api/login` + `api/register` di Laravel.

---

## Jika masih ada error CORS setelah exempt

Jika response 200 dari `/api/login` tidak bisa dibaca FE dan di console ada error CORS terkait credentials, uji di FE:

- Set `withCredentials: false` pada axios (di `src/lib/api.ts`) **atau**
- Override hanya untuk request login/register.

Kemudian pastikan `config/cors.php` mengizinkan origin `https://sandbox.gongkomodotour.com` (dengan atau tanpa `supports_credentials`).
