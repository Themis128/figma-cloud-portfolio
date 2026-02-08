import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, type PluginOption } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Image optimization constants
const IMAGE_QUALITY_LOW = 70
const IMAGE_QUALITY_MEDIUM = 75

// Time constants for caching
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const DAYS_PER_YEAR = 365
const DAYS_PER_MONTH = 30
const MINUTES_PER_CACHE_DURATION = 5
const CACHE_DURATION_5_MINUTES = SECONDS_PER_MINUTE * MINUTES_PER_CACHE_DURATION
const CACHE_DURATION_1_YEAR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_YEAR
const CACHE_DURATION_30_DAYS =
  SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_MONTH

// Helper functions for chunk and asset naming
const getChunkNameFromFacade = (facadeModuleId: string, chunkName?: string): string | null => {
  // Page-level chunks
  if (facadeModuleId.includes('pages/')) {
    const pageName = chunkName || 'page'
    return `pages/${pageName.toLowerCase()}.[hash].js`
  }

  // Component-level chunks
  if (facadeModuleId.includes('components/')) {
    const componentName = chunkName || 'component'
    return `components/${componentName.toLowerCase()}.[hash].js`
  }

  // Feature-level chunks
  if (facadeModuleId.includes('features/')) {
    const featureName = chunkName || 'feature'
    return `features/${featureName.toLowerCase()}.[hash].js`
  }

  // Library chunks
  if (facadeModuleId.includes('lib/')) {
    const libName = chunkName || 'lib'
    return `lib/${libName.toLowerCase()}.[hash].js`
  }

  // Hook chunks
  if (facadeModuleId.includes('hooks/')) {
    const hookName = chunkName || 'hook'
    return `hooks/${hookName.toLowerCase()}.[hash].js`
  }

  return null
}

const isVendorChunk = (chunkName?: string): boolean => {
  return !!(chunkName && ['react-core', 'ui', 'charts', 'three'].includes(chunkName))
}

