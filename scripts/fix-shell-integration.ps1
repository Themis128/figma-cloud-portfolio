# Fix PowerShell shell integration for TypeScript output

$profileContent = @'

# Shell Integration Fix
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Disable experimental features that cause issues
$PSStyle.OutputRendering = 'PlainText'
'@

if (!(Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -ItemType File -Force | Out-Null
}

Add-Content -Path $PROFILE -Value $profileContent
Write-Host "Shell integration fixed. Restart your terminal." -ForegroundColor Green
