#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

// Add logging functionality
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
}

/**
 * Validates command and arguments to prevent injection attacks
 * @param {string} command - The command to execute
 * @param {string[]} args - Command arguments
 * @returns {boolean} - Whether the command is valid
 */
function validateCommand(command, args) {
  // Shell metacharacters that indicate injection attempts
  const injectionPatterns = /[;&|`$(){}[\]\\]/

  // Patterns for dangerous commands (only check command, not arguments)
  const dangerousCommands = [
    /^\s*rm\s+/, // Dangerous commands
    /^\s*del\s+/, // Dangerous commands
    /^\s*format\s+/, // Dangerous commands
    /^\s*shutdown\s+/, // Dangerous commands
    /^\s*poweroff\s+/, // Dangerous commands
    /^\s*reboot\s+/, // Dangerous commands
  ]

  // Validate command
  if (!command || typeof command !== 'string') {
    logger.error('Invalid command provided')
    return false
  }

  // Check for injection patterns in command
  if (injectionPatterns.test(command)) {
    logger.error(`Command contains shell metacharacters: ${command}`)
    return false
  }

  // Check if command itself is a dangerous command
  for (const pattern of dangerousCommands) {
    if (pattern.test(command)) {
      logger.error(`Dangerous command detected: ${command}`)
      return false
    }
  }

  // Validate arguments - only check for injection patterns, not dangerous command names
  for (const arg of args) {
    if (typeof arg !== 'string') {
      logger.error(`Invalid argument type: ${arg}`)
      return false
    }

    // Only block shell metacharacters in arguments (not command names)
    if (injectionPatterns.test(arg)) {
      logger.error(`Argument contains shell metacharacters: ${arg}`)
      return false
    }
  }

  return true
}

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/run-with-secrets.js <command> [args...]')
  process.exit(1)
}

const command = args[0]
const commandArgs = args.slice(1)
const isWindows = process.platform === 'win32'

// Input validation
if (!validateCommand(command, commandArgs)) {
  logger.error('Command validation failed. Aborting execution.')
  process.exit(1)
}

logger.info(`Executing command: ${command} with ${commandArgs.length} arguments`)

if (isWindows) {
  // Verify PowerShell script exists
  const psScriptPath = join(process.cwd(), 'scripts', 'load-secrets.ps1')
  if (!existsSync(psScriptPath)) {
    logger.error(`PowerShell script not found: ${psScriptPath}`)
    process.exit(1)
  }

  try {
    // Use proper argument passing - pass command and args as separate parameters
    const psArgs = [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      'scripts/load-secrets.ps1',
      '-Command',
      command,
    ]

    // Add CommandArgs parameter if there are command arguments
    // Encode as Base64 JSON to avoid PowerShell parameter binding issues
    if (commandArgs.length > 0) {
      const argsJson = JSON.stringify(commandArgs)
      const argsBase64 = Buffer.from(argsJson).toString('base64')
      psArgs.push('-CommandArgsEncoded')
      psArgs.push(argsBase64)
    }

    logger.info(`PowerShell args: ${psArgs.join(' ')}`)

    const result = spawnSync('powershell', psArgs, {
      stdio: 'inherit',
      shell: false, // Disable shell to prevent injection
    })

    if (result.error) {
      logger.error(`PowerShell execution failed: ${result.error.message}`)
      process.exit(1)
    }

    process.exit(result.status ?? 1)
  } catch (error) {
    logger.error(`Failed to execute PowerShell: ${error.message}`)
    process.exit(1)
  }
}

// Unix/Linux implementation
try {
  // Verify shell script exists
  const shScriptPath = join(process.cwd(), 'scripts', 'load-secrets.sh')
  if (!existsSync(shScriptPath)) {
    logger.error(`Shell script not found: ${shScriptPath}`)
    process.exit(1)
  }

  // Make sure script is executable
  try {
    spawnSync('chmod', ['+x', shScriptPath])
  } catch (error) {
    logger.warn(`Could not make script executable: ${error.message}`)
  }

  // Build arguments array - use proper array structure to prevent injection
  const shArgs = ['scripts/load-secrets.sh', '--command', command]

  // Add arguments safely
  if (commandArgs.length > 0) {
    shArgs.push('--', ...commandArgs)
  }

  const result = spawnSync('bash', shArgs, {
    stdio: 'inherit',
    shell: false, // Disable shell to prevent injection
  })

  if (result.error) {
    logger.error(`Shell execution failed: ${result.error.message}`)
    process.exit(1)
  }

  process.exit(result.status ?? 1)
} catch (error) {
  logger.error(`Failed to execute shell script: ${error.message}`)
  process.exit(1)
}
