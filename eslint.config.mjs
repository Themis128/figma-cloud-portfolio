import nextConfig from "eslint-config-next";

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
      "server/**",
      "scripts/**",
      "src/app/.well-known/**",
      "*.config.mjs",
      "*.config.ts",
      "*.config.js",
      "*.config.shared.ts",
      "vitest.config.ts",
      "postcss.config.mjs",
    ],
  },

  // ── Next.js recommended (includes React, React Hooks, Import, JSX-A11y, TS)
  ...nextConfig,

  // ── Custom rules for src/ ─────────────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      // ── TypeScript ───────────────────────────────────────────────────────
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
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off", // Too many valid patterns (browser API detection in effects)
      "react-hooks/purity": "off", // React 19 compiler hints, not actionable yet

      // ── Accessibility ──────────────────────────────────────────────────
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/no-redundant-roles": "error",

      // ── Imports ──────────────────────────────────────────────────────────
      "import/no-duplicates": "error",
      "import/no-cycle": ["error", { maxDepth: 3 }],
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // ── General ──────────────────────────────────────────────────────────
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
