import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  // ── Ignored paths ───────────────────────────────────────────────────────────
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "public/**",
      "amplify/**",
      "docs/**",
      "playwright-tests/**",
      // Legacy Vite SPA (pre-migration artefacts, not part of Next.js build)
      "client/**",
      // Server-side and tooling files with pre-existing issues
      "server/**",
      "cline-hooks/**",
      "shared/**",
      "scripts/**",
      // Next.js internal/generated routes outside the main tsconfig project
      "src/app/.well-known/**",
      // Config files handled by their own parsers
      "*.config.mjs",
      "*.config.ts",
      "*.config.js",
      "*.config.shared.ts",
      "vite.config.ts",
      "vitest.config.ts",
      "tailwind.config.ts",
      "postcss.config.mjs",
    ],
  },

  // ── Next.js src — TypeScript + React ────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        // Point at the root tsconfig so the parser resolves paths correctly
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // ── TypeScript ───────────────────────────────────────────────────────
      // Disable the base rule — @typescript-eslint/no-unused-vars handles TS
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // ── React ────────────────────────────────────────────────────────────
      "react/react-in-jsx-scope": "off", // Not needed with React 17+ JSX transform
      "react/prop-types": "off", // TypeScript handles this
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ── General ──────────────────────────────────────────────────────────
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
