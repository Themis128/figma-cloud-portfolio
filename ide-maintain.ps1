# =============================================================================
# ide-maintain.ps1 — VS Code Insiders + IDE Automated Maintenance
# Runs via Windows Task Scheduler (PS7). Logs to project logs folder.
# =============================================================================

$LOG_DIR  = "D:\Nuxt Projects\new-portfolio\logs"
$LOG_FILE = "$LOG_DIR\ide-maintain.log"
$MAX_LOG_KB = 500
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }

function Log   { param($msg) $line = "[$TIMESTAMP] $msg"; Add-Content -Path $LOG_FILE -Value $line; Write-Host $line }
function LogOK { param($msg) Log "OK $msg" }
function LogErr{ param($msg) Log "ERR $msg" }

# Rotate log
if (Test-Path $LOG_FILE) {
    $logKB = (Get-Item $LOG_FILE).Length / 1KB
    if ($logKB -gt $MAX_LOG_KB) {
        $lines = Get-Content $LOG_FILE | Select-Object -Last 200
        Set-Content -Path $LOG_FILE -Value $lines
    }
}

Log "=============================="
Log "IDE Maintenance START"
Log "=============================="

# ── 1. VS CODE INSIDERS EXTENSION UPDATES ────────────────────────────────────
$codeInsiders = "C:\Users\baltz\AppData\Local\Programs\Microsoft VS Code Insiders\Code - Insiders.exe"
if (Test-Path $codeInsiders) {
    Log "--- Updating VS Code Insiders extensions ---"
    try {
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = $codeInsiders
        $pinfo.Arguments = "--update-extensions"
        $pinfo.RedirectStandardOutput = $true
        $pinfo.RedirectStandardError  = $true
        $pinfo.UseShellExecute = $false
        $pinfo.CreateNoWindow  = $true
        $p = New-Object System.Diagnostics.Process; $p.StartInfo = $pinfo; $p.Start() | Out-Null
        $done = $p.WaitForExit(60000)
        $out  = $p.StandardOutput.ReadToEnd().Trim()
        $err  = $p.StandardError.ReadToEnd().Trim()
        if ($out) { Log "  $out" }
        LogOK "VS Code Insiders: extensions updated (exit $($p.ExitCode))"
    } catch { LogErr "VS Code Insiders: extension update failed - $_" }
} else {
    Log "VS Code Insiders: not found at $codeInsiders"
}

# ── 2. CLEAR VS CODE CACHES ────────────────────────────────────────────────────
$cachePaths = @(
    "$env:APPDATA\Code\logs",
    "$env:APPDATA\Code\CachedData",
    "$env:APPDATA\Code\CachedExtensionVSIXs",
    "$env:APPDATA\Code\blob_storage",
    "$env:APPDATA\Code - Insiders\logs",
    "$env:APPDATA\Code - Insiders\CachedData",
    "$env:APPDATA\Code - Insiders\CachedExtensionVSIXs",
    "$env:APPDATA\Code - Insiders\blob_storage"
)

$totalFreedMB = 0
foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        $sizeMB = [math]::Round(
            (Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue |
             Measure-Object -Property Length -Sum).Sum / 1MB, 1)
        try {
            Get-ChildItem $path -ErrorAction SilentlyContinue |
                Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            $totalFreedMB += $sizeMB
            LogOK "Cache cleared: $(Split-Path $path -Leaf) ($sizeMB MB)"
        } catch { LogErr "Cache clear failed: $path" }
    }
}
LogOK "Total VS Code cache freed: $totalFreedMB MB"

# ── 3. NPX CACHE (Windows side) ────────────────────────────────────────────────
$npxCache = "D:\npm-cache\_npx"
if (Test-Path $npxCache) {
    $npxSizeMB = [math]::Round(
        (Get-ChildItem $npxCache -Recurse -ErrorAction SilentlyContinue |
         Measure-Object -Property Length -Sum).Sum / 1MB, 1)
    Get-ChildItem $npxCache -ErrorAction SilentlyContinue |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    LogOK "npx cache cleared: $npxSizeMB MB"
}

