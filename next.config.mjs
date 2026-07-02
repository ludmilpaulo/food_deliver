import { GenerateSW } from 'workbox-webpack-plugin';

const isProd = process.env.NODE_ENV === 'production';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
];

const devImagePatterns = isProd
  ? []
  : [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer && config.plugins) {
      config.plugins = config.plugins.filter((p) => !(p instanceof GenerateSW));
      config.plugins.push(
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          swDest: 'static/sw.js',
          maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        })
      );
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.kudya.store',
        pathname: '/**',
      },
      ...devImagePatterns,
      {
        protocol: 'https',
        hostname: 'play.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'developer.apple.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kudya-api.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.kudya.shop',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kudya.shop',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  env: {
    NEXT_PUBLIC_BASE_API: process.env.NEXT_PUBLIC_BASE_API,
  },
  async rewrites() {
    return [
      { source: '/Doctors', destination: '/doctors' },
      { source: '/Doctors/:path*', destination: '/doctors/:path*' },
      { source: '/admin/drivers', destination: '/Admin/drivers' },
      { source: '/admin/drivers/:path*', destination: '/Admin/drivers/:path*' },
      { source: '/admin', destination: '/Admin' },
      { source: '/admin/:path*', destination: '/Admin/:path*' },
    ];
  },
};

export default nextConfig;
