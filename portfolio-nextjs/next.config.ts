import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cache Components (PPR replacement in Next.js 16)
  cacheComponents: true,

  // Enable Turbopack for development (faster builds)
  experimental: {
    // Server Actions (stable in Next.js 15+)
    serverActions: {
      bodySizeLimit: "2mb",
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
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
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
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
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
          // Security headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Performance headers
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
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
      // Preload critical resources
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: "</fonts/inter-var.woff2>; rel=preload; as=font; type=font/woff2; crossorigin",
          },
        ],
      },
    ];
  },

  // Redirects for old routes (if any)
  async redirects() {
    return [];
  },

  // Rewrites for API proxying if needed
  async rewrites() {
    return [];
  },

  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://baltzakis.dev",
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

  // Output configuration for deployment
  output: "standalone",

  // Compression and optimization settings
  compress: true,

  // SWC Minify settings
  swcMinify: true,

  // Bundle analyzer for development
  ...(process.env.ANALYZE === "true" && {
    experimental: {
      ...nextConfig.experimental,
      bundleAnalyzer: {
        enabled: true,
        openAnalyzer: true,
      },
    },
  }),

  // Custom webpack configuration for advanced optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
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
          maxSize: 8 * 1024, // 8kb
        },
      },
    });

    return config;
  },

  // Development settings
  ...(dev && {
    // Enable fast refresh
    fastRefresh: true,
    // Disable telemetry in development
    telemetry: false,
  }),

  // Production settings
  ...(process.env.NODE_ENV === "production" && {
    // Enable source maps for debugging
    productionBrowserSourceMaps: true,
    // Optimize images in production
    images: {
      ...nextConfig.images,
      unoptimized: false,
    },
  }),
};

export default nextConfig;
