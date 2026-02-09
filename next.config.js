/** @type {import('next').NextConfig} */
const nextConfig = {
  // Node.js Server Mode (kein statischer Export)
  // Erlaubt API Routes, SSR, Middleware
  output: 'standalone',
  
  // Powered by Header deaktivieren (Security)
  poweredByHeader: false,
  
  // Komprimierung aktivieren
  compress: true,
  
  // Images optimierung
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.edufunds.org',
      },
    ],
  },
  
  // Experimental Features
  experimental: {
    // Server Components optimierungen
    serverComponentsExternalPackages: ['pg'],
  },
  
  // Environment Variables für Build-Zeit
  env: {
    APP_VERSION: process.env.npm_package_version || '1.0.0',
  },
  
  // Headers für Security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Rewrites für API (falls nötig)
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
