# Next.js 16 Configuration Guide

## Overview

This portfolio uses **Next.js 16** with the App Router, featuring modern configuration options for optimal performance, security, and developer experience.

## 🚀 Key Configuration Features

### Turbopack Integration

Next.js 16 introduces Turbopack as the default bundler, providing:

- **Faster builds**: Up to 10x faster than Webpack
- **Instant HMR**: Near-instantaneous hot module replacement
- **Optimized output**: Smaller bundle sizes

```typescript
// Turbopack configuration
turbopack: {
  root: __dirname,
},
```

### Experimental Features

#### Server Actions

Server Actions enable direct server-side form handling without API routes:

```typescript
experimental: {
  serverActions: {
    bodySizeLimit: "2mb", // 2MB file upload limit
  },
  viewTransition: true, // Enable view transitions
  staleTimes: {
    dynamic: 30, // 30 seconds for dynamic content
    static: 180, // 3 minutes for static content
  },
},
```

### TypeScript Integration

Next.js 16 provides stable TypeScript support:

```typescript
// TypeScript typed routes (stable in Next.js 15.5+)
typedRoutes: true,
```

## 🎨 Image Optimization

Comprehensive image optimization configuration for performance:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**", // Allow all HTTPS domains
    },
  ],
  formats: ["image/avif", "image/webp"], // Modern formats
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Responsive sizes
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Fixed sizes
  minimumCacheTTL: 31536000, // 1 year cache
  localPatterns: [{ pathname: "/images/**" }], // Local images
  dangerouslyAllowSVG: true, // SVG support
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
},
```

## 🔒 Security Headers

Comprehensive security configuration:

```typescript
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
```

## 🔄 Development Proxy

Development proxy for API routes:

```typescript
async rewrites() {
  if (process.env.NODE_ENV !== "production") {
    return [
      {
        source: "/api/playwright-autofix/:path*",
        destination: "http://localhost:3001/api/playwright-autofix/:path*",
      },
    ];
  }
  return [];
},
```

## 🌐 Environment Variables

Client-side environment variables:

```typescript
env: {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://baltzakis.dev",
  NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "1.0.0",
},
```

## ⚡ Compiler Optimizations

Production optimizations:

```typescript
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
```

## 📦 Output Configuration

Standalone deployment configuration:

```typescript
output: "standalone", // For AWS Amplify deployment
compress: true, // Enable compression
```

## 🔧 Webpack Configuration

Advanced webpack optimizations:

```typescript
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
        maxSize: 8192, // 8kb
      },
    },
  });

  return config;
},
```

## 🚀 Production Optimizations

Conditional production settings:

```typescript
if (process.env.NODE_ENV === "production") {
  nextConfig.images = {
    ...nextConfig.images,
    unoptimized: false,
  };
}
```

## 📋 Key Benefits

### Performance
- Turbopack for faster builds
- Optimized image loading
- Efficient caching strategies
- Bundle splitting for smaller downloads

### Security
- Comprehensive security headers
- Content Security Policy
- XSS protection
- Secure image handling

### Developer Experience
- TypeScript integration
- Hot module replacement
- Development proxy
- Environment variable support

### Deployment
- Standalone output for AWS Amplify
- Production optimizations
- Bundle analysis support
- Custom webpack configuration

## 🛠️ Customization Tips

### Adding New Features
1. Update `nextConfig` object
2. Add new experimental features as needed
3. Configure security headers appropriately
4. Test in both development and production

### Performance Tuning
1. Adjust image optimization settings
2. Configure caching strategies
3. Optimize bundle splitting
4. Monitor bundle sizes

### Security Hardening
1. Update security headers
2. Configure CSP policies
3. Add rate limiting
4. Implement additional security measures

## 📚 Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Turbopack Documentation](https://turbo.build/pack)
- [Image Optimization Guide](https://nextjs.org/docs/basic-features/image-optimization)
- [Security Headers Reference](https://owasp.org/www-project-secure-headers/)

---

**Note**: This configuration is optimized for Next.js 16 and AWS Amplify deployment. Adjust settings as needed for your specific use case.