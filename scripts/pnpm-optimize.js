#!/usr/bin/env node

/**
 * pnpm Performance Analyzer and Optimizer
 */

import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🚀 pnpm Performance Analyzer & Optimizer')
console.log('=====================================\n')

// Parse CLI
const args = process.argv.slice(2)
const applyChanges = args.includes('--apply')
const outputJson = args.includes('--json')

// Check pnpm version
let pnpmVersion = null
try {
  pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim()
  if (!outputJson) console.log(`📦 pnpm version: ${pnpmVersion}`)
} catch (error) {
  if (!outputJson)
    console.log(
      '⚠️  pnpm not found. Skipping pnpm-specific checks. Install pnpm if you want full analysis.',
    )
}

// Check current configuration
console.log('\n🔧 Current Configuration:')
const projectPnpmrc = path.join(__dirname, '..', '.pnpmrc')
const userPnpmrc = path.join(os.homedir(), '.pnpmrc')
const foundConfigs = []
if (fs.existsSync(projectPnpmrc))
  foundConfigs.push({ source: 'project', path: projectPnpmrc })
if (fs.existsSync(userPnpmrc))
  foundConfigs.push({ source: 'user', path: userPnpmrc })

if (foundConfigs.length > 0) {
  if (!outputJson)
    console.log(
      `✅ .pnpmrc found (${foundConfigs.map((c) => c.source).join(', ')})`,
    )
  for (const cfg of foundConfigs) {
    const config = fs.readFileSync(cfg.path, 'utf8')
    if (!outputJson) {
      console.log(`\n--- ${cfg.source} (.pnpmrc) ---`)
      config.split('\n').forEach((line) => {
        if (
          line.includes('=') &&
          !line.trim().startsWith('#') &&
          line.trim() !== ''
        ) {
          console.log(`  ${line}`)
        }
      })
    }
  }
} else {
  if (!outputJson) console.log('⚠️  .pnpmrc not found in project or user home')
}

// Check lockfile
const lockfilePath = path.join(__dirname, '..', 'pnpm-lock.yaml')
if (fs.existsSync(lockfilePath)) {
  const stats = fs.statSync(lockfilePath)
  const KB_SIZE = 1024
  if (!outputJson)
    console.log(`✅ Lockfile found (${(stats.size / KB_SIZE).toFixed(2)} KB)`)
} else {
  if (!outputJson) console.log('⚠️  Lockfile not found')
}

// Check store location
let storePath = null
try {
  storePath = execSync('pnpm store path', { encoding: 'utf8' }).trim()
  if (!outputJson) console.log(`🏪 Store location: ${storePath}`)

  if (fs.existsSync(storePath)) {
    if (!outputJson) console.log('✅ Store directory exists')
  } else {
    if (!outputJson) console.log('⚠️  Store directory missing')
  }
} catch {
  if (!outputJson) console.log('❌ Could not determine store path')
}

// Performance recommendations
console.log('\n💡 Performance Recommendations:')
console.log('1. Use `pnpm install --frozen-lockfile` in CI for faster installs')
console.log('2. Enable `prefer-frozen-lockfile=true` for reproducible builds')
console.log('3. Use `pnpm install --ignore-scripts` if scripts are not needed')
console.log(
  '4. Consider using `pnpm install --shamefully-hoist` for compatibility',
)
console.log('5. Use `pnpm dlx` instead of `npx` for better caching')

const recommended = {
  'prefer-frozen-lockfile': 'true',
}

if (applyChanges) {
  // Apply recommended settings to project .pnpmrc (create if missing)
  try {
    const target = projectPnpmrc
    let existing = ''
    if (fs.existsSync(target)) existing = fs.readFileSync(target, 'utf8')
    const toAppend = Object.entries(recommended)
      .filter(([k]) => !existing.includes(k))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')
    if (toAppend) {
      fs.appendFileSync(
        target,
        (existing && !existing.endsWith('\n') ? '\n' : '') + toAppend + '\n',
        'utf8',
      )
      if (!outputJson)
        console.log(`✨ Applied recommended settings to ${target}`)
    } else {
      if (!outputJson)
        console.log(`✔️  Project .pnpmrc already contains recommended settings`)
    }
  } catch (err) {
    if (!outputJson) console.log(`❌ Failed to apply settings: ${String(err)}`)
  }
}

if (outputJson) {
  const report = {
    pnpmVersion,
    configs: foundConfigs.map((c) => c.path),
    lockfile: fs.existsSync(lockfilePath),
    storePath: storePath || null,
    recommended,
  }
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n✅ Analysis complete!')
}