# ── 4. KILL ZOMBIE NODE/NPX PROCESSES ─────────────────────────────────────────
Log "--- Checking for zombie node processes ---"
$KEEP_PATTERNS   = @('vite','nuxt','next','tsx','playwright','pnpm','aws-lsp','AmazonQ',
                     'codewhisperer','github-actions','software-planning','pdf-filler',
                     'kubernetes','spotify','figma','hubspot','sentry','browser-tools',
                     'run-with-secrets','Windows-MCP','wsl','Ubuntu')
$ZOMBIE_PATTERNS = @('_npx','bootstrapper','npx-cli')

$nodeProcs = Get-Process -Name node,npx -ErrorAction SilentlyContinue
$killed = 0; $kept = 0
foreach ($proc in $nodeProcs) {
    try {
        $ci  = Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)" -ErrorAction SilentlyContinue
        $cmd = $ci.CommandLine
        if (-not $cmd) { continue }
        $isKeep   = $KEEP_PATTERNS   | Where-Object { $cmd -like "*$_*" }
        $isZombie = $ZOMBIE_PATTERNS | Where-Object { $cmd -like "*$_*" }
        if ($isZombie -and -not $isKeep) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            $killed++; Log "  Killed zombie PID=$($proc.Id)"
        } else { $kept++ }
    } catch {}
}
LogOK "Zombie cleanup: $killed killed, $kept kept"

# ── 5. PNPM STORE PRUNE (Windows) ──────────────────────────────────────────────
$PNPM_BIN = "C:\Users\baltz\AppData\Roaming\npm\pnpm.CMD"
if (Test-Path $PNPM_BIN) {
    Log "--- pnpm store prune (Windows) ---"
    $job = Start-Job {
        $p = New-Object System.Diagnostics.ProcessStartInfo
        $p.FileName = "C:\Users\baltz\AppData\Roaming\npm\pnpm.CMD"
        $p.Arguments = "store prune"
        $p.RedirectStandardOutput = $true; $p.RedirectStandardError = $true
        $p.UseShellExecute = $false; $p.CreateNoWindow = $true
        $proc = New-Object System.Diagnostics.Process; $proc.StartInfo = $p; $proc.Start() | Out-Null
        $proc.WaitForExit(55000) | Out-Null
        $proc.StandardOutput.ReadToEnd().Trim()
    }
    $done = Wait-Job $job -Timeout 60
    if ($done) {
        $result = Receive-Job $job
        if ($result) { Log "  pnpm: $result" }
        LogOK "pnpm store pruned"
    } else {
        Stop-Job $job -Force
        LogErr "pnpm store prune timed out"
    }
    Remove-Job $job -Force -ErrorAction SilentlyContinue
}

# ── 6. TEMP CLEANUP ─────────────────────────────────────────────────────────────
$removed = 0
Get-ChildItem "$env:TEMP" -Filter "vscode-*" -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem "$env:TEMP" -Filter "npm-*" -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
LogOK "Temp files cleaned"

# ── 7. DISK SPACE REPORT ────────────────────────────────────────────────────────
foreach ($driveLetter in @('C','D')) {
    $drive = Get-PSDrive $driveLetter -ErrorAction SilentlyContinue
    if ($drive -and $drive.Used -ne $null) {
        $usedGB  = [math]::Round($drive.Used  / 1GB, 1)
        $totalGB = [math]::Round(($drive.Used + $drive.Free) / 1GB, 1)
        $pct     = [math]::Round($drive.Used / ($drive.Used + $drive.Free) * 100, 1)
        Log "Disk ${driveLetter}: ${usedGB}GB / ${totalGB}GB (${pct}%)"
    }
}

Log "=============================="
Log "IDE Maintenance DONE"
Log "=============================="