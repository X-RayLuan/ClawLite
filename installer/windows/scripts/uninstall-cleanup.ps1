# ClawLite Uninstall Cleanup Script
# Removes user data and configuration (optional)

$ErrorActionPreference = "Continue"

Write-Host "ClawLite Uninstall Cleanup" -ForegroundColor Cyan

# Ask user if they want to remove user data
$response = Read-Host "Remove user configuration and data? (y/N)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "Removing user data..." -ForegroundColor Yellow
    
    # Remove user config directory
    $userConfigDir = Join-Path $env:USERPROFILE ".clawlite"
    if (Test-Path $userConfigDir) {
        Remove-Item $userConfigDir -Recurse -Force
        Write-Host "Removed: $userConfigDir" -ForegroundColor Green
    }
    
    # Remove desktop shortcut
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "ClawLite.lnk"
    if (Test-Path $shortcutPath) {
        Remove-Item $shortcutPath -Force
        Write-Host "Removed desktop shortcut" -ForegroundColor Green
    }
    
    Write-Host "User data removed." -ForegroundColor Green
} else {
    Write-Host "User data preserved." -ForegroundColor Cyan
}

Write-Host "Uninstall cleanup complete." -ForegroundColor Green
exit 0
