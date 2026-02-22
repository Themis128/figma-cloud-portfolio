#!/usr/bin/env node
/* eslint-env node */
/* global console, process */

/**
 * AWS SES Setup Helper Script
 * This script guides you through setting up AWS SES for the contact form
 */

import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve))

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              AWS SES Configuration Setup                        ║
╚════════════════════════════════════════════════════════════════╝

This script will help you configure AWS SES for sending confirmation
emails from your contact form.

PREREQUISITES:
1. AWS Account (free tier available)
2. Verified email address or domain in AWS SES
3. AWS IAM credentials with SES permissions

────────────────────────────────────────────────────────────────────

STEP 1: Create AWS Account (if you don't have one)
→ Go to: https://aws.amazon.com/free/
→ Sign up for a free account

STEP 2: Verify Email in AWS SES
→ Go to: https://console.aws.amazon.com/ses/home
→ Navigate to "Verified identities"
→ Click "Create identity"
→ Select "Email address" and enter your sender email
→ Verify the email via the confirmation link sent to you

STEP 3: Create IAM User with SES Permissions
→ Go to: https://console.aws.amazon.com/iam/home
→ Users → Create user
→ Attach policy: AmazonSESFullAccess (or custom policy below)
→ Create access key and save credentials

Custom IAM Policy (recommended for production):
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }
  ]
}

STEP 4: Request Production Access (to send to any email)
→ By default, SES is in sandbox mode (can only send to verified emails)
→ SES Console → Account dashboard → Request production access
→ Or use verified emails for testing

────────────────────────────────────────────────────────────────────
`)

async function setup() {
  try {
    const hasAwsAccount = await question('Do you have an AWS account? (y/n): ')

    if (hasAwsAccount.toLowerCase() !== 'y') {
      console.log('\n📌 Please create an AWS account first:')
      console.log('   https://aws.amazon.com/free/\n')
      rl.close()
      return
    }

    const awsAccessKeyId = await question('Enter your AWS Access Key ID: ')
    const awsSecretAccessKey = await question('Enter your AWS Secret Access Key: ')
    const awsRegion =
      (await question('Enter AWS Region (default: eu-central-1): ')) || 'eu-central-1'
    const sesVerifiedEmail = await question(
      'Enter your verified SES email (e.g., noreply@yourdomain.com): ',
    )

    if (!(awsAccessKeyId && awsSecretAccessKey && sesVerifiedEmail)) {
      console.log('\n❌ All fields are required. Please try again.\n')
      rl.close()
      return
    }

    const envPath = join(process.cwd(), '.env')
    const envContent = `
# AWS SES Configuration (added by setup-ses.js)
AWS_ACCESS_KEY_ID=${awsAccessKeyId}
AWS_SECRET_ACCESS_KEY=${awsSecretAccessKey}
AWS_REGION=${awsRegion}
SES_VERIFIED_EMAIL=${sesVerifiedEmail}
`

    if (existsSync(envPath)) {
      const append = await question('.env file exists. Append to it? (y/n): ')
      if (append.toLowerCase() === 'y') {
        const { appendFileSync } = await import('fs')
        appendFileSync(envPath, envContent)
        console.log('\n✅ Appended AWS SES configuration to .env file')
      } else {
        console.log('\n⚠️  Skipped writing to .env file')
      }
    } else {
      writeFileSync(envPath, envContent.trim())
      console.log('\n✅ Created .env file with AWS SES configuration')
    }

    console.log(`
────────────────────────────────────────────────────────────────────
✅ AWS SES Configuration Complete!

Next steps:
1. Verify your email in AWS SES Console
2. (Optional) Request production access to send to any email
3. Test the contact form

Run the verification script:
  node scripts/verify-contact-config.js
────────────────────────────────────────────────────────────────────
`)
  } catch (error) {
    console.error('Error during setup:', error.message)
  } finally {
    rl.close()
  }
}

setup()
