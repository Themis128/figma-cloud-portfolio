#!/usr/bin/env node
/**
 * Validate Secrets Script
 * Validates that all required secrets are configured correctly
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const REQUIRED_SECRETS = {
  // Core
  NODE_ENV: { required: false, description: 'Environment (development/production)' },

  // Firebase (Cloud Messaging)
  VITE_FIREBASE_API_KEY: { required: true, description: 'Firebase API Key' },
  VITE_FIREBASE_AUTH_DOMAIN: { required: true, description: 'Firebase Auth Domain' },
  VITE_FIREBASE_PROJECT_ID: { required: true, description: 'Firebase Project ID' },
  VITE_FIREBASE_STORAGE_BUCKET: { required: true, description: 'Firebase Storage Bucket' },
  VITE_FIREBASE_MESSAGING_SENDER_ID: {
    required: true,
    description: 'Firebase Messaging Sender ID',
  },
  VITE_FIREBASE_APP_ID: { required: true, description: 'Firebase App ID' },
  VITE_FIREBASE_VAPID_KEY: { required: true, description: 'Firebase VAPID Key' },

  // Google Services
  VITE_RECAPTCHA_SITE_KEY: { required: true, description: 'reCAPTCHA Site Key (public)' },
  RECAPTCHA_SECRET_KEY: { required: true, description: 'reCAPTCHA Secret Key (private)' },
  VITE_GOOGLE_ANALYTICS_ID: { required: false, description: 'Google Analytics ID' },

  // Sentry
  VITE_SENTRY_DSN: { required: true, description: 'Sentry DSN (client-side)' },
  SENTRY_DSN: { required: true, description: 'Sentry DSN (server-side)' },
  SENTRY_ENVIRONMENT: { required: false, description: 'Sentry Environment' },
  SENTRY_TRACES_SAMPLE_RATE: { required: false, description: 'Sentry Traces Sample Rate' },

  // GitHub
  GITHUB_TOKEN: { required: false, description: 'GitHub Personal Access Token' },
  VITE_GITHUB_TOKEN: { required: false, description: 'GitHub PAT (client-side)' },

  // AI Services (at least one recommended)
  VITE_ANTHROPIC_API_KEY: { required: false, description: 'Anthropic Claude API Key' },
  VITE_OPENAI_API_KEY: { required: false, description: 'OpenAI API Key' },

  // Codacy
  CODACY_API_TOKEN: { required: false, description: 'Codacy API Token' },
  CODACY_PROJECT_TOKEN: { required: false, description: 'Codacy Project Token' },
}

const PLACEHOLDER_PATTERNS = [
  'your_',
  'your-',
  'placeholder',
  'example',
  'xxx',
  'yyy',
  'zzz',
  'test_key',
  'changeme',
]

function isPlaceholder(value) {
  if (!value || value.trim() === '') return true
  const lowerValue = value.toLowerCase()
  return PLACEHOLDER_PATTERNS.some((pattern) => lowerValue.includes(pattern))
}

function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env')
    const content = readFileSync(envPath, 'utf-8')
    const env = {}

    content.split('\n').forEach((line) => {
      if (line.trim() && !line.startsWith('#')) {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          let value = match[2].trim()
          // Remove quotes
          value = value.replace(/^["']|["']$/g, '')
          env[key] = value
        }
      }
    })

    return env
  } catch (error) {
    console.error('❌ Failed to load .env file:', error.message)
    return null
  }
}

function validateSecrets() {
  console.log('🔐 Secret Validation Report')
  console.log('==========================\n')

  const env = loadEnvFile()
  if (!env) {
    process.exit(1)
  }

  const results = {
    valid: [],
    missing: [],
    placeholder: [],
    optional: [],
  }

  // Check each required secret
  for (const [key, config] of Object.entries(REQUIRED_SECRETS)) {
    const value = env[key] || process.env[key]

    if (!value) {
      if (config.required) {
        results.missing.push({ key, description: config.description })
      } else {
        results.optional.push({ key, description: config.description })
      }
    } else if (isPlaceholder(value)) {
      if (config.required) {
        results.placeholder.push({ key, description: config.description, value })
      } else {
        results.optional.push({ key, description: config.description })
      }
    } else {
      results.valid.push({ key, description: config.description })
    }
  }

  // Print results
  if (results.valid.length > 0) {
    console.log(`✅ Valid Secrets (${results.valid.length}):`)
    results.valid.forEach(({ key, description }) => {
      console.log(`   - ${key}: ${description}`)
    })
    console.log()
  }

  if (results.missing.length > 0) {
    console.log(`❌ Missing Required Secrets (${results.missing.length}):`)
    results.missing.forEach(({ key, description }) => {
      console.log(`   - ${key}: ${description}`)
    })
    console.log()
  }

  if (results.placeholder.length > 0) {
    console.log(`⚠️  Placeholder Values Detected (${results.placeholder.length}):`)
    results.placeholder.forEach(({ key, description }) => {
      console.log(`   - ${key}: ${description}`)
    })
    console.log()
  }

  if (results.optional.length > 0) {
    console.log(`ℹ️  Optional Secrets Not Configured (${results.optional.length}):`)
    results.optional.forEach(({ key, description }) => {
      console.log(`   - ${key}: ${description}`)
    })
    console.log()
  }

  // Summary
  console.log('📊 Summary:')
  console.log(
    `   Total Required: ${Object.values(REQUIRED_SECRETS).filter((c) => c.required).length}`,
  )
  console.log(`   Configured: ${results.valid.length}`)
  console.log(`   Missing: ${results.missing.length}`)
  console.log(`   Placeholder: ${results.placeholder.length}`)
  console.log(`   Optional: ${results.optional.length}\n`)

  // Exit code
  const hasErrors = results.missing.length > 0 || results.placeholder.length > 0
  if (hasErrors) {
    console.log('❌ Validation failed! Please configure missing secrets.\n')
    console.log('See: SECRETS_MANAGEMENT.md for configuration guide')
    process.exit(1)
  } else {
    console.log('✅ All required secrets are configured!\n')
    process.exit(0)
  }
}

// Run validation
validateSecrets()
