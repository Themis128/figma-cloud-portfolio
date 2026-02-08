#!/usr/bin/env tsx
/**
 * Shell Integration Setup Script
 * Enables comprehensive shell integration for improved command detection
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

interface ShellConfig {
  name: string
  profilePath: string
  completionScript: string
  initScript: string
}

function getShellConfigs(): ShellConfig[] {
  const homeDir = os.homedir()

  return [
    {
      name: 'PowerShell',
      profilePath: path.join(
        homeDir,
        'Documents',
        'PowerShell',
        'Microsoft.PowerShell_profile.ps1',
      ),
      completionScript: `
// PowerShell Tab Completion for pnpm
Register-ArgumentCompleter -Native -CommandName pnpm -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)
    $completions = @(
        'add', 'audit', 'bin', 'build', 'cache', 'config', 'dedupe', 'dlx',
        'exec', 'help', 'import', 'install', 'link', 'list', 'outdated',
        'pack', 'patch', 'pkg', 'prune', 'publish', 'rebuild', 'remove',
        'run', 'search', 'start', 'store', 'test', 'unlink', 'update',
        'version', 'why'
    ) | Where-Object { $_ -like "$wordToComplete*" }
    $completions | ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
}
`,
      initScript: `
// Shell Integration
$ENV:EDITOR = 'code'
$ENV:VISUAL = 'code'
$ENV:TERM = 'xterm-256color'

# Enable command prediction
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -PredictionViewStyle ListView
`,
    },
    {
      name: 'Bash',
      profilePath: path.join(homeDir, '.bashrc'),
      completionScript: `
# pnpm completion
if command -v pnpm &> /dev/null; then
    eval "$(pnpm completion bash)"
fi
`,
      initScript: `
# Shell Integration
export EDITOR='code'
export VISUAL='code'
export TERM='xterm-256color'

# Enable command history
export HISTCONTROL=ignoredups:erasedups
export HISTSIZE=10000
export HISTFILESIZE=10000
`,
    },
    {
      name: 'Zsh',
      profilePath: path.join(homeDir, '.zshrc'),
      completionScript: `
# pnpm completion
if command -v pnpm &> /dev/null; then
    autoload -U compinit
    compinit
    eval "$(pnpm completion zsh)"
fi
`,
      initScript: `
# Shell Integration
export EDITOR='code'
export VISUAL='code'
export TERM='xterm-256color'

# Enable command history
HISTSIZE=10000
SAVEHIST=10000
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
`,
    },
  ]
}

function ensureProfileDirectory(profilePath: string): void {
  const dir = path.dirname(profilePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function appendToFile(filePath: string, content: string): void {
  ensureProfileDirectory(filePath)

  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''

  // Check if already configured
  if (current.includes('Shell Integration') && current.includes('pnpm completion')) {
    return
  }

  fs.appendFileSync(filePath, content)
}

function setupPnpmShellIntegration(): void {
  console.log('🔧 Setting up pnpm shell integration...')

  try {
    // Try to generate pnpm shell completion
    execSync('pnpm config set enable-shell-completion true', { stdio: 'ignore' })
    console.log('✅ pnpm shell completion enabled')
  } catch (err) {
    console.warn('⚠️  Could not enable pnpm shell completion:', String(err))
  }
}

function main(): void {
  console.log('🚀 Shell Integration Setup')
  console.log('==========================\n')

  const configs = getShellConfigs()
  const shell = process.env.SHELL || ''
  const isWindows = process.platform === 'win32'

  console.log(`📋 Detected platform: ${process.platform}`)
  console.log(`📋 Detected shell: ${shell}\n`)

  // Setup pnpm config
  setupPnpmShellIntegration()

  // Configure shells
  for (const config of configs) {
    try {
      // Always add bash/zsh completion for cross-platform compatibility
      if (config.name === 'Bash' || config.name === 'Zsh') {
        appendToFile(config.profilePath, config.completionScript)
        console.log(`✅ Added ${config.name} completion script`)
      }

      // Add current shell's init script
      if (isWindows && config.name === 'PowerShell') {
        appendToFile(config.profilePath, config.initScript)
        console.log(`✅ Added ${config.name} init script`)
      } else if (!isWindows) {
        if (
          (shell.includes('bash') && config.name === 'Bash') ||
          (shell.includes('zsh') && config.name === 'Zsh')
        ) {
          appendToFile(config.profilePath, config.initScript)
          console.log(`✅ Added ${config.name} init script`)
        }
      }
    } catch (err) {
      console.warn(`⚠️  Failed to configure ${config.name}:`, String(err))
    }
  }

  console.log('\n✨ Shell integration setup complete!')
  console.log('📝 Please restart your terminal or source your profile to apply changes.')
  console.log('\nTo apply immediately:')
  console.log('  - PowerShell: . $PROFILE')
  console.log('  - Bash: source ~/.bashrc')
  console.log('  - Zsh: source ~/.zshrc')
}

main()
