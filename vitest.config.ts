import path from "node:path";
import react from "@vitejs/plugin-react-swc";
/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    setupFiles: ["./tests/vitest-setup.ts"],
    include: ["./tests/**/*.{spec,test}.{ts,tsx}"],
    exclude: ["./tests/app.spec.ts", "./tests/logo.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json", "html", "lcov", "cobertura"],
      reportsDirectory: "./coverage",
      // CRITICAL: Must include source files for coverage
      include: ["client/**/*.{ts,tsx}", "shared/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "coverage/**",
        "playwright-report/**",
        "test-results/**",
        "**/*.d.ts",
        "**/*.spec.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js,mjs,cjs}",
        "scripts/**",
        ".codacy/**",
        "amplify/**",
        "public/**",
        "docs/**",
        "server/**",
        "client/main.tsx",
        "client/vite-env.d.ts",
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 40,
          lines: 80,
          statements: 80,
        },
      },
      clean: true,
    },
    testTimeout: 10000,
    reporters: ["verbose"],
    // React 18 specific configuration
    deps: {
      optimizer: {
        web: {
          include: ["react", "react-dom"],
        },
      },
    },
    // Add resolve configuration for test environment - MOVED TO TOP LEVEL
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    global: "globalThis",
    "process.env.NODE_ENV": JSON.stringify("test"),
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    esbuildOptions: {
      target: "es2020",
    },
  },
  // React 18 compatibility fix
  esbuild: {
    target: "es2020",
  },
});
