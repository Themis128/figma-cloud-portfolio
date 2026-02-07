/* global console, process */
/**
 * Cross-platform Coverage Reporter for Codacy
 * Combines Vitest and Playwright coverage reports
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

console.log('🚀 Running Comprehensive Coverage Analysis')
console.log('===========================================')

// Codacy environment variables must be provided by CI or local env
console.log('📋 Using Codacy environment variables (do not hard-code tokens in scripts)')
const envVars = ['CODACY_API_TOKEN', 'CODACY_PROJECT_TOKEN', 'CODACY_ORGANIZATION_PROVIDER', 'CODACY_USERNAME', 'CODACY_PROJECT_NAME']
envVars.forEach(v => {
  if (process.env[v]) {
    console.log(`  ✅ ${v}: set`)
  } else {
    console.log(`  ⚠️  ${v}: NOT SET`)
  }
})
console.log('')

// Verify environment variables are set
if (!process.env.CODACY_API_TOKEN && !process.env.CODACY_PROJECT_TOKEN) {
  console.log('❌ Error: Neither CODACY_API_TOKEN nor CODACY_PROJECT_TOKEN is set!')
  process.exit(1)
}

console.log('✅ Environment variables verified')
console.log('')

/**
 * Run Vitest with coverage
 */
function runVitestCoverage() {
  console.log('🧪 Running Vitest with coverage...')

  // Clean up old coverage files first
  try {
    if (fs.existsSync(path.join(PROJECT_ROOT, 'coverage'))) {
      fs.rmSync(path.join(PROJECT_ROOT, 'coverage'), { recursive: true, force: true })
    }
  } catch (error) {
    console.log('⚠️  Could not clean old coverage files:', error.message)
  }

  try {
    const command = 'pnpm test:unit --coverage'
    execSync(command, { stdio: 'inherit', cwd: PROJECT_ROOT })
    console.log('✅ Vitest coverage report generated successfully')
    return true
  } catch (error) {
    // Check if tests actually passed but coverage generation failed
    // Output comes through stderr in inherit mode
    const output = (error.stdout?.toString() || '') + (error.stderr?.toString() || '')
    if (output.includes('Test Files') && output.includes('passed')) {
      console.log('⚠️  Tests passed but coverage report generation failed')
      console.log('   Continuing with coverage upload...')
      return 'partial'
    }
    console.log(`❌ Vitest failed with exit code: ${error.status}`)
    return false
  }
}

/**
 * Run Playwright with coverage (placeholder)
 */

/**
 * Upload coverage to Codacy
 */
async function uploadToCodacy() {
  console.log('🔄 Uploading coverage to Codacy...');
  console.log('');

  try {
    if (process.platform === 'win32') {
      // On Windows, create a temporary PowerShell script and execute it
      console.log('📥 Setting up Codacy reporter...');

      const tempScript = path.join(PROJECT_ROOT, 'codacy-reporter-temp.ps1');
      const psScript = [
        'try {',
        '  $url = "https://coverage.codacy.com/get.sh"',
        '  $bashScript = Join-Path $PWD "codacy-reporter-temp.sh"',
        '',
        '  Write-Host "Downloading Codacy reporter script..."',
        '  Invoke-WebRequest -Uri $url -OutFile $bashScript -UseBasicParsing',
        '',
        '  Write-Host "Running Codacy reporter with bash..."',
        '  try {',
        '    & bash "`"$bashScript`"" 2>&1',
        '    Write-Host "Codacy reporter completed successfully"',
        '  } catch {',
        '    Write-Host "Error: bash is not available on this system"',
        '    Write-Host "Please install Git Bash (recommended): https://git-scm.com/downloads"',
        '    Write-Host "Or use Windows Subsystem for Linux: wsl --install"',
        '    exit 1',
        '  }',
        '} finally {',
        '  if (Test-Path $bashScript) { Remove-Item $bashScript -Force -ErrorAction SilentlyContinue }',
        '}',
      ].join('\n');

      // Write the PowerShell script to a temp file
      fs.writeFileSync(tempScript, psScript);

      try {
        // Execute the PowerShell script
        execSync(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`, {
          stdio: 'inherit',
          cwd: PROJECT_ROOT
        });
      } finally {
        // Clean up the PowerShell script
        if (fs.existsSync(tempScript)) {
          fs.unlinkSync(tempScript);
        }
      }
    } else {
      // On Unix-like systems, use the original approach
      execSync('bash <(curl -Ls https://coverage.codacy.com/get.sh)', { stdio: 'inherit', cwd: PROJECT_ROOT });
    }

    console.log('');
    console.log('🎉 Coverage upload completed successfully!');
    console.log('');
    console.log('📈 View your coverage report at:');
    console.log('   https://app.codacy.com/gh/Themis128/figma-cloud-portfolio/coverage');
    return true;
  } catch (error) {
    console.log(`❌ Coverage upload failed: ${error.message}`);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Ensure you have the required Codacy environment variables set');
    console.log('2. Check your internet connection');
    console.log('3. On Windows, you have several options:');
    console.log('4. The Codacy reporter script requires bash to run properly');
    console.log('5. Verify your coverage files exist in the coverage/ directory');
    return false;
  }
}

// Run test suites with coverage
console.log('📊 Generating coverage reports...')
console.log('')



const vitestResult = runVitestCoverage();

console.log('')

// Check if any coverage reports exist
let coverageExists = false
const vitestCoveragePath = path.join(PROJECT_ROOT, 'coverage', 'lcov.info')

if (fs.existsSync(vitestCoveragePath)) {
  // Check if the file was modified recently (within last 5 minutes)
  const stats = fs.statSync(vitestCoveragePath)
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
  if (stats.mtime.getTime() > fiveMinutesAgo) {
    console.log('📁 Found recent Vitest coverage: coverage/lcov.info')
    coverageExists = true
  } else {
    console.log('⚠️  Found old Vitest coverage file (not from this run)')
  }
}

// If vitest succeeded or was partial, consider coverage as existing
if (vitestResult === true || vitestResult === 'partial') {
  coverageExists = true
}

if (!coverageExists) {
  console.log('❌ No recent coverage reports found to upload');
  console.log('💡 Run tests with coverage first:');
  console.log('   pnpm test:unit --coverage');
  process.exit(1);
}

console.log('')

// Upload to Codacy
;(async () => {
  try {
    const uploadSuccess = await uploadToCodacy();
    if (!uploadSuccess) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
})();
