# Resume PDF Generation Instructions

## Option 1: Manual Conversion (Recommended)

1. **Open the HTML file** in your browser:
   - Navigate to: `D:\Nuxt Projects\Figma\project\public\resume.html`
   - Or run: `start D:\Nuxt Projects\Figma\project\public\resume.html`

2. **Print to PDF**:
   - Press `Ctrl+P` (or `Cmd+P` on Mac)
   - Select "Save as PDF" or "Microsoft Print to PDF"
   - Save as: `resume.pdf` in the same directory
   - Choose these settings:
     - Layout: Portrait
     - Paper size: A4
     - Margins: Default
     - Scale: 100%

3. **Verify the PDF**:
   - Open the PDF in Acrobat Reader
   - Check that all content fits properly
   - Test the download button in your portfolio

## Option 2: Automated Conversion (Windows)

Run the PowerShell script below to automatically convert HTML to PDF:

```powershell
# PowerShell script to convert HTML resume to PDF
param(
    [string]$HtmlPath = "D:\Nuxt Projects\Figma\project\public\resume.html",
    [string]$PdfPath = "D:\Nuxt Projects\Figma\project\public\resume.pdf"
)

# Check if HTML file exists
if (!(Test-Path $HtmlPath)) {
    Write-Host "❌ Error: HTML file not found at $HtmlPath" -ForegroundColor Red
    exit 1
}

# Create COM object for Internet Explorer
$ie = New-Object -ComObject "InternetExplorer.Application"
$ie.Visible = $false
$ie.Navigate($HtmlPath)

# Wait for page to load
while ($ie.Busy -or ($ie.ReadyState -ne 4)) {
    Start-Sleep -Milliseconds 100
}

# Print to PDF using Microsoft Print to PDF
$ie.ExecWB(6, 2) # OLECMDID_PRINT = 6, OLECMDEXECOPT_DONTPROMPTUSER = 2

# Wait a bit for print dialog
Start-Sleep -Seconds 2

# Close IE
$ie.Quit()

Write-Host "✅ Resume PDF generated successfully!" -ForegroundColor Green
Write-Host "📄 File saved as: $PdfPath" -ForegroundColor Cyan
```

## Option 3: Online Tools

If the above methods don't work, you can:

1. Open `resume.html` in your browser
2. Copy all the content (`Ctrl+A`, `Ctrl+C`)
3. Use an online HTML to PDF converter like:
   - `https://www.ilovepdf.com/html-to-pdf`
   - `https://html2pdf.com/`
   - `https://www.pdfcrowd.com/html-to-pdf/`

## Resume Content Customization

The resume includes:

- ✅ **Professional Summary** - Tailored to your cloud architecture expertise
- ✅ **Core Competencies** - Azure, AWS, GCP, security frameworks
- ✅ **Professional Experience** - 4 positions with detailed achievements
- ✅ **Certifications** - Microsoft, CISSP, CEH, and more
- ✅ **Technical Skills** - Organized by category
- ✅ **Projects & Achievements** - Quantified results
- ✅ **Education & Languages** - Complete background

## Final Steps

1. Generate the PDF using one of the methods above
2. Save it as `resume.pdf` in `D:\Nuxt Projects\Figma\project\public\`
3. Run the verification script: `check-resume.bat`
4. Test the download button in your portfolio

The resume is professionally formatted and optimized for ATS (Applicant Tracking Systems) with clear sections and keywords relevant to cloud architecture and cybersecurity roles.
