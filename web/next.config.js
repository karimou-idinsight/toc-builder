/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove static export to support dynamic routes
  // output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true
  },
  // Proxy API calls to Express server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*'
      }
    ];
  },
  // Configure for monorepo structure
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  // App Router configuration
  appDir: true,
  // Remove trailing slashes since we're not using static export
  // trailingSlash: true
};

export default nextConfig;