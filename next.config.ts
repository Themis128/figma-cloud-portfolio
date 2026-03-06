import type { NextConfig } from "next";

// Constants for image optimization - device sizes
const DEVICE_SIZE_SM = 640;
const DEVICE_SIZE_MD = 750;
const DEVICE_SIZE_LG = 828;
const DEVICE_SIZE_XL = 1080;
const DEVICE_SIZE_2XL = 1200;
const DEVICE_SIZE_3XL = 1920;
const DEVICE_SIZE_4XL = 2048;
const DEVICE_SIZE_5XL = 3840;

// Constants for image optimization - image sizes
const IMAGE_SIZE_XS = 16;
const IMAGE_SIZE_SM = 32;
const IMAGE_SIZE_MD = 48;
const IMAGE_SIZE_LG = 64;
const IMAGE_SIZE_XL = 96;
const IMAGE_SIZE_2XL = 128;
const IMAGE_SIZE_3XL = 256;
const IMAGE_SIZE_4XL = 384;

// Constants for caching and file sizes
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_YEAR = 365;
const BYTES_PER_KILOBYTE = 1024;
const MAX_INLINE_IMAGE_SIZE_KB = 8;

const nextConfig: NextConfig = {
  // Turbopack configuration (Next.js 16+)
  turbopack: {
    root: __dirname,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    mcpServer: true,
    viewTransition: true,
    staleTimes: {
      dynamic: 30,
      static: 180,
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
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
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
    minimumCacheTTL:
      SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_YEAR, // 1 year
    localPatterns: [
      {
        pathname: "/images/**",
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
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },

  // Redirects for old routes (if any)
  async redirects() {
    return [];
  },

  // Proxy all /api/* routes to the Express backend dev server (port 3001)
  // In production, Amplify CloudFront rewrite rules handle this proxying to Lambda
  async rewrites() {
    if (process.env.NODE_ENV !== "production") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:3001/api/:path*",
        },
      ];
    }
    return [];
  },

  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || "https://baltzakis.dev",
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "1.0.0",
  },

  // Compiler options for optimization
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
    // Enable styled-components optimization
    styledComponents: true,
  },

  // Generate /about/index.html instead of /about.html for clean URL support on S3
  trailingSlash: true,

  // Static export for S3 + CloudFront hosting (production builds only)
  // Dev server needs full Next.js features (rewrites, headers, etc.)
  ...(process.env.NODE_ENV === "production" && { output: "export" as const }),

  // Compression and optimization settings
  compress: true,

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
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }

    // Add SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Optimize images
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp|avif)$/i,
      type: "asset",
      generator: {
        filename: "static/media/[name].[hash][ext]",
      },
      parser: {
        dataUrlCondition: {
          maxSize: MAX_INLINE_IMAGE_SIZE_KB * BYTES_PER_KILOBYTE, // 8kb
        },
      },
    });

    return config;
  },
};

// Bundle analyzer is now handled via @next/bundle-analyzer package
// To enable, run: ANALYZE=true npm run build

// Static export requires unoptimized images (no server-side processing)
if (process.env.NODE_ENV === "production") {
  nextConfig.images = {
    ...nextConfig.images,
    unoptimized: true,
  };
}

export default nextConfig;
