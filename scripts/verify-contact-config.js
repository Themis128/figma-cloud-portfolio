#!/usr/bin/env node

/**
 * Contact Form Configuration Verification Script
 * Checks if all required environment variables and services are configured
 */

import { config } from 'dotenv'

config()

const checks = {
  aws: {
    name: 'AWS Credentials',
    required: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
    optional: [],
  },
  slack: {
    name: 'Slack Webhook',
    required: ['SLACK_WEBHOOK_URL'],
    optional: [],
  },
  recaptcha: {
    name: 'reCAPTCHA',
    required: ['RECAPTCHA_SECRET_KEY'],
    optional: [],
  },
}

const SEPARATOR_LEN = 50

console.log('🔍 Contact Form Configuration Check\n')

let allPassed = true

for (const [_key, check] of Object.entries(checks)) {
  console.log(`\n📋 ${check.name}`)
  console.log('─'.repeat(SEPARATOR_LEN))

  // Check required variables
  for (const envVar of check.required) {
    const value = process.env[envVar]
    if (value) {
      console.log(`✅ ${envVar}: Configured`)
    } else {
      console.log(`❌ ${envVar}: Missing`)
      allPassed = false
    }
  }

  // Check optional variables
  for (const envVar of check.optional) {
    const value = process.env[envVar]
    if (value) {
      console.log(`✅ ${envVar}: Configured (optional)`)
    } else {
      console.log(`⚠️  ${envVar}: Not set (optional)`)
    }
  }
}

console.log(`\n${'='.repeat(SEPARATOR_LEN)}`)

if (allPassed) {
  console.log('✅ All required configurations are set!')
  console.log('\nNext steps:')
  console.log('1. Verify noreply@cloudless.com in AWS SES Console')
  console.log('2. Test Slack webhook by submitting the contact form')
  console.log('3. Check email delivery to test recipient')
} else {
  console.log('❌ Some required configurations are missing!')
  console.log('\nPlease check:')
  console.log('1. .env file exists and has all required variables')
  console.log('2. AWS credentials are valid')
  console.log('3. Slack webhook URL is correct')
  console.log('\nSee docs/CONTACT_FORM_SETUP.md for detailed setup instructions')
  process.exit(1)
}
