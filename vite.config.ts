import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, type PluginOption } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: 'client',
  publicDir: '../public',
  server: {
    host: 'localhost',
    port: 8081,
    strictPort: true,
    hmr: {
      port: 24679, // Use a different port for HMR
    },
    fs: {
      allow: ['.', '../client', '../shared'],
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '../server/**'],
    },
    // SPA routing support - serve index.html for all routes
    middlewareMode: false,
    // Proxy API requests to Express server (run with: npx tsx server/node-build.ts)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../dist/spa',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          utils: ['clsx', 'tailwind-merge', 'date-fns'],
          forms: ['react-hook-form', '@hookform/resolvers'],
        },
      },
    },
    // Performance budgets
    chunkSizeWarningLimit: 600, // Warn if chunks exceed 600kb
    reportCompressedSize: true,
    // Additional optimizations
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production for better performance
    cssCodeSplit: true, // Split CSS for better caching
    target: 'esnext', // Use modern JS for better performance
  },
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 85, effort: 6 },
      avif: { quality: 70, effort: 6 },
      include: /\.(png|jpe?g|webp|avif)$/i,
      exclude: /node_modules/,
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
      includeAssets: ['favicon.ico', 'logo.jpg', 'logo.jpeg', 'robots.txt'],
      srcDir: '../public',
      filename: 'sw.js',
      strategies: 'injectManifest',
      manifest: {
        name: 'Themistoklis Baltzakis - Cloud Architect',
        short_name: 'T. Baltzakis',
        description:
          'Cloud Architect & Cybersecurity Specialist - Professional portfolio showcasing 15+ years of IT expertise',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'en-US',
        dir: 'ltr',
        categories: ['productivity', 'developer-tools', 'business'],
        icons: [
          {
            src: 'logo.jpg',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'logo.jpg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Create New Agent',
            short_name: 'New Agent',
            description: 'Start building a new AI agent',
            url: '/product',
            icons: [{ src: 'logo.jpg', sizes: '96x96' }],
          },
          {
            name: 'View Portfolio',
            short_name: 'Portfolio',
            description: 'Explore my professional work',
            url: '/about',
            icons: [{ src: 'logo.jpg', sizes: '96x96' }],
          },
          {
            name: 'Contact Me',
            short_name: 'Contact',
            description: 'Get in touch for opportunities',
            url: '/contact',
            icons: [{ src: 'logo.jpg', sizes: '96x96' }],
          },
          {
            name: 'Performance Dashboard',
            short_name: 'Performance',
            description: 'Monitor app performance metrics',
            url: '/performance',
            icons: [{ src: 'logo.jpg', sizes: '96x96' }],
          },
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Themistoklis Baltzakis - Portfolio Interface',
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Themistoklis Baltzakis Mobile Interface',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean) as PluginOption[],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
}))