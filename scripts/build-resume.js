#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function buildResume() {
  const startTime = Date.now()

  try {
    console.log('🚀 Building resume assets...')

    const publicDir = path.join(__dirname, '..', 'public')
    const markdownPath = path.join(publicDir, 'resume-content.md')
    const htmlPath = path.join(publicDir, 'modern-resume.html')
    const pdfPath = path.join(publicDir, 'resume.pdf')

    // Check if markdown source exists
    if (!fs.existsSync(markdownPath)) {
      console.log('⚠️  No resume-content.md found, skipping resume generation')
      return
    }

    console.log('📄 Found resume content, checking if rebuild needed...')

    // Check if we need to rebuild
    const markdownStats = fs.statSync(markdownPath)
    let needsRebuild = true

    if (fs.existsSync(htmlPath) && fs.existsSync(pdfPath)) {
      const htmlStats = fs.statSync(htmlPath)
      const pdfStats = fs.statSync(pdfPath)

      // Only rebuild if markdown is newer than both outputs
      if (htmlStats.mtime > markdownStats.mtime && pdfStats.mtime > markdownStats.mtime) {
        console.log('✅ Resume assets are up to date')
        needsRebuild = false
      }
    }

    if (needsRebuild) {
      console.log('🔄 Resume assets need updating...')

      // Generate HTML
      console.log('📝 Generating HTML...')
      execSync(`node "${path.join(__dirname, 'generate-resume-html.js')}"`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
      })

      // Generate PDF
      console.log('📋 Generating PDF...')
      execSync(`node "${path.join(__dirname, 'generate-resume.js')}"`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
      })

      console.log('✅ Resume build completed successfully!')
    }

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`⏱️  Resume build process completed in ${duration}s`)
  } catch (error) {
    console.error('❌ Resume build failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildResume()
}

export { buildResume }
