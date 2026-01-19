import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generatePDF() {
  const startTime = Date.now()
  let browser = null

  try {
    console.log('🚀 Starting PDF generation process...')

    const htmlPath = path.join(__dirname, '..', 'public', 'modern-resume.html')
    const pdfPath = path.join(__dirname, '..', 'public', 'resume.pdf')

    // Check if HTML file exists
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML template not found: ${htmlPath}. Run HTML generation first.`)
    }

    console.log('📄 Reading HTML template...')
    const htmlContent = fs.readFileSync(htmlPath, 'utf8')
    console.log(`📊 HTML file size: ${(htmlContent.length / 1024).toFixed(2)} KB`)

    console.log('🌐 Launching browser...')
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
      timeout: 30000,
    })

    console.log('📄 Creating new page...')
    const page = await browser.newPage()

    // Set viewport for better PDF rendering
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 1,
    })

    console.log('📝 Setting page content...')
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // Wait a bit for any animations or fonts to load
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('📋 Generating PDF...')
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    })

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    const stats = fs.statSync(pdfPath)

    console.log('✅ PDF generated successfully!')
    console.log(`📁 Output: ${pdfPath}`)
    console.log(`📄 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`📊 Pages: 1 (A4 format)`)
    console.log(`⏱️  Generated in ${duration}s`)
    console.log('')
    console.log('🎯 Resume is ready!')
    console.log('   • Download link: /resume.pdf')
    console.log('   • HTML preview: /modern-resume.html')
  } catch (error) {
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.error('❌ Error generating PDF:')
    console.error(`   ${error.message}`)
    console.error(`⏱️  Failed after ${duration}s`)

    if (error.message.includes('Browser has disconnected')) {
      console.error('')
      console.error('💡 Suggestions:')
      console.error('   • Try running again - browser connection issues are usually temporary')
      console.error('   • Check if Puppeteer is properly installed: pnpm add puppeteer')
      console.error('   • Ensure you have enough system memory')
    } else if (error.message.includes('HTML template not found')) {
      console.error('')
      console.error('💡 Suggestions:')
      console.error('   • Run HTML generation first: node scripts/generate-resume-html.js')
      console.error('   • Check if modern-resume.html exists in public/ directory')
    }

    process.exit(1)
  } finally {
    if (browser) {
      try {
        console.log('🔒 Closing browser...')
        await browser.close()
      } catch (closeError) {
        console.warn('⚠️  Warning: Could not close browser cleanly:', closeError.message)
      }
    }
  }
}

generatePDF()
