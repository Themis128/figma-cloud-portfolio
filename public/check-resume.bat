@echo off
echo ========================================
echo Resume Setup Verification
echo ========================================
echo.

cd /d "%~dp0"

if exist "resume.pdf" (
    echo ✅ SUCCESS: resume.pdf file found!
    echo.
    echo File details:
    for %%A in ("resume.pdf") do echo   Size: %%~zA bytes
    for %%A in ("resume.pdf") do echo   Date: %%~tA
    echo.
    echo 🎉 Your resume download should work perfectly now!
    echo.
    echo Test it by:
    echo 1. Running: npm run dev
    echo 2. Opening: http://localhost:8082
    echo 3. Clicking: "Download Resume" button
) else (
    echo ❌ ERROR: resume.pdf file NOT found!
    echo.
    echo Please add your resume PDF file as:
    echo   %~dp0resume.pdf
    echo.
    echo Make sure it's a valid PDF file that opens in Acrobat.
    echo.
    echo Current directory contents:
    dir /b
)

echo.
echo ========================================
pause