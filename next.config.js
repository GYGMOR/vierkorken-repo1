// Fix: Node.js v22+ on Windows returns EISDIR from readlink() on regular files.
// enhanced-resolve only catches EINVAL as "not a symlink", so EISDIR crashes the build.
// We patch both async and sync readlink in fs and graceful-fs.
if (process.platform === 'win32') {
  const modules = ['fs', 'graceful-fs'].map(m => { try { return require(m); } catch { return null; } }).filter(Boolean);
  for (const fs of modules) {
    if (typeof fs.readlink === 'function') {
      const _readlink = fs.readlink.bind(fs);
      fs.readlink = (path, options, callback) => {
        if (typeof options === 'function') { callback = options; options = {}; }
        _readlink(path, options, (err, link) => {
          if (err && err.code === 'EISDIR') err.code = 'EINVAL';
          callback(err, link);
        });
      };
    }
    if (typeof fs.readlinkSync === 'function') {
      const _readlinkSync = fs.readlinkSync.bind(fs);
      fs.readlinkSync = (path, options) => {
        try { return _readlinkSync(path, options); }
        catch (err) { if (err.code === 'EISDIR') err.code = 'EINVAL'; throw err; }
      };
    }
  }
}

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
    optimizePackageImports: ['@microsoft/microsoft-graph-client', '@azure/identity', 'lucide-react'],
  },

};

module.exports = nextConfig;
