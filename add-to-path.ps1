# PowerShell script to add Node.js and pnpm to PATH
# Run this script as Administrator

$pathsToAdd = @(
    "C:\Program Files\nodejs",
    "C:\Users\baltz\AppData\Roaming\npm"
)

# Get current user PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

foreach ($path in $pathsToAdd) {
    if ($currentPath -notlike "*$path*") {
        Write-Host "Adding $path to PATH..." -ForegroundColor Green
        $newPath = "$currentPath;$path"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "Successfully added $path" -ForegroundColor Green
    } else {
        Write-Host "$path is already in PATH" -ForegroundColor Yellow
    }
}

Write-Host "`nPATH updated successfully!" -ForegroundColor Cyan
Write-Host "Please restart your terminal for changes to take effect." -ForegroundColor Cyan
Write-Host "`nTo verify, run in a new terminal:" -ForegroundColor White
Write-Host "  node --version" -ForegroundColor Gray
Write-Host "  pnpm --version" -ForegroundColor Gray
