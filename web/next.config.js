/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Always static export (disable SSR)
  output: 'export',
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
  }
};

export default nextConfig;