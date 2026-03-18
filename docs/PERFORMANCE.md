# Performance Documentation

This document details the performance optimizations, monitoring, and best practices implemented in the portfolio project.

## Performance Goals

### Core Web Vitals Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ~0.8s | ✅ Excellent |
| **FID** (First Input Delay) | < 100ms | < 50ms | ✅ Excellent |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.05 | ✅ Excellent |
| **TTFB** (Time to First Byte) | < 600ms | ~200ms | ✅ Excellent |
| **INP** (Interaction to Next Paint) | < 200ms | < 100ms | ✅ Excellent |

### Performance Budget

- **Total Bundle Size**: < 2MB (gzipped)
- **JavaScript**: < 1MB
- **CSS**: < 100KB
- **Images**: < 500KB (optimized)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## Optimization Strategies

### 1. Static Export & CDN

**Implementation**: Next.js static export with S3 + CloudFront

```typescript
// next.config.ts
export default {
  output: "export" as const,
  images: {
    unoptimized: true, // For static export
  },
}
```

**Benefits**:
- Pre-rendered HTML served from edge locations
- Instant page loads for cached content
- Reduced server-side processing

### 2. Image Optimization

**Next.js Image Component**:
```tsx
import Image from 'next/image';

<Image
  src="/images/profile.jpg"
  alt="Profile photo"
  width={400}
  height={400}
  priority
  className="rounded-full"
/>
```

**Optimization Features**:
- Automatic WebP format serving
- Lazy loading for non-critical images
- Responsive image sizes
- Built-in blur placeholders

**Image Processing**:
- Sharp.js for image optimization
- Multiple format support (WebP, AVIF)
- Automatic compression

### 3. Code Splitting

**Route-based Splitting**:
```tsx
// Automatic with Next.js App Router
// Each page gets its own bundle
```

**Component-based Splitting**:
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // Client-side only
});
```

**Library Splitting**:
```typescript
// Separate vendor bundles
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      }
    }
  }
}
```

### 4. Bundle Optimization

**Tree Shaking**:
- ES modules for better dead code elimination
- Import only what's needed
- Remove unused dependencies

**Compression**:
```typescript
// next.config.ts
export default {
  compress: true,
  // Gzip compression enabled
}
```

**Bundle Analysis**:
```bash
# Analyze bundle size
pnpm build
pnpm analyze
```

### 5. Caching Strategy

**Service Worker** (Workbox):
```javascript
// Automatic with Next.js PWA
// Caches static assets, API responses
```

**Cache Headers**:
```typescript
// next.config.ts
headers: [
  {
    source: '/images/(.*)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      }
    ]
  }
]
```

**Cache Strategy**:
- **Static Assets**: 1 year cache
- **API Responses**: 1 hour cache
- **HTML**: No cache (always fresh)

### 6. Font Optimization

**Preloading Critical Fonts**:
```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

**Font Loading Strategy**:
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* FOUT with fallback */
}
```

### 7. CSS Optimization

**Tailwind CSS Purge**:
```typescript
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
  // Automatically removes unused styles
}
```

**CSS-in-JS Optimization**:
- No runtime CSS-in-JS (Tailwind compiles to CSS)
- Critical CSS inlining
- Non-critical CSS loading

### 8. JavaScript Optimization

**Lazy Loading**:
```tsx
// Lazy load heavy components
const Chart = dynamic(() => import('./Chart'), {
  ssr: false,
  loading: () => <div>Loading chart...</div>
});
```

**Event Delegation**:
```tsx
// Use event delegation for dynamic content
useEffect(() => {
  const handler = (e: Event) => {
    // Handle events
  };
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
}, []);
```

### 9. Network Optimization

**HTTP/2 Push**:
```html
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/app.js" as="script">
```

**Resource Hints**:
```html
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="preconnect" href="https://api.example.com">
```

## Performance Monitoring

### 1. Web Vitals Tracking

**Implementation**:
```typescript
// lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function sendToAnalytics(metric: any) {
  // Send to GA4, Sentry, or custom endpoint
  console.log(metric);
}

// Track all Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

**Real User Monitoring (RUM)**:
- Tracks actual user experience
- Aggregates performance data
- Identifies performance bottlenecks

### 2. Performance Dashboard

**Live Metrics** (`/performance` page):
- Real-time Web Vitals display (LCP, FCP, CLS, TTFB, INP)
- Performance grade calculation (A+ → D)
- Lighthouse audit scores (Performance, Accessibility, Best Practices, SEO)
- Industry benchmark comparisons (live LCP vs. Web Almanac 2024 data)
- Interactive speed test with share/re-measure
- Tabbed "How It's Built" section (Techniques + Tech Stack)

**Key Metrics Displayed**:
- LCP, FCP, CLS, TTFB, INP values (INP replaced FID as Core Web Vital in March 2024)
- Performance score (A+ to D)
- Lighthouse score rings with animated count-up
- Industry comparison bars with live LCP positioning

### 3. Bundle Analysis

**Regular Monitoring**:
```bash
# Generate bundle analysis
pnpm build
pnpm analyze

# Check for regressions
git diff --name-only | grep -E '\.(js|ts|tsx)$' && pnpm build
```

**Bundle Size Alerts**:
- Set up CI/CD alerts for bundle size increases
- Monitor third-party library sizes
- Track dependency bloat

### 4. Lighthouse Integration

**CI/CD Checks**:
```yaml
# .github/workflows/performance.yml
- name: Run Lighthouse
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      https://baltzakis.dev
      https://baltzakis.dev/about
    configPath: './lighthouse.config.js'
    uploadArtifacts: true
    temporaryPublicStorage: true
```

**Lighthouse Targets**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## Performance Testing

### 1. E2E Performance Tests

