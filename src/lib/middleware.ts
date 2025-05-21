import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  // Jika user sudah login dan mencoba mengakses halaman auth, redirect ke dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Jika user belum login dan mencoba mengakses halaman yang membutuhkan auth
  if (isDashboardPage && !token) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    // Tambahkan header untuk mencegah caching
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    return response
  }

  return NextResponse.next()
}

// Konfigurasi path mana saja yang akan dihandle oleh middleware
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
} 