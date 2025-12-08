import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'api.gongkomodotour.com',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
    domains: ['localhost', 'lh3.googleusercontent.com', 'api.gongkomodotour.com', 'picsum.photos', 'images.unsplash.com', 'source.unsplash.com', 'via.placeholder.com'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimasi cache untuk gambar
    minimumCacheTTL: 3600, // 1 jam cache untuk optimized images
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Tambahkan loader custom untuk handle timeout
    loader: 'default',
    // Disable optimization untuk remote images yang lambat (akan dihandle di component)
    unoptimized: false,
  },

  eslint: {
    // Menonaktifkan ESLint saat proses `yarn build`
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Menonaktifkan pengecekan tipe TypeScript saat `yarn build`
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.gongkomodotour.com/api/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
        // Cache headers untuk static assets (gambar, dll)
        source: '/img/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache headers untuk API responses (stale-while-revalidate)
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
    ];
  },

  // experimental: {
  //   workerThreads: false,
  //   cpus: 4,
  // }
};

export default nextConfig;
