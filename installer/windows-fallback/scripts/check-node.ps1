# Check and Install Node.js
# ClawLite Windows Installer - Node.js Verification Script

$ErrorActionPreference = "Stop"
$NodeVersion = "20.11.0"
$NodeInstallerUrl = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-x64.msi"

Write-Host "Checking Node.js installation..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) {
        $currentVersion = node --version
        Write-Host "Node.js found: $currentVersion" -ForegroundColor Green
        
        # Parse version numbers
        $current = $currentVersion -replace 'v', ''
        $required = $NodeVersion
        
        if ([version]$current -ge [version]$required) {
            Write-Host "Node.js version is sufficient." -ForegroundColor Green
            exit 0
        } else {
            Write-Host "Node.js version is outdated. Upgrading..." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Node.js not found. Installing..." -ForegroundColor Yellow
}

# Download Node.js installer
$installerPath = "$env:TEMP\node-installer.msi"
Write-Host "Downloading Node.js v$NodeVersion..." -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $NodeInstallerUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Download complete." -ForegroundColor Green
} catch {
    Write-Host "Failed to download Node.js installer: $_" -ForegroundColor Red
    exit 1
}

# Install Node.js silently
Write-Host "Installing Node.js..." -ForegroundColor Cyan
try {
    Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait -NoNewWindow
    Write-Host "Node.js installed successfully." -ForegroundColor Green
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    # Verify installation
    $nodeVersion = node --version
    Write-Host "Installed Node.js version: $nodeVersion" -ForegroundColor Green
    
} catch {
    Write-Host "Failed to install Node.js: $_" -ForegroundColor Red
    exit 1
} finally {
    # Cleanup
    if (Test-Path $installerPath) {
        Remove-Item $installerPath -Force
    }
}

exit 0
