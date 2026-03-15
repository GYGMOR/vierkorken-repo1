/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "standalone", // DISABLED: Causes issues with static file serving

  // Rewrites for dynamic file serving (workaround for Next.js public directory caching)
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },

  // Performance Optimierungen
  reactStrictMode: true,

  // Compiler Optimierungen
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image Optimization
  images: {
    unoptimized: true, // Disable image optimization to fix permission issues with uploads
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
