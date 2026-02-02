import type { NextConfig } from 'next'

// Constants for image optimization - device sizes
const DEVICE_SIZE_SM = 640
const DEVICE_SIZE_MD = 750
const DEVICE_SIZE_LG = 828
const DEVICE_SIZE_XL = 1080
const DEVICE_SIZE_2XL = 1200
const DEVICE_SIZE_3XL = 1920
const DEVICE_SIZE_4XL = 2048
const DEVICE_SIZE_5XL = 3840

// Constants for image optimization - image sizes
const IMAGE_SIZE_XS = 16
const IMAGE_SIZE_SM = 32
const IMAGE_SIZE_MD = 48
const IMAGE_SIZE_LG = 64
const IMAGE_SIZE_XL = 96
const IMAGE_SIZE_2XL = 128
const IMAGE_SIZE_3XL = 256
const IMAGE_SIZE_4XL = 384

// Constants for caching and file sizes
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS_PER_YEAR = 365
const BYTES_PER_KILOBYTE = 1024
const MAX_INLINE_IMAGE_SIZE_KB = 8

const nextConfig: NextConfig = {
  // Enable Cache Components (PPR replacement in Next.js 16)
  cacheComponents: true,

  // Enable Turbopack for development (faster builds)
  experimental: {
    // Server Actions (stable in Next.js 15+)
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // View Transitions API for smooth page transitions
    viewTransition: true,
    // Optimistic client cache
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    // Enable React Server Components
    serverComponentsExternalPackages: [],
    // Enable PPR (Partial Prerendering)
    ppr: true,
    // Enable dynamic IO
    dynamicIO: true,
    // Enable app directory optimizations
    appDir: true,
    // Enable Turbopack for development
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // TypeScript typed routes (stable in Next.js 15.5+)
  typedRoutes: true,

  // React Strict Mode for development
  reactStrictMode: true,

  // Image optimization with comprehensive settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [
      DEVICE_SIZE_SM,
      DEVICE_SIZE_MD,
      DEVICE_SIZE_LG,
      DEVICE_SIZE_XL,
      DEVICE_SIZE_2XL,
      DEVICE_SIZE_3XL,
      DEVICE_SIZE_4XL,
      DEVICE_SIZE_5XL,
    ],
    imageSizes: [
      IMAGE_SIZE_XS,
      IMAGE_SIZE_SM,
      IMAGE_SIZE_MD,
      IMAGE_SIZE_LG,
      IMAGE_SIZE_XL,
      IMAGE_SIZE_2XL,
      IMAGE_SIZE_3XL,
      IMAGE_SIZE_4XL,
    ],
    minimumCacheTTL: SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_YEAR, // 1 year
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
    // Enable image optimization for better performance
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for security, performance, and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
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
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Performance headers
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
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
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      // Preload critical resources
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: '</fonts/inter-var.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
          },
        ],
      },
    ]
  },

  // Redirects for old routes (if any)
  async redirects() {
    return []
  },

  // Rewrites for API proxying if needed
  async rewrites() {
    return []
  },

  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://baltzakis.dev',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // Compiler options for optimization
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
    // Enable styled-components optimization
    styledComponents: true,
  },

  // Output configuration for deployment
  output: 'standalone',

  // Compression and optimization settings
  compress: true,

  // SWC Minify settings
  swcMinify: true,

  // Custom webpack configuration for advanced optimizations
  webpack: (
    config,
    {
      buildId: _buildId,
      dev,
      isServer: _isServer,
      defaultLoaders: _defaultLoaders,
      webpack: _webpack,
    },
  ) => {
    // Optimize bundle size
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }

    // Add SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Optimize images
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp|avif)$/i,
      type: 'asset',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
      parser: {
        dataUrlCondition: {
          maxSize: MAX_INLINE_IMAGE_SIZE_KB * BYTES_PER_KILOBYTE, // 8kb
        },
      },
    })

    return config
  },
}

// Conditionally add bundle analyzer
if (process.env.ANALYZE === 'true') {
  nextConfig.experimental = {
    ...nextConfig.experimental,
    bundleAnalyzer: {
      enabled: true,
      openAnalyzer: true,
    },
  }
}

// Conditionally add development settings
if (process.env.NODE_ENV !== 'production') {
  nextConfig.fastRefresh = true
  nextConfig.telemetry = false
}

// Conditionally add production settings
if (process.env.NODE_ENV === 'production') {
  nextConfig.productionBrowserSourceMaps = true
  nextConfig.images = {
    ...nextConfig.images,
    unoptimized: false,
  }
}

export default nextConfig
