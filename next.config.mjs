import { GenerateSW } from 'workbox-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/media/**',
      },
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
  env: {
    NEXT_PUBLIC_BASE_API: process.env.NEXT_PUBLIC_BASE_API,
  },
  async rewrites() {
    return [
      { source: '/Doctors', destination: '/doctors' },
      { source: '/Doctors/:path*', destination: '/doctors/:path*' },
    ];
  },
};

export default nextConfig;
