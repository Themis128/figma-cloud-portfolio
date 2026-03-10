# 🖼️ Image Optimization Guide

This document outlines the comprehensive image optimization implementation for this portfolio project.

## 📋 Overview

The image optimization system provides:

- **Responsive Images**: Automatic format selection (WebP/AVIF with PNG/JPEG fallbacks)
- **Lazy Loading**: Intersection Observer-based loading for performance
- **Build-time Optimization**: Next.js Image component with automatic optimization
- **Runtime Optimization**: `next/image` component with loading states

## 🛠️ Implementation Details

### 1. Build-time Optimization (Next.js Image)

**Component**: `next/image`
**Config**: `next.config.ts` (image optimization settings)

```typescript
ViteImageOptimizer({
  // Aggressive compression for maximum savings
  png: {
    quality: 70,
    compressionLevel: 9,
    palette: true,
    colors: 128, // Limit color palette
  },
  jpeg: {
    quality: 70,
    progressive: true,
    mozjpeg: true,
    dcScanOpt: 2,
    smooth: 10,
  },
  jpg: {
    quality: 70,
    progressive: true,
    mozjpeg: true,
    dcScanOpt: 2,
    smooth: 10,
  },
  webp: {
    quality: 75,
    effort: 6,
    smartSubsample: true,
    nearLossless: false,
  },
  avif: {
    quality: 60,
    effort: 6,
    chromaSubsampling: "4:2:0",
  },
  include: /\.(png|jpe?g|webp|avif)$/i,
  exclude: /node_modules/,
  // Additional optimization options
  cache: true,
  cacheLocation: ".vite/image-cache",
});
```

**Features**:

- Automatic WebP/AVIF generation during build
- Quality optimization (80% for PNG/JPEG, 85% for WebP, 70% for AVIF)
- Excludes node_modules for faster builds

### 2. Runtime Components

#### OptimizedImage Component

**Location**: `client/components/OptimizedImage.tsx`

**Features**:

- Automatic format selection with `<picture>` element
- Lazy loading with Intersection Observer
- Loading states and skeleton placeholders
- Error handling and fallbacks

**Usage**:

```tsx
<OptimizedImage
  src="/logo.jpg"
  alt="Logo"
  width={200}
  height={100}
  priority={true} // For above-the-fold images
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

#### useLazyImage Hook

**Location**: `client/hooks/useLazyImage.ts`

**Features**:

- Intersection Observer for lazy loading
- Configurable root margin and threshold
- Loading state management

### 3. Navigation Integration

The Navigation component has been updated to use the OptimizedImage component:

```tsx
<OptimizedImage
  src="/logo.jpg"
  alt="Themistoklis Baltzakis Logo"
  width={40}
  height={40}
  className="w-8 h-8 md:w-10 md:h-10 rounded-lg transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-cyan-500/20"
  priority={true}
  fallbackSrc="/logo.jpg"
/>
```

## 📊 Performance Benefits

### Optimization Results

**Current Performance** (as of January 26, 2026):

- **Total Savings**: 16.54 kB / 64.59 kB = **26% reduction**
- **JPEG Optimization**: -30% (22.35 kB → 15.78 kB)
- **WebP Optimization**: -10% (11.96 kB → 10.80 kB)
- **AVIF Optimization**: -29% (7.94 kB → 5.69 kB)

### Before vs After

**Before Optimization** (1% savings):

- Logo JPEG: 22.35 kB → 23.57 kB (actually increased)
- Poor compression settings
- No advanced optimization features

**After Optimization** (26% savings):

- Aggressive quality settings (70% instead of 80%)
- Progressive JPEG with mozjpeg
- Advanced PNG compression with palette optimization
- Smart WebP/AVIF encoding
- Build caching for faster rebuilds

## 🏃‍♂️ Usage Instructions

### Development

1. **Run optimization script**:

   ```bash
   pnpm optimize-images
   ```

2. **Check image sizes**:
   - Script reports current image sizes
   - Identifies optimization opportunities

### Production Build

Images are automatically optimized during the Vite build process:

```bash
pnpm build
```

The Vite Image Optimizer plugin will:

- Compress images based on configured quality settings
- Generate WebP and AVIF versions
- Maintain original files as fallbacks

## 🔧 Configuration

### Image Optimization Settings

Located in `next.config.ts` (image settings) and build pipeline:

```typescript
ViteImageOptimizer({
  // PNG optimization
  png: {
    quality: 80, // 0-100
  },
  // JPEG optimization
  jpeg: {
    quality: 80,
    progressive: true,
  },
  // WebP generation
  webp: {
    quality: 85,
    effort: 6, // 0-6 (higher = better compression, slower)
  },
  // AVIF generation
  avif: {
    quality: 70,
    effort: 6,
  },
});
```

### Component Props

**OptimizedImage Props**:

- `src`: Image source path
- `alt`: Alt text for accessibility
- `className`: CSS classes
- `width/height`: Dimensions for aspect ratio
- `sizes`: Responsive sizes attribute
- `priority`: Load immediately (for above-the-fold)
- `placeholder`: Low-quality placeholder image
- `fallbackSrc`: Fallback image source

## 📈 Monitoring & Analytics

### Image Loading Performance

The implementation includes:

- Loading state tracking
- Error handling with fallbacks
- Performance monitoring hooks

### Build Analysis

Use the bundle analyzer to monitor image sizes:

```bash
pnpm build:analyze
```

## 🚀 Future Enhancements

### Potential Improvements

1. **Advanced Lazy Loading**:
   - Blur-to-sharp transitions
   - Progressive JPEG loading
   - Content-aware cropping

2. **CDN Integration**:
   - Cloudinary, Imgix, or similar services
   - Automatic responsive image generation
   - Real-time optimization

3. **Advanced Formats**:
   - JPEG XL support
   - HEIC format support
   - Video formats for animated images

4. **Performance Monitoring**:
   - Largest Contentful Paint (LCP) tracking
   - Image loading performance metrics
   - Automated optimization suggestions

## 🐛 Troubleshooting

### Common Issues

1. **Sharp Not Installed**:
   - Script falls back to basic file size reporting
   - Install with: `pnpm add -D sharp`

2. **Build Performance**:
   - Large images slow down builds
   - Consider pre-optimizing large assets

3. **Browser Support**:
   - AVIF has limited browser support
   - WebP has good support (90%+)
   - PNG/JPEG fallbacks always available

### Debug Commands

```bash
# Check current image sizes
pnpm optimize-images

# Analyze bundle with images
pnpm build:analyze

# Test in development
pnpm dev
```

## 📚 Resources

- [WebP Format Guide](https://developers.google.com/speed/webp)
- [AVIF Format Guide](https://aomediacodec.github.io/avif/)
- [Responsive Images Guide](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

**Last Updated**: January 19, 2026
**Status**: ✅ Complete
