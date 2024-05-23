/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["ludmil.pythonanywhere.com", "127.0.0.1", "play.google.com", "developer.apple.com"],
  },
  env: {
    NEXT_PUBLIC_BASE_API: process.env.NEXT_PUBLIC_BASE_API,
  },
};

export default nextConfig;
