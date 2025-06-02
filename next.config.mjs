import { GenerateSW } from 'workbox-webpack-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ensure GenerateSW is only used on the client-side build
    if (!isServer) {
      // Remove previous instances of GenerateSW to prevent duplicates
      config.plugins = config.plugins.filter(plugin => !(plugin instanceof GenerateSW));

      config.plugins.push(
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          swDest: 'static/sw.js', // Correct path to avoid public folder conflicts
          maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20 MB
        })
      );
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kudya.pythonanywhere.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
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
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_API: process.env.NEXT_PUBLIC_BASE_API,
  },
};

export default nextConfig;
