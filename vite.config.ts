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
      port: 24680, // Use a different port for HMR
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
      manifest: {
        name: 'Themistoklis Baltzakis Portfolio',
        short_name: 'TB Portfolio',
        description: 'Cloud Architect & Cybersecurity Specialist Portfolio',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
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
                maxAgeSeconds: 60 * 60 * 24 * 365,
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
                maxAgeSeconds: 60 * 60 * 24 * 365,
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
                maxAgeSeconds: 60 * 60 * 24 * 30,
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
                maxAgeSeconds: 60 * 60 * 24 * 7,
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