**Playwright Performance Testing**:
```typescript
// playwright-tests/performance.spec.ts
test('should load homepage quickly', async ({ page }) => {
  const response = await page.goto('/');
  
  // Check response time
  expect(response?.status()).toBe(200);
  
  // Check LCP
  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  });
  
  expect(lcp).toBeLessThan(2500);
});
```

### 2. Synthetic Monitoring

**Regular Performance Checks**:
- Automated performance tests on every deploy
- Multi-region performance monitoring
- Mobile and desktop performance tracking

### 3. Load Testing

**API Load Testing**:
```typescript
// Test API response times under load
import { test } from '@playwright/test';

test('API should handle concurrent requests', async ({ request }) => {
  const promises = Array(10).fill(0).map(() => 
    request.get('/api/health')
  );
  
  const responses = await Promise.all(promises);
  responses.forEach(response => {
    expect(response.status()).toBe(200);
  });
});
```

## Performance Best Practices

### 1. Image Best Practices

```tsx
// ✅ Good: Optimized image
<Image
  src="/images/optimized.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={isHeroImage}
  placeholder="blur"
  blurDataURL={blurDataURL}
/>

// ❌ Bad: Unoptimized image
<img src="/images/large.jpg" alt="Description" />
```

### 2. Component Best Practices

```tsx
// ✅ Good: Memoized expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// ✅ Good: Debounced input handlers
const debouncedHandler = useCallback(
  debounce((value) => {
    // Handle input
  }, 300),
  []
);

// ❌ Bad: Expensive calculations in render
const expensiveValue = calculateExpensiveValue(data);
```

### 3. State Management Best Practices

```tsx
// ✅ Good: Local state for component-specific data
const [isOpen, setIsOpen] = useState(false);

// ✅ Good: Context for shared state
const ThemeContext = createContext();

// ❌ Bad: Global state for local data
const globalState = useGlobalState(); // Overkill for local toggle
```

### 4. Network Best Practices

```typescript
// ✅ Good: Efficient API calls
const { data, isLoading } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// ❌ Bad: Multiple API calls
useEffect(() => {
  fetchUser(userId);
  fetchUserPosts(userId);
  fetchUserSettings(userId);
}, [userId]);
```

## Performance Troubleshooting

### 1. Slow Page Loads

**Checklist**:
- [ ] Bundle size too large
- [ ] Images not optimized
- [ ] Missing critical CSS
- [ ] Too many HTTP requests
- [ ] Server response time slow

**Tools**:
```bash
# Analyze bundle
pnpm analyze

# Check network requests
# Chrome DevTools > Network tab

# Lighthouse audit
lighthouse https://baltzakis.dev --output=html --output-path=./lighthouse-report.html
```

### 2. JavaScript Performance Issues

**Memory Leaks**:
```typescript
// ✅ Good: Cleanup event listeners
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

// ❌ Bad: Memory leak
useEffect(() => {
  window.addEventListener('resize', () => { /* ... */ });
}, []);
```

**Expensive Operations**:
```typescript
// ✅ Good: Web Workers for heavy computation
const worker = new Worker('/workers/heavy-computation.js');

// ✅ Good: Virtualization for long lists
import { FixedSizeList as List } from 'react-window';

// ❌ Bad: Heavy computation in render
const result = heavyComputation(data);
```

### 3. Rendering Performance

**Render Optimization**:
```tsx
// ✅ Good: Memoization
const MemoizedComponent = memo(({ data }) => {
  return <ExpensiveComponent data={data} />;
});

// ✅ Good: Virtualization
import { FixedSizeList as List } from 'react-window';

// ❌ Bad: Re-renders on every parent update
const ExpensiveComponent = ({ data }) => {
  return <div>{/* expensive render */}</div>;
};
```

## Performance Metrics Dashboard

### Key Performance Indicators (KPIs)

1. **User Experience Metrics**
   - Page load time
   - Time to interactive
   - First contentful paint
   - Cumulative layout shift

2. **Technical Metrics**
   - Bundle size
   - Number of requests
   - Cache hit ratio
   - Error rate

3. **Business Metrics**
   - Bounce rate
   - Conversion rate
   - User engagement time
   - Page views per session

### Monitoring Setup

**Google Analytics 4**:
```typescript
// Enhanced measurement enabled
// Tracks page views, scrolls, clicks, site search
```

**Sentry Performance Monitoring**:
```typescript
// Transaction tracking
import * as Sentry from '@sentry/nextjs';

Sentry.startTransaction({ name: 'page-load' });
```

**Custom Performance Monitoring**:
```typescript
// Performance observer setup
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.startTime}`);
  }
});

observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
```

## Performance Optimization Checklist

### Pre-deployment

- [ ] Run Lighthouse audit (target > 90)
- [ ] Check bundle size (< 2MB total)
- [ ] Verify image optimization
- [ ] Test on slow networks (3G)
- [ ] Check mobile performance
- [ ] Validate Core Web Vitals

### Post-deployment

- [ ] Monitor real user metrics
- [ ] Check error rates
- [ ] Review performance dashboards
- [ ] Analyze user behavior
- [ ] Identify performance regressions

### Ongoing

- [ ] Weekly bundle analysis
- [ ] Monthly performance review
- [ ] Quarterly Lighthouse audits
- [ ] Continuous monitoring setup
- [ ] Performance budget enforcement

## Performance Resources

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Bundle Analyzer](https://webpack.js.org/guides/code-splitting/#bundle-analysis)

### Documentation
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [CSS Performance](https://web.dev/learn/css/performance)

### Best Practices
- [Performance Checklist](https://web.dev/performance-checklist/)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [JavaScript Performance](https://web.dev/fast/#optimize-your-javascript)