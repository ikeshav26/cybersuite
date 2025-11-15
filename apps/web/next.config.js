/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/utils', '@repo/types'],
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
};

module.exports = nextConfig;
