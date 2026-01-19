#!/usr/bin/env node

/**
 * Image Optimization Script
 * This script optimizes images for the project using various tools
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, '..', 'public')
const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg']

console.log('🔍 Scanning for images to optimize...')

// Find all image files
function findImages(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findImages(fullPath))
    } else if (imageExtensions.includes(path.extname(item).toLowerCase())) {
      files.push(fullPath)
    }
  }

  return files
}

const images = findImages(publicDir)

if (images.length === 0) {
  console.log('✅ No images found to optimize')
  process.exit(0)
}

console.log(`📁 Found ${images.length} image(s) to optimize:`)
images.forEach((img) => console.log(`  - ${path.relative(publicDir, img)}`))

// Check if sharp is available for optimization
let sharp = null
try {
  sharp = (await import('sharp')).default
  console.log('🛠️  Using Sharp for image optimization...')
} catch (error) {
  console.log('⚠️  Sharp not available, falling back to basic checks...')

  // Basic file size reporting
  console.log('\n📊 Image sizes:')
  images.forEach((img) => {
    const stats = fs.statSync(img)
    const sizeKB = (stats.size / 1024).toFixed(1)
    console.log(`  - ${path.relative(publicDir, img)}: ${sizeKB} KB`)
  })

  console.log('\n💡 To enable automatic optimization, install Sharp:')
  console.log('   pnpm add -D sharp')
  console.log('\n🛠️  Vite Image Optimizer plugin is configured for build-time optimization')
  process.exit(0)
}

// Process each image
for (const imagePath of images) {
  const ext = path.extname(imagePath).toLowerCase()
  const name = path.basename(imagePath, ext)
  const dir = path.dirname(imagePath)

  if (ext === '.svg') {
    console.log(`⏭️  Skipping SVG: ${path.relative(publicDir, imagePath)}`)
    continue
  }

  try {
    const sharpInstance = sharp(imagePath)

    // Get image info
    const info = await sharpInstance.metadata()

    console.log(
      `🔄 Optimizing: ${path.relative(publicDir, imagePath)} (${info.width}x${
        info.height
      }, ${info.format})`,
    )

    // Optimize based on actual format, not extension
    let optimizedBuffer

    if (info.format === 'png') {
      optimizedBuffer = await sharpInstance.png({ quality: 80, compressionLevel: 9 }).toBuffer()
    } else if (info.format === 'jpeg' || info.format === 'jpg') {
      optimizedBuffer = await sharpInstance.jpeg({ quality: 80, progressive: true }).toBuffer()
    } else {
      console.log(`⏭️  Skipping unsupported format: ${info.format}`)
      continue
    }

    // Write optimized image to temporary file first, then rename
    const tempPath = `${imagePath}.tmp`
    fs.writeFileSync(tempPath, optimizedBuffer)
    fs.renameSync(tempPath, imagePath)

    const newSize = fs.statSync(imagePath).size
    console.log(
      `✅ Optimized: ${path.relative(publicDir, imagePath)} (${(newSize / 1024).toFixed(1)} KB)`,
    )

    // Generate WebP version
    const webpPath = path.join(dir, `${name}.webp`)
    await sharpInstance.webp({ quality: 85, effort: 6 }).toFile(webpPath)

    // Generate AVIF version
    const avifPath = path.join(dir, `${name}.avif`)
    await sharpInstance.avif({ quality: 70, effort: 6 }).toFile(avifPath)

    console.log(`🎯 Generated WebP and AVIF versions for ${name}`)
  } catch (error) {
    console.error(`❌ Failed to optimize ${path.relative(publicDir, imagePath)}:`, error.message)
  }
}

console.log('🎉 Image optimization complete!')
