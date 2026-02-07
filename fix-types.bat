@echo off
cd /d "D:\Nuxt Projects\new-portfolio"
echo Installing missing type definitions...
pnpm add -D @types/compression
echo.
echo Done! Now run: pnpm dev
pause
