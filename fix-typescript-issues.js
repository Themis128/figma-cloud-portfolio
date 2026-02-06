import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to recursively find all .ts and .tsx files
function findTypeScriptFiles(dir, excludeDirs = ['node_modules', '.git', 'dist']) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory() && !excludeDirs.includes(item)) {
      files.push(...findTypeScriptFiles(fullPath, excludeDirs))
    } else if (
      (item.endsWith('.ts') || item.endsWith('.tsx')) &&
      !item.endsWith('.d.ts') &&
      !item.includes('vite.config') &&
      !item.includes('vitest.config')
    ) {
      files.push(fullPath)
    }
  }

  return files
}

// Fix common TypeScript issues
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Fix process.env property access
  const envRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g
  content = content.replace(envRegex, (_match, prop) => {
    modified = true
    return `process.env['${prop}']`
  })

  // Fix import.meta.env property access
  const importMetaEnvRegex = /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g
  content = content.replace(importMetaEnvRegex, (_match, prop) => {
    modified = true
    return `import.meta.env['${prop}']`
  })

  // Fix req.query property access
  const queryRegex = /req\.query\.([a-zA-Z_][a-zA-Z0-9_]*)/g
  content = content.replace(queryRegex, (_match, prop) => {
    modified = true
    return `req.query['${prop}']`
  })

  // Fix req.body property access
  const bodyRegex = /req\.body\.([a-zA-Z_][a-zA-Z0-9_]*)/g
  content = content.replace(bodyRegex, (_match, prop) => {
    modified = true
    return `req.body['${prop}']`
  })

  // Fix req.params property access
  const paramsRegex = /req\.params\.([a-zA-Z_][a-zA-Z0-9_]*)/g
  content = content.replace(paramsRegex, (_match, prop) => {
    modified = true
    return `req.params['${prop}']`
  })

  // Fix req.headers property access
  const headersRegex = /req\.headers\.([a-zA-Z_][a-zA-Z0-9_-]*)/g
  content = content.replace(headersRegex, (_match, prop) => {
    modified = true
    return `req.headers['${prop}']`
  })

  // Fix dataset property access
  const datasetRegex = /dataset\.([a-zA-Z_][a-zA-Z0-9_]*)/g
  content = content.replace(datasetRegex, (_match, prop) => {
    modified = true
    return `dataset['${prop}']`
  })

  if (modified) {
    fs.writeFileSync(filePath, content)
    return true
  }
  return false
}

// Main execution
const rootDir = '.'
const tsFiles = findTypeScriptFiles(rootDir)
let _fixedCount = 0

for (const file of tsFiles) {
  if (fixFile(file)) {
    _fixedCount++
  }
}
