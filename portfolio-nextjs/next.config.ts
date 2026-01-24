import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cache Components (PPR replacement in Next.js 16)
  cacheComponents: true,

  // Enable Turbopack for production builds (Next.js 16+ feature)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // TypeScript typed routes (stable in Next.js 15.5+)
  typedRoutes: true,

  // React Strict Mode
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
  },

  // Enable experimental features for Next.js 16
  experimental: {
    // Server Actions (stable in Next.js 15+)
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // View Transitions API
    viewTransition: true,
    // Optimistic client cache
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for old routes
  async redirects() {
    return [];
  },

  // Rewrites for API proxying if needed
  async rewrites() {
    return [];
  },

  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://baltzakis.dev',
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Output configuration
  output: 'standalone',
};

export default nextConfig;
