#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

// eslint-disable-next-line no-console
console.log('Testing security improvements for run-with-secrets.js\n')

// Test cases for security validation
const testCases = [
  {
    name: 'Safe command',
    args: ['echo', 'Hello World'],
    expected: 'success',
  },
  {
    name: 'Command injection attempt 1',
    args: ['echo', 'test; rm -rf /'],
    expected: 'blocked',
  },
  {
    name: 'Command injection attempt 2',
    args: ['echo', 'test | cat /etc/passwd'],
    expected: 'blocked',
  },
  {
    name: 'Dangerous command attempt',
    args: ['echo', 'rm command test'],
    expected: 'success',
  },
  {
    name: 'Safe command with special chars',
    args: ['echo', 'test-file.txt'],
    expected: 'success',
  },
]

let passed = 0

for (const testCase of testCases) {
  // eslint-disable-next-line no-console
  console.log(`Testing: ${testCase.name}`)

  try {
    const result = spawnSync('node', ['scripts/run-with-secrets.js', ...testCase.args], {
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8',
    })

    const output = result.stdout + result.stderr
    const exitCode = result.status

    if (testCase.expected === 'blocked') {
      if (exitCode === 1 && output.includes('Command validation failed')) {
        // eslint-disable-next-line no-console
        console.log('✅ PASS - Command was correctly blocked')
        passed++
      } else {
        // eslint-disable-next-line no-console
        console.log('❌ FAIL - Command was not blocked')
        // eslint-disable-next-line no-console
        console.log('Output:', output)
      }
    } else {
      if (exitCode === 0 || output.includes('Executing command')) {
        // eslint-disable-next-line no-console
        console.log('✅ PASS - Command was allowed')
        passed++
      } else {
        // eslint-disable-next-line no-console
        console.log('❌ FAIL - Safe command was blocked')
        // eslint-disable-next-line no-console
        console.log('Output:', output)
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('❌ FAIL - Test execution error:', error.message)
  }

  // eslint-disable-next-line no-console
  console.log('')
}

const total = testCases.length

// eslint-disable-next-line no-console
console.log(`\nSecurity Test Results: ${passed}/${total} tests passed`)

if (passed === total) {
  // eslint-disable-next-line no-console
  console.log('🎉 All security tests passed!')
  process.exit(0)
} else {
  // eslint-disable-next-line no-console
  console.log('⚠️  Some security tests failed. Review the implementation.')
  process.exit(1)
}
