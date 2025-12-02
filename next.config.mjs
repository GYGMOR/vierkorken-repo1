/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint-Fehler blockieren den Build nicht
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript-Fehler blockieren den Build nicht
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  experimental: {
    optimizePackageImports: ['@/components'],
  },

  // Performance & Security
  poweredByHeader: false,
  compress: true,

  // React Strict Mode
  reactStrictMode: true,

  // No asset prefix for HTTPS server (assets served from same origin)
  assetPrefix: '',

  // Ensure proper base path
  basePath: '',
};

export default nextConfig;
