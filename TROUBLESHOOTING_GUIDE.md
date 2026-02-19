# VS Code Insiders Issues - Troubleshooting Guide

## Quick Fixes

### 1. Run Diagnostics First
```powershell
# In PowerShell (Run as Administrator)
cd "D:\Nuxt Projects\new-portfolio"
.\diagnose-issues.ps1
```

This will create 4 files with detailed error information:
- `typecheck-errors.txt` - TypeScript compilation errors
- `lint-errors.txt` - Code quality issues
- `outdated-deps.txt` - Outdated packages
- `build-errors.txt` - Build process errors

---

## Common Issues & Solutions

### Issue 1: EMFILE - Too Many Open Files
**Symptoms:** VS Code shows "EMFILE: too many open files"

**Solution:**
1. Close VS Code Insiders completely
2. Open Task Manager (Ctrl+Shift+Esc)
3. End all "node.exe" and "Code - Insiders" processes
4. Update MCP server configuration (already done)
5. Restart VS Code Insiders

### Issue 2: Missing Dependencies
**Symptoms:** Import errors, red squiggly lines

**Solution:**
```powershell
# Force reinstall all dependencies
pnpm install --force

# If that doesn't work, clean install:
Remove-Item node_modules -Recurse -Force
Remove-Item pnpm-lock.yaml -Force
pnpm install
```

### Issue 3: TypeScript Errors
**Symptoms:** Type errors in VS Code

**Solution:**
```powershell
# Check for type errors
pnpm typecheck

# Common fixes:
# 1. Restart TypeScript server in VS Code:
#    Ctrl+Shift+P → "TypeScript: Restart TS Server"
#
# 2. Clear VS Code cache:
#    Close VS Code
#    Delete: %APPDATA%\Code - Insiders\Cache
#    Delete: %APPDATA%\Code - Insiders\CachedData
```

### Issue 4: Path Resolution Issues
**Symptoms:** Cannot find module '@/...'

**Solution:**
Check `tsconfig.json` has correct paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./client/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### Issue 5: Build Failures
**Symptoms:** Build fails with errors

**Solution:**
```powershell
# Clean build
Remove-Item dist -Recurse -Force
pnpm build:no-secrets

# If secrets are the issue:
# 1. Copy .env.example to .env
# 2. Fill in required values
# 3. Run: pnpm build
```

### Issue 6: Port Conflicts
**Symptoms:** "Port 8082 is already in use"

**Solution:**
```powershell
# Find process using port 8082
netstat -ano | findstr :8082

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F

# Or use different port in vite.config.ts
```

### Issue 7: WSL2 Connection Issues
**Symptoms:** AWS MCP servers fail to start

**Solution:**
```powershell
# Restart WSL
wsl --shutdown
wsl

# Check WSL2 is running Ubuntu-24.04
wsl -l -v

# Test WSL connectivity
wsl -d Ubuntu-24.04 -- bash -l -c "echo 'WSL OK'"
```

---

## VS Code Specific Fixes

### Reset VS Code Insiders
1. Close VS Code Insiders
2. Delete these folders:
   ```powershell
   Remove-Item "$env:APPDATA\Code - Insiders\Cache" -Recurse -Force
   Remove-Item "$env:APPDATA\Code - Insiders\CachedData" -Recurse -Force
   Remove-Item "$env:APPDATA\Code - Insiders\CachedExtensionVSIXs" -Recurse -Force
   ```
3. Restart VS Code Insiders

### Extension Issues
1. Disable all extensions temporarily
2. Reload window
3. Enable extensions one by one
4. Identify problematic extension

### IntelliSense Not Working
```
1. Ctrl+Shift+P
2. "Developer: Reload Window"
3. If still broken: "TypeScript: Restart TS Server"
```

---

## Environment Setup

### Required Environment Variables
Check your `.env` file has these set:
```bash
# Minimum required for development
NODE_ENV=development

# Required for Firebase features
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_PROJECT_ID=xxx

# Required for AWS features (if using)
AWS_REGION=eu-central-1
AWS_PROFILE=default
```

### Verify Node/pnpm Versions
```powershell
node --version   # Should be v20+
pnpm --version   # Should be v10+
```

---

## Still Having Issues?

### Generate Full Diagnostic Report
```powershell
# This creates detailed logs
.\diagnose-issues.ps1

# Then share these files:
# - typecheck-errors.txt
# - lint-errors.txt
# - build-errors.txt
```

### Check VS Code Output Panels
1. View → Output (Ctrl+Shift+U)
2. Select from dropdown:
   - "Model Context Protocol" (MCP errors)
   - "TypeScript" (TS errors)
   - "Tasks" (Build errors)
   - "Extensions" (Extension errors)

### VS Code Developer Tools
1. Help → Toggle Developer Tools
2. Check Console tab for JavaScript errors

---

## Next Steps After Fixing

1. Verify build works:
   ```powershell
   pnpm build:no-secrets
   ```

2. Run tests:
   ```powershell
   pnpm test
   ```

3. Start development server:
   ```powershell
   pnpm dev
   ```

4. Check application at: http://localhost:8082

---

## Emergency Recovery

If nothing works, nuclear option:
```powershell
# 1. Backup your work
git commit -am "Backup before reset"

# 2. Clean everything
Remove-Item node_modules -Recurse -Force
Remove-Item dist -Recurse -Force
Remove-Item .vite -Recurse -Force
Remove-Item pnpm-lock.yaml -Force

# 3. Reinstall
pnpm install

# 4. Test build
pnpm build:no-secrets

# 5. Restart VS Code Insiders
```
