# Setup ClawLite Configuration
# ClawLite Windows Installer - Configuration Script

$ErrorActionPreference = "Stop"

Write-Host "Configuring ClawLite..." -ForegroundColor Cyan

# Define paths
$appPath = Split-Path -Parent $PSScriptRoot
$configSource = Join-Path $appPath "config\default-config.json"
$userConfigDir = Join-Path $env:USERPROFILE ".clawlite"
$userConfigPath = Join-Path $userConfigDir "config.json"

# Create user config directory
if (-not (Test-Path $userConfigDir)) {
    New-Item -ItemType Directory -Path $userConfigDir -Force | Out-Null
    Write-Host "Created config directory: $userConfigDir" -ForegroundColor Green
}

# Copy default config if user config doesn't exist
if (-not (Test-Path $userConfigPath)) {
    if (Test-Path $configSource) {
        Copy-Item $configSource $userConfigPath -Force
        Write-Host "Default configuration copied to: $userConfigPath" -ForegroundColor Green
    } else {
        # Create minimal default config
        $defaultConfig = @{
            gateway = @{
                host = "127.0.0.1"
                port = 4545
            }
            autoStart = $false
            minimizeToTray = $true
            theme = "system"
        } | ConvertTo-Json -Depth 10
        
        Set-Content -Path $userConfigPath -Value $defaultConfig -Encoding UTF8
        Write-Host "Created default configuration: $userConfigPath" -ForegroundColor Green
    }
}

# Create desktop shortcut with helper launch option
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "ClawLite.lnk"
$targetPath = Join-Path $appPath "clawlite.exe"

if (Test-Path $targetPath) {
    $WScriptShell = New-Object -ComObject WScript.Shell
    $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $targetPath
    $shortcut.Arguments = "--gateway 127.0.0.1:4545"
    $shortcut.WorkingDirectory = $appPath
    $shortcut.Description = "ClawLite - OpenClaw Helper GUI"
    $shortcut.Save()
    Write-Host "Desktop shortcut created: $shortcutPath" -ForegroundColor Green
}

# Set up OpenClaw gateway config
$openclawConfigDir = Join-Path $env:USERPROFILE ".openclaw"
if (-not (Test-Path $openclawConfigDir)) {
    New-Item -ItemType Directory -Path $openclawConfigDir -Force | Out-Null
}

$gatewayConfigPath = Join-Path $openclawConfigDir "gateway.json"
if (-not (Test-Path $gatewayConfigPath)) {
    $gatewayConfig = @{
        host = "127.0.0.1"
        port = 4545
        autoStart = $false
    } | ConvertTo-Json -Depth 10
    
    Set-Content -Path $gatewayConfigPath -Value $gatewayConfig -Encoding UTF8
    Write-Host "OpenClaw gateway config created: $gatewayConfigPath" -ForegroundColor Green
}

Write-Host "Configuration complete." -ForegroundColor Green
Write-Host "ClawLite will connect to OpenClaw Gateway at 127.0.0.1:4545" -ForegroundColor Cyan

exit 0
