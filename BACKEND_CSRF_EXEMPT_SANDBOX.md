# Backend: Exempt CSRF untuk Login & Register (Token-based, Sandbox)

## Penting: 419 itu dari BACKEND (Laravel), bukan frontend

**"Pindah token" di frontend tidak menghentikan 419.**  
CSRF dicek di **middleware Laravel** sebelum request sampai ke controller.  
Frontend hanya mengirim POST `/api/login`; yang memblokir dan membalas 419 adalah **VerifyCsrfToken** di backend.  

Supaya berhenti 419: **backend harus exempt** `api/login` dan `api/register` di `VerifyCsrfToken`.

---

## Perubahan di Laravel API (sandbox & production)

### 1. Exempt `api/login` dan `api/register` dari CSRF

---

#### Laravel 12 (dan 11) — lewat `bootstrap/app.php`

Edit **`bootstrap/app.php`** di project API.

- Cari blok **`->withMiddleware(function (Middleware $middleware) { ... })`**.
- Di **dalam** closure itu, tambahkan:

```php
$middleware->validateCsrfTokens(except: [
    'api/login',
    'api/register',
]);
```

**Contoh lengkap** — jika `withMiddleware` masih kosong:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->validateCsrfTokens(except: [
        'api/login',
        'api/register',
    ]);
})
```

Jika di dalam closure **sudah ada** baris lain, cukup **tambah** baris `validateCsrfTokens` tadi (tetap pakai `$middleware->`).

- Pastikan ada:  
  `use Illuminate\Foundation\Configuration\Middleware;`  
  (biasanya di atas `bootstrap/app.php`; kalau `Middleware` belum di‑import, tambahkan.)

Simpan file.

---

#### Laravel 10 / pakai `VerifyCsrfToken.php`

Edit **`app/Http/Middleware/VerifyCsrfToken.php`**, property **`$except`**:

```php
protected $except = [
    'api/login',
    'api/register',
];
```

---

#### Cek path route (kalau pakai prefix lain)

Di server API:

```bash
php artisan route:list --path=login
php artisan route:list --path=register
```

Sesuaikan isi `except` dengan URI yang muncul (mis. `api/v1/login` → pakai `'api/v1/login'`).

---

#### Setelah edit

```bash
php artisan config:clear
php artisan route:clear
# Lalu restart web/PHP (PHP-FPM, php artisan serve, atau reload cPanel Node/php)
```

Simpan, deploy ke **sandbox API** (`/home/gongkomo/sandbox.api.gongkomodotour.com/`), jalankan perintah di atas, lalu coba login lagi.

---

#### Laravel 12 — kalau masih 419

1. **Pastikan mengedit `bootstrap/app.php` yang dipakai**  
   Path: `.../sandbox.api.gongkomodotour.com/bootstrap/app.php` (di root project Laravel).

2. **Cek isi `withMiddleware`**  
   Kadang isinya `$middleware->use(...)` dll. Cukup **tambah** satu baris:
   ```php
   $middleware->validateCsrfTokens(except: ['api/login', 'api/register']);
   ```

3. **Coba exempt semua `api` (sementara, untuk tes):**
   ```php
   $middleware->validateCsrfTokens(except: ['api/*']);
   ```
   Kalau 419 hilang, artinya CSRF exempt jalan; perkecil lagi jadi `api/login` dan `api/register`.

4. **Jalankan di server:**
   ```bash
   cd /home/gongkomo/sandbox.api.gongkomodotour.com
   php artisan config:clear
   php artisan route:clear
   ```
   Lalu restart PHP/webserver (reload PHP-FPM, atau di cPanel: stop/start aplikasi).

5. **Cek route login/register**  
   `php artisan route:list` — pastikan ada route `api/login` / `api/register` dan tidak ada middleware lain yang memblokir.

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
