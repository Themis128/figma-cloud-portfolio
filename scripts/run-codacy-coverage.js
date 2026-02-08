/* global console */
/**
 * Codacy Coverage Reporter Script
 * Cross-platform script to run Codacy coverage reporting
 */

import { execSync, spawnSync } from 'node:child_process'
import { platform } from 'node:os'

const process = require('process')

console.log('🚀 Running Codacy Coverage Reporter')
console.log('=====================================')

// Codacy environment variables must be provided by CI or local env
console.log('📋 Using Codacy environment variables (do not hard-code tokens in scripts)')
const requiredEnvVars = [
  'CODACY_API_TOKEN',
  'CODACY_PROJECT_TOKEN',
  'CODACY_ORGANIZATION_PROVIDER',
  'CODACY_USERNAME',
  'CODACY_PROJECT_NAME',
]

requiredEnvVars.forEach((envVar) => {
  if (process.env[envVar]) {
    console.log(`  ✅ ${envVar}: set`)
  } else {
    console.log(`  ⚠️  ${envVar}: NOT SET`)
  }
})
console.log('')

// Verify environment variables are set
if (!(process.env.CODACY_API_TOKEN || process.env.CODACY_PROJECT_TOKEN)) {
  console.log('❌ Error: Neither CODACY_API_TOKEN nor CODACY_PROJECT_TOKEN is set!')
  console.log('')
  console.log('💡 To fix this:')
  console.log('1. Set CODACY_API_TOKEN or CODACY_PROJECT_TOKEN environment variable')
  console.log('2. Or run: pnpm setup:codacy')
  console.log('3. Or check your CI/CD environment variables')
  process.exit(1)
}

console.log('✅ Environment variables verified')
console.log('')

// Download and run the Codacy coverage reporter
console.log('🔄 Downloading and running Codacy coverage reporter...')
console.log('')

try {
  const isWindows = platform() === 'win32'

  if (isWindows) {
    // On Windows, check if bash is available
    console.log('📥 Setting up Codacy reporter...')

    // Check if bash is available
    const bashCheck = spawnSync('where', ['bash'], { stdio: 'pipe' })
    if (bashCheck.status !== 0) {
      console.log('⚠️  Bash is not available on this Windows system.')
      console.log('')
      console.log('💡 To use Codacy coverage reporting on Windows, you have these options:')
      console.log('')
      console.log('1. Install Git Bash (Recommended):')
      console.log('   - Download from: https://git-scm.com/downloads')
      console.log(
        '   - Run the installer and select "Use Git and optional Unix tools from the Command Prompt"',
      )
      console.log('   - Complete the installation and restart your terminal')
      console.log('   - Run: pnpm run coverage:upload')
      console.log('')
      console.log('2. Use Windows Subsystem for Linux (WSL):')
      console.log('   - Open PowerShell as Administrator')
      console.log('   - Run: wsl --install')
      console.log('   - Restart your computer')
      console.log('   - Open WSL terminal and navigate to your project')
      console.log('   - Run: pnpm run coverage:upload')
      console.log('')
      console.log('3. Use Windows Terminal with Git Bash:')
      console.log('   - Install Windows Terminal from Microsoft Store')
      console.log('   - Add Git Bash as a profile in Windows Terminal settings')
      console.log('   - Open Git Bash profile and navigate to your project')
      console.log('   - Run: pnpm run coverage:upload')
      console.log('')
      console.log('4. Run the Codacy reporter manually in any bash environment:')
      console.log('   bash <(curl -Ls https://coverage.codacy.com/get.sh)')
      console.log('')
      console.log('5. Use CI/CD with Linux runners (GitHub Actions, etc.)')
      console.log('')
      console.log('📈 View your coverage report at:')
      console.log('   https://app.codacy.com/gh/Themis128/figma-cloud-portfolio/coverage')
      process.exit(0)
    }

    // Try to run bash directly
    console.log('✅ Bash found, running Codacy coverage reporter...')
    const result = spawnSync(
      'bash',
      ['-c', 'bash <(curl -Ls https://coverage.codacy.com/get.sh)'],
      {
        stdio: 'inherit',
        cwd: process.cwd(),
      },
    )

    if (result.status !== 0) {
      throw new Error(`Bash command failed with exit code ${result.status}`)
    }
  } else {
    console.log('📥 Downloading Codacy reporter script...')
    execSync('bash <(curl -Ls https://coverage.codacy.com/get.sh)', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
  }

  console.log('')
  console.log('🎉 Codacy Coverage Reporter execution completed!')
  console.log('')
  console.log('📈 View your coverage report at:')
  console.log('   https://app.codacy.com/gh/Themis128/figma-cloud-portfolio/coverage')
} catch (error) {
  console.log(`❌ Error running Codacy coverage reporter: ${error.message}`)
  console.log('')
  console.log('💡 Troubleshooting:')
  console.log('1. Ensure you have the required Codacy environment variables set')
  console.log('2. Check your internet connection')
  if (platform() === 'win32') {
    console.log('3. On Windows, install Git Bash (https://git-scm.com/downloads) or WSL')
    console.log('4. The Codacy reporter script requires bash to run properly')
  } else {
    console.log('3. Ensure bash and curl are installed')
  }
  console.log('5. Verify your coverage files exist in the coverage/ directory')
  process.exit(1)
}
