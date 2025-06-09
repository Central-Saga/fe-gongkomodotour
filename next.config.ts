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
      }
    ],
    domains: ['localhost', 'lh3.googleusercontent.com'],
  },

  // eslint: {
  //   // Menonaktifkan ESLint saat proses `yarn build`
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   // Menonaktifkan pengecekan tipe TypeScript saat `yarn build`
  //   ignoreBuildErrors: true,
  // },

  // experimental: {
  //   workerThreads: false,
  //   cpus: 4,
  // }
};

export default nextConfig;
