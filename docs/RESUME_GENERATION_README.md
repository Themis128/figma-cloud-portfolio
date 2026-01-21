# Resume PDF Generation

This document explains how to regenerate the resume PDF from the HTML template.

## Files

- `public/modern-resume.html` - The HTML template with modern styling
- `public/resume.pdf` - The generated PDF resume (356KB)

## Regenerating the PDF

If you need to update the resume content and regenerate the PDF:

1. Edit `public/modern-resume.html` with your changes
2. Install dependencies (if not already installed):

   ```bash
   cd project
   pnpm add -D puppeteer
   npx puppeteer browsers install chrome
   ```

3. Run the conversion script:

   ```bash
   cd project
   node -e "
   import fs from 'fs';
   import path from 'path';
   import { fileURLToPath } from 'url';
   import puppeteer from 'puppeteer';

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);

   async function convert() {
     const htmlPath = path.join(__dirname, 'public', 'modern-resume.html');
     const pdfPath = path.join(__dirname, 'public', 'resume.pdf');

     const htmlContent = fs.readFileSync(htmlPath, 'utf8');
     const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
     const page = await browser.newPage();
     await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
     await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }, preferCSSPageSize: true });
     await browser.close();
     console.log('PDF updated successfully');
   }
   convert();
   "
   ```

## Template Features

The resume template includes:

- Modern two-column layout inspired by professional CV templates
- ATS-friendly formatting
- Skill bars for technical competencies
- Professional color scheme (navy blue gradient)
- Responsive design optimized for A4 printing
- Clean typography and proper spacing

## Testing

Run the Playwright tests to verify the download functionality:

```bash
cd project
pnpm test:e2e --grep "resume"
```

Or run all portfolio-related tests:

```bash
cd project
npx playwright test tests/portfolio.spec.ts --project=chromium
```