const getAssetFileName = (name: string): string => {
  // CSS files
  if (name.endsWith('.css')) {
    return 'css/[name].[hash].[ext]'
  }

  // Images with type-based organization
  if (name.match(/\.(png|jpe?g|svg|gif|webp|avif)$/i)) {
    return 'images/[name].[hash].[ext]'
  }

  // Fonts
  if (name.match(/\.(woff2?|eot|ttf|otf)$/i)) {
    return 'fonts/[name].[hash].[ext]'
  }

  // Audio/Video
  if (name.match(/\.(mp3|mp4|webm|ogg|wav)$/i)) {
    return 'media/[name].[hash].[ext]'
  }

  // Documents
  if (name.match(/\.(pdf|doc|docx|txt)$/i)) {
    return 'documents/[name].[hash].[ext]'
  }

  return 'assets/[name].[hash].[ext]'
}
export default defineConfig(({ mode }) => {
  // Detect CI/CD environment
  const isCI = process.env['CI'] || process.env['AMPLIFY_BUILD_CONFIG']

  return {
    root: 'client',
    publicDir: '../public',
    define: {
      'process.env': {},
      process: { env: {} },
    },
    server: {
      host: true,
      port: 8081, // Frontend port as per architecture
      strictPort: true, // Fail if port is in use instead of using another port
      hmr: {
        port: 24681, // HMR port to avoid conflicts
      },
      // Proxy API requests to Express server during development/testing
      proxy:
        mode !== 'production'
          ? {
              '/api': {
                target: 'http://localhost:3002',
                changeOrigin: true,
                secure: false,
              },
            }
          : undefined,
      fs: {
        allow: ['.', '../client', '../shared'],
        deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '../server/**'],
      },
      // SPA routing support - serve index.html for all routes
      middlewareMode: false,
      // (proxy is configured above based on mode)
      // Security headers for development
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://www.recaptcha.net https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://p.typekit.net; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.github.com https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://www.recaptcha.net https://www.gstatic.com wss://localhost:* ws://localhost:*; frame-src 'self' https://www.recaptcha.net; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
        'X-DNS-Prefetch-Control': 'off',
        // Network performance headers
        'X-Accel-Buffering': 'no', // Disable buffering for better TTFB
        'Accept-Encoding': 'gzip, deflate, br', // Explicit compression support
      },
    },
    build: {
      outDir: '../dist/spa',
      rollupOptions: {
        output: {
          manualChunks: isCI
            ? undefined
            : {
                // Core React chunk - highest priority
                'react-core': ['react', 'react-dom'],

                // Router chunk - navigation critical
                router: ['react-router-dom'],

                // UI library - design system components
                ui: [
                  '@radix-ui/react-dialog',
                  '@radix-ui/react-dropdown-menu',
                  '@radix-ui/react-tooltip',
                  '@radix-ui/react-toast',
                  '@radix-ui/react-accordion',
                  '@radix-ui/react-popover',
                  '@radix-ui/react-select',
                  '@radix-ui/react-tabs',
                  '@radix-ui/react-toggle-group',
                  'lucide-react',
                  'sonner',
                ],

                // 3D graphics - heavy chunk, lazy load
                three: ['three', '@react-three/fiber', '@react-three/drei'],

                // Utilities - shared across components
                utils: ['clsx', 'tailwind-merge', 'date-fns', 'zod'],

                // Forms - feature-specific
                forms: ['react-hook-form', '@hookform/resolvers'],

                // State management
                state: ['@tanstack/react-query'],

                // Performance monitoring
                performance: ['web-vitals'],

                // Animation libraries - split for lazy loading
                animations: ['framer-motion', 'lottie-web'],

                // Chart libraries - heavy, component-specific
                charts: ['recharts'],

                // PDF and document processing
                // 'pdf-utils': ['jspdf', 'html2canvas'], // Temporarily disabled - dependencies not installed

                // Real-time features (Socket.IO)
                realtime: ['socket.io-client'],

                // Development utilities
                ...(mode === 'development' && {
                  devtools: ['@redux-devtools/extension', 'react-error-boundary'],
                }),
              },

          // Enhanced chunk naming with better organization
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId

            if (facadeModuleId) {
              const chunkName = getChunkNameFromFacade(facadeModuleId, chunkInfo.name)
              if (chunkName) return chunkName
            }

            // Vendor chunks get special naming
            if (isVendorChunk(chunkInfo.name)) {
              return `vendor/${chunkInfo.name}.[hash].js`
            }

            // Default chunks
            return 'chunks/[name].[hash].js'
          },

          // Enhanced asset naming
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || 'asset'
            return getAssetFileName(name)
          },
        },

        // Advanced tree shaking for React 19
        treeshake: {
          moduleSideEffects: (id, _external) => {
            // Preserve CSS imports
            if (id.includes('.css') || id.includes('.scss') || id.includes('.less')) {
              return true
            }

            // Preserve polyfills
            if (id.includes('polyfill') || id.includes('core-js')) {
              return true
            }

            // Preserve service worker registration
            if (id.includes('sw.js') || id.includes('workbox')) {
              return true
            }

            // Remove side effects from utility libraries
            if (id.includes('lodash') || id.includes('ramda') || id.includes('date-fns')) {
              return false
            }

            // React 19 specific optimizations
            if (id.includes('react-dom/client') || id.includes('react/jsx-runtime')) {
              return true
            }

            return true
          },

          // Functions that can be safely removed if unused
          pure: ['console.log', 'console.info', 'console.warn', 'console.debug', 'console.trace'],

          // Enable aggressive unused export removal
          unusedExports: true,
        },

        // External dependencies (for library builds)
        external: (_id) => {
          // Don't externalize anything in application builds
          return false
        },
      },
      // Performance budgets with React 19 considerations
      chunkSizeWarningLimit: 500, // Keep chunks small for better loading
      reportCompressedSize: !isCI, // Skip in CI to save memory

      // Advanced optimizations
      minify: 'esbuild', // Faster than terser, good quality
      sourcemap: false, // Disable for production performance
      cssCodeSplit: true, // Better caching with split CSS
      target: 'esnext', // Modern JS for React 19 features

      // Network optimizations
      compress: true, // Enable compression

      // Asset handling
      assetsInlineLimit: 4096, // Inline smaller assets
      cssTarget: ['chrome91', 'firefox89', 'safari14', 'edge91'], // Modern CSS

      // Advanced terser options for production
      terserOptions: {
        compress: {
          drop_console: false, // Keep console in development
          drop_debugger: true,
          pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
          passes: 2, // Multiple passes for better compression
        },
        mangle: {
          properties: {
            regex: /^_[a-zA-Z]/, // Mangle private properties
          },
        },
        format: {
          comments: false, // Remove comments
        },
      },

      // Enhanced CSS minimization
      cssMinify: 'esbuild',

      // Improve build performance
      emptyOutDir: true,
      copyPublicDir: true,
      watch:
        mode === 'development'
          ? {
              exclude: ['node_modules/**', 'dist/**', 'coverage/**'],
            }
          : null,
    },
    plugins: [
      react({
        jsxImportSource: 'react',
      }),
      isCI
        ? undefined
        : ViteImageOptimizer({
            // Aggressive compression for maximum savings
            png: {
              quality: IMAGE_QUALITY_LOW,
              compressionLevel: 9,
              palette: true,
              colors: 128, // Limit color palette
            },
            jpeg: {
              quality: IMAGE_QUALITY_LOW,
              progressive: true,
              mozjpeg: true,
            },
            jpg: {
              quality: IMAGE_QUALITY_LOW,
              progressive: true,
              mozjpeg: true,
            },
            webp: {
              quality: IMAGE_QUALITY_MEDIUM,
              effort: 6,
              smartSubsample: true,
              nearLossless: false,
            },
            avif: {
              quality: IMAGE_QUALITY_LOW,
              effort: 6,
              chromaSubsampling: '4:2:0',
            },
            include: /\.(png|jpe?g|webp|avif)$/i,
            exclude: /node_modules/,
            // Additional optimization options
            cache: false, // Disable cache to avoid path issues
          }),
      mode === 'analyze'
        ? visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
          })
        : undefined,
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'logo.jpg', 'logo.jpeg', 'robots.txt', '*.woff2'],
        srcDir: '../public',
        filename: 'sw.js',
        strategies: 'injectManifest',
        devOptions: {
          enabled: false, // Disabled in dev to avoid ServiceWorker errors
          type: 'module',
        },
        manifest: {
          name: 'Themistoklis Baltzakis Portfolio',
          short_name: 'TB Portfolio',
          description: 'Cloud Architect & Cybersecurity Specialist Portfolio with AI Agents',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          categories: ['productivity', 'business', 'technology'],
          lang: 'en-US',
          icons: [
            {
              src: '/logo.jpg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'maskable',
            },
            {
              src: '/logo.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff2,woff}'],
          // Advanced caching strategies
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: CACHE_DURATION_1_YEAR, // 1 year
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: CACHE_DURATION_1_YEAR,
                },
              },
            },
            {
              urlPattern: /\/api\/.*\.(json)$/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: CACHE_DURATION_5_MINUTES, // 5 minutes
                },
                networkTimeoutSeconds: 10,
              },
            },
            {
              urlPattern: /.*\.(png|jpg|jpeg|svg|gif|webp|avif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: CACHE_DURATION_30_DAYS, // 30 days
                },
              },
            },
            {
              urlPattern: /.*\.(js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
              },
            },
          ],
          // Handle SPA navigation routes
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/_/, /^\/[^/?]+\.[^/]+$/],
          // Enhanced offline support
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
        },
      }),
    ].filter(Boolean) as PluginOption[],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './client'),
        '@shared': path.resolve(__dirname, './shared'),
      },
    },
  }
})
