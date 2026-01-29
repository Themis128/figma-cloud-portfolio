import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type PluginOption } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Image optimization constants
const IMAGE_QUALITY_LOW = 70;
const IMAGE_QUALITY_MEDIUM = 75;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Detect CI/CD environment
  const isCI = process.env.CI || process.env.AMPLIFY_BUILD_CONFIG;

  return {
    root: "client",
    publicDir: "../public",
    server: {
      host: true,
      port: 3001, // Changed from 8081 to avoid conflicts
      strictPort: false, // Allow fallback ports
      hmr: {
        port: 24680, // Changed from 24679 to avoid conflicts with other Vite instances
      },
      // Proxy API requests to Express server during development/testing
      proxy:
        mode !== "production"
          ? {
              "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false,
              },
            }
          : undefined,
      fs: {
        allow: [".", "../client", "../shared"],
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "../server/**"],
      },
      // SPA routing support - serve index.html for all routes
      middlewareMode: false,
      // (proxy is configured above based on mode)
      // Security headers for development
      headers: {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.recaptcha.net https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://p.typekit.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.github.com https://www.google-analytics.com https://www.recaptcha.net https://www.gstatic.com wss://localhost:* ws://localhost:*; frame-src 'self' https://www.recaptcha.net; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
        "X-DNS-Prefetch-Control": "off",
      },
    },
    build: {
      outDir: "../dist/spa",
      rollupOptions: {
        output: {
          manualChunks: isCI
            ? undefined
            : {
                // Core framework chunk
                framework: ["react", "react-dom"],
                // Router chunk
                router: ["react-router-dom"],
                // UI components chunk
                ui: [
                  "@radix-ui/react-dialog",
                  "@radix-ui/react-dropdown-menu",
                  "@radix-ui/react-tooltip",
                  "@radix-ui/react-toast",
                  "@radix-ui/react-accordion",
                  "@radix-ui/react-popover",
                  "@radix-ui/react-select",
                  "@radix-ui/react-tabs",
                  "@radix-ui/react-toggle-group",
                  "lucide-react",
                  "sonner",
                ],
                // 3D graphics chunk
                three: ["three", "@react-three/fiber", "@react-three/drei"],
                // Utilities chunk
                utils: ["clsx", "tailwind-merge", "date-fns", "zod"],
                // Forms chunk
                forms: ["react-hook-form", "@hookform/resolvers"],
                // State management chunk
                state: ["@tanstack/react-query"],
                // Performance monitoring chunk
                performance: ["web-vitals"],
              },
        },
      },
      // Performance budgets
      chunkSizeWarningLimit: 500, // Reduced from 600kb for better performance
      reportCompressedSize: !isCI, // Disable in CI to save memory
      // Additional optimizations
      minify: "esbuild",
      sourcemap: false, // Disable sourcemaps in production for better performance
      cssCodeSplit: true, // Split CSS for better caching
      target: "esnext", // Use modern JS for better performance

      // Additional performance optimizations
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb
      cssTarget: ["chrome61", "firefox60", "safari11", "edge16"],

      // Tree shaking optimization
      terserOptions: isCI
        ? undefined
        : {
            compress: {
              drop_console: true, // Remove console logs in production
              drop_debugger: true,
              pure_funcs: ["console.log", "console.info", "console.debug"],
            },
          },
    },
    plugins: [
      react(),
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
              chromaSubsampling: "4:2:0",
            },
            include: /\.(png|jpe?g|webp|avif)$/i,
            exclude: /node_modules/,
            // Additional optimization options
            cache: true,
            cacheLocation: ".vite/image-cache",
          }),
      mode === "analyze"
        ? visualizer({
            filename: "dist/stats.html",
            open: true,
            gzipSize: true,
            brotliSize: true,
          })
        : undefined,
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "logo.jpg", "logo.jpeg", "robots.txt"],
        srcDir: "../public",
        filename: "sw.js",
        strategies: "injectManifest",
        manifest: {
          name: "Themistoklis Baltzakis Portfolio",
          short_name: "TB Portfolio",
          description: "Cloud Architect & Cybersecurity Specialist Portfolio",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "standalone",
          icons: [
            {
              src: "/logo.jpg",
              sizes: "192x192",
              type: "image/jpeg",
            },
            {
              src: "/logo.jpg",
              sizes: "512x512",
              type: "image/jpeg",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          // Handle SPA navigation routes
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//, /^\/_/, /^\/[^/?]+\.[^/]+$/],
        },
      }),
    ].filter(Boolean) as PluginOption[],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  };
});
