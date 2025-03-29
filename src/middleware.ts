import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Cek apakah user mencoba mengakses halaman dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Cek apakah ada token di cookies
    const token = request.cookies.get('access_token')?.value
    console.log('All cookies:', request.cookies.getAll())
    console.log('Token value:', token)

    // Jika tidak ada token, redirect ke halaman login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

// Konfigurasi path mana saja yang akan dihandle oleh middleware
export const config = {
  matcher: ['/dashboard/:path*']
} 