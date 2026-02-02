#!/usr/bin/env node

/**
 * Update AWS Secrets Manager
 * Syncs current .env configuration to AWS Secrets Manager
 */

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const SECRET_ID = process.env.AWS_SECRETS_MANAGER_ID || 'portfolio/env'
const REGION = process.env.AWS_REGION || 'us-east-1'

// Keys to sync to AWS Secrets Manager
const KEYS_TO_SYNC = [
  // Core
  'NODE_ENV',

  // Firebase (if configured)
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID  ',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_VAPID_KEY',

  // Google Services
  'VITE_RECAPTCHA_SITE_KEY',
  'RECAPTCHA_SECRET_KEY',
  'VITE_GOOGLE_ANALYTICS_ID',
  'VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID',

  // Sentry
  'VITE_SENTRY_DSN',
  'SENTRY_DSN',
  'SENTRY_ENVIRONMENT',
  'SENTRY_TRACES_SAMPLE_RATE',
  'SENTRY_PROFILES_SAMPLE_RATE',
  'SENTRY_ACCESS_TOKEN',
  'SENTRY_ORG_SLUG',
  'VITE_APP_VERSION',

  // GitHub
  'GITHUB_TOKEN',
  'VITE_GITHUB_TOKEN',

  // AI Services
  'VITE_ANTHROPIC_API_KEY',
  'VITE_OPENAI_API_KEY',
  'VITE_TOGETHER_API_KEY',
  'VITE_OLLAMA_BASE_URL',
  'VITE_AI_PROVIDER',
  'VITE_AI_MODEL',

  // Codacy
  'CODACY_API_TOKEN',
  'CODACY_PROJECT_TOKEN',
  'CODACY_ORGANIZATION_PROVIDER',
  'CODACY_USERNAME',
  'CODACY_PROJECT_NAME',

  // Figma
  'FIGMA_API_KEY',
  'FIGMA_FILE_KEY',
  'FIGMA_CLIENT_ID',
  'FIGMA_CLIENT_SECRET',
]

const PLACEHOLDER_PATTERNS = ['your_', 'your-', 'placeholder', 'example', 'xxx']

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
          // Handle ${VAR} references
          if (value.startsWith('${') && value.endsWith('}')) {
            const envVar = value.slice(2, -1)
            value = process.env[envVar] || value
          }
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

function checkAWSCLI() {
  try {
    execSync('aws --version', { stdio: 'pipe' })
    return true
  } catch (_error) {
    return false
  }
}

function checkAWSCredentials() {
  try {
    execSync('aws sts get-caller-identity', { stdio: 'pipe' })
    return true
  } catch (_error) {
    return false
  }
}

function createOrUpdateSecret(secretString) {
  console.log(`\n🔐 Updating AWS Secrets Manager: ${SECRET_ID}`)
  console.log(`   Region: ${REGION}\n`)

  // Try to update existing secret first
  try {
    const updateCmd = `aws secretsmanager update-secret --secret-id "${SECRET_ID}" --secret-string '${secretString}' --region ${REGION}`
    execSync(updateCmd, { stdio: 'pipe' })
    console.log('✅ Secret updated successfully')
    return true
  } catch (_error) {
    // If update fails, try to create
    console.log("   Secret doesn't exist, creating new...")
    try {
      const createCmd = `aws secretsmanager create-secret --name "${SECRET_ID}" --description "Portfolio application environment variables" --secret-string '${secretString}' --region ${REGION}`
      execSync(createCmd, { stdio: 'pipe' })
      console.log('✅ Secret created successfully')
      return true
    } catch (createError) {
      console.error('❌ Failed to create secret:', createError.message)
      return false
    }
  }
}

function updateSecretsManager() {
  console.log('🔄 AWS Secrets Manager Update')
  console.log('============================\n')

  // Check prerequisites
  if (!checkAWSCLI()) {
    console.error('❌ AWS CLI not found. Please install it first:')
    console.error('   https://aws.amazon.com/cli/\n')
    process.exit(1)
  }

  console.log('✅ AWS CLI found')

  if (!checkAWSCredentials()) {
    console.error('❌ AWS credentials not configured. Run: aws configure\n')
    process.exit(1)
  }

  console.log('✅ AWS credentials configured')

  // Load .env
  const env = loadEnvFile()
  if (!env) {
    process.exit(1)
  }

  console.log('✅ .env file loaded')

  // Filter and prepare secrets
  const secrets = {}
  let validCount = 0
  let skippedCount = 0

  KEYS_TO_SYNC.forEach((key) => {
    const value = env[key]
    if (value && !isPlaceholder(value)) {
      secrets[key] = value
      validCount++
    } else {
      skippedCount++
    }
  })

  console.log(`\n📊 Secrets to sync:`)
  console.log(`   Valid: ${validCount}`)
  console.log(`   Skipped (placeholder/missing): ${skippedCount}`)

  if (validCount === 0) {
    console.error('\n❌ No valid secrets to sync!')
    process.exit(1)
  }

  // Show what will be synced (mask values)
  const VISIBLE_PREFIX_LENGTH = 10
  const VISIBLE_SUFFIX_LENGTH = 4
  console.log(`\n📋 Keys to be synced:`)
  Object.keys(secrets).forEach((key) => {
    const value = secrets[key]
    const masked =
      value.length > VISIBLE_PREFIX_LENGTH
        ? `${value.substring(0, VISIBLE_PREFIX_LENGTH)}...${value.substring(value.length - VISIBLE_SUFFIX_LENGTH)}`
        : '***'
    console.log(`   - ${key}: ${masked}`)
  })

  // Ask for confirmation
  console.log(`\n⚠️  This will update secret: ${SECRET_ID}`)
  console.log(`   Region: ${REGION}`)

  // Proceed with update
  const secretString = JSON.stringify(secrets, null, 2).replace(/'/g, "\\'")

  if (createOrUpdateSecret(secretString)) {
    console.log(`\n✅ AWS Secrets Manager updated successfully!`)
    console.log(`\nTo use in your application:`)
    console.log(`   export AWS_SECRETS_MANAGER_ID=${SECRET_ID}`)
    console.log(`   export AWS_REGION=${REGION}`)
    console.log(`   pnpm dev\n`)
    process.exit(0)
  } else {
    process.exit(1)
  }
}

// Run update
updateSecretsManager()
