# Install OpenClaw via npm
# ClawLite Windows Installer - OpenClaw Installation Script

$ErrorActionPreference = "Stop"
$OpenClawVersion = (Get-Content (Join-Path $PSScriptRoot "..\..\openclaw-version.txt") -Raw).Trim()

Write-Host "Installing OpenClaw@$OpenClawVersion..." -ForegroundColor Cyan

# Refresh PATH to ensure npm is available
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm not found. Please ensure Node.js is installed correctly." -ForegroundColor Red
    exit 1
}

# Install OpenClaw globally
Write-Host "Running: npm install -g openclaw@$OpenClawVersion" -ForegroundColor Cyan

try {
    $output = npm install -g "openclaw@$OpenClawVersion" 2>&1
    Write-Host $output
    
    # Verify installation
    $openclawVersion = openclaw --version 2>&1
    Write-Host "OpenClaw installed: $openclawVersion" -ForegroundColor Green
    
} catch {
    Write-Host "Failed to install OpenClaw: $_" -ForegroundColor Red
    Write-Host "Installation failed. Please install manually: npm install -g openclaw@$OpenClawVersion" -ForegroundColor Red
    exit 1
}

Write-Host "OpenClaw installation complete." -ForegroundColor Green
exit 0
