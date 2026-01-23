// ESLint configuration for CodeGuard Pro MCP integration
// This config provides comprehensive TypeScript/React support for the portfolio project

module.exports = [
  {
    ignores: [
      'dist/',
      'node_modules/',
      'playwright-report/',
      'playwright-report/**',
      '**/playwright-report/**',
      'playwright-report/trace/',
      'playwright-report/trace/**',
      '**/playwright-report/trace/**',
      'playwright-report/trace/**/*',
      'amplify-build-config.json',
      'amplify-gradle-config.json',
      'amplifytools.xcconfig',
      '*.min.js',
      '*.min.css',
      'coverage/',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.vscode/',
      '.idea/',
      '.DS_Store',
      'Thumbs.db',
      '*.tmp',
      '*.temp'
    ]
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        HTMLDivElement: 'readonly',
        IntersectionObserver: 'readonly',
        ServiceWorkerRegistration: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      import: require('eslint-plugin-import'),
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // React-specific rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Basic code quality rules
      'no-console': 'warn',
      'no-unused-vars': 'off', // Handled by TypeScript plugin
      'no-undef': 'off', // Handled by TypeScript plugin
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-expressions': 'error',
      'no-constant-condition': 'error',
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      
      // Import rules
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // TypeScript files specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: ['./tsconfig.json', './server/tsconfig.json', './client/tsconfig.json'],
      },
    },
  },
];