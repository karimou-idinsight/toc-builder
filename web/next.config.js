/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static export for production builds
  output: 'export',
  // Configure output directory
  distDir: 'dist',
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  // Configure for monorepo structure
  experimental: {
    outputFileTracingRoot: process.cwd(),
  }
};

export default nextConfig;