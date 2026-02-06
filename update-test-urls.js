const fs = require('node:fs')
const path = require('node:path')

// Function to recursively find all .spec.ts files
function findSpecFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory() && item !== 'node_modules') {
      files.push(...findSpecFiles(fullPath))
    } else if (item.endsWith('.spec.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

// Replace localhost:3001 with relative URLs
function updateTestFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Replace localhost:3001 URLs with relative paths
  content = content.replace(/http:\/\/localhost:3001\//g, '/')
  content = content.replace(/http:\/\/localhost:3001/g, '')

  fs.writeFileSync(filePath, content)
}

// Main execution
const testDir = './playwright-tests'
const specFiles = findSpecFiles(testDir)

for (const file of specFiles) {
  updateTestFile(file)
}
