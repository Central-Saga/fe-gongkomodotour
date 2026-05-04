# Backend Laravel: Setup CSRF untuk SPA Cross-Origin (pakai CSRF, tidak exempt)

Frontend (sandbox.gongkomodotour.com) memakai **CSRF**: panggil `/api/csrf-token` dulu, dapat token di JSON, lalu kirim header `X-XSRF-TOKEN` + cookie (session) ke API. Auth tetap **Bearer**; CSRF dipakai untuk lindungi POST/PUT/DELETE.

**Jangan exempt `api/*`** — kita pakai CSRF.

---

## 1. Route: GET /api/csrf-token

Di cross-origin, FE **tidak bisa baca** cookie `XSRF-TOKEN` (domain API). Jadi backend harus **mengembalikan token di body JSON**.

Tambahkan di **`routes/web.php`** (supaya pakai session lewat middleware `web`):

```php
use Illuminate\Http\Request;

Route::get('/api/csrf-token', function (Request $request) {
    return response()->json(['csrf_token' => $request->session()->token()]);
})->middleware('web');
```

Atau di **`routes/api.php`** dengan middleware `web`:

```php
Route::get('/api/csrf-token', function (Request $request) {
    return response()->json(['csrf_token' => $request->session()->token()]);
})->middleware('web');
```

- GET tidak dicek CSRF di Laravel, jadi aman.
- Pastikan route ini **bukan** `api/*` yang tanpa session; harus pakai `web` (session).

---

## 2. CORS: `config/cors.php`

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [
    'https://sandbox.gongkomodotour.com',
    'https://gongkomodotour.com',  // production FE
],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,   // wajib
```

---

## 3. Sanctum: `config/sanctum.php`

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    ',sandbox.gongkomodotour.com,gongkomodotour.com'
))),
```

Sesuaikan domain FE (sandbox + production).

---

## 4. Session: `config/session.php`

Untuk cross-origin (FE dan API beda domain/subdomain), pakai:

```php
'secure' => true,        // wajib jika HTTPS
'same_site' => 'none',
```

- `domain` biarkan `null` atau sesuaikan kalau pakai subdomain yang sama.

---

## 5. Jangan exempt `api/*`

Jangan tambahkan `api/*` atau `api/login`/`api/register` ke:

- `validateCsrfTokens(except: [...])` di `bootstrap/app.php`, atau  
- `$except` di `VerifyCsrfToken`.

CSRF tetap dipakai untuk semua POST/PUT/PATCH/DELETE ke `api/*`.

---

## 6. Setelah ubah config

```bash
php artisan config:clear
php artisan route:clear
# Lalu restart PHP/webserver
```

---

## Alur

1. FE: `GET /api/csrf-token` (withCredentials) → dapat `{ "csrf_token": "..." }`, session + cookie XSRF-TOKEN diset.
2. FE: simpan `csrf_token`, pada tiap POST/PUT/PATCH/DELETE kirim header `X-XSRF-TOKEN` dan `withCredentials` (cookie session ikut).
3. Laravel: cocokkan `X-XSRF-TOKEN` dengan session → bila cocok, lolos CSRF.

Auth tetap pakai **Authorization: Bearer** dari `access_token` di localStorage.
