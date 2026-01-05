/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  // Performance Optimierungen
  reactStrictMode: true,
  swcMinify: true,

  // Compiler Optimierungen
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,

  // Poweredby Header entfernen (Security)
  poweredByHeader: false,

  // Experimental Features für bessere Performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@microsoft/microsoft-graph-client', '@azure/identity', 'lucide-react'],
  },
};

module.exports = nextConfig;
