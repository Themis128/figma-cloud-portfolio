#!/usr/bin/env node

/**
 * Codacy Setup Helper Script
 * This script helps configure Codacy integration for your portfolio project
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 Codacy Setup Helper for Baltzakis Portfolio\n')

// Check if .codacy.yml exists
const codacyConfigPath = path.join(__dirname, '..', '.codacy.yml')
if (fs.existsSync(codacyConfigPath)) {
  console.log('✅ .codacy.yml configuration file found')
} else {
  console.log('❌ .codacy.yml configuration file not found')
  console.log('   Run this script from the project root directory')
  process.exit(1)
}

// Check if CI workflow has Codacy integration
const ciWorkflowPath = path.join(__dirname, '..', '.github', 'workflows', 'ci.yml')
if (fs.existsSync(ciWorkflowPath)) {
  const ciContent = fs.readFileSync(ciWorkflowPath, 'utf8')
  if (ciContent.includes('codacy/codacy-analysis-cli-action')) {
    console.log('✅ CI workflow has Codacy integration')
  } else {
    console.log('❌ CI workflow missing Codacy integration')
  }
}

console.log('\n📋 Next Steps:')
console.log('1. Create a Codacy account at https://app.codacy.com')
console.log('2. Add your GitHub repository to Codacy')
console.log('3. Authenticate the Codacy extension:')
console.log('   - Open VS Code')
console.log('   - Click Codacy icon in activity bar')
console.log('   - Click "Connect to Codacy"')
console.log('   - Sign in with your GitHub account')
console.log('4. Get your Project Token from Codacy Settings > Integrations')
console.log('5. Add CODACY_PROJECT_TOKEN to your GitHub repository secrets')
console.log('6. Configure VS Code settings for Codacy extension')
console.log('\n🔧 VS Code Settings to add (.vscode/settings.json):')
console.log(`   "codacy.cli.analysisMode": "enabled",`)
console.log(`   "codacy.cli.cliVersion": "latest",`)
console.log(`   "codacy.cli.devMode": false,`)
console.log(`   "codacy.guardrails.analyzeGeneratedCode": "enabled",`)
console.log(`   "codacy.guardrails.instructionsFile": "automatic"`)

console.log('\n✨ Setup complete! Push these changes and Codacy will analyze your code.')
