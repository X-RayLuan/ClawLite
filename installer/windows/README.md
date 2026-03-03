# ClawLite Windows Installer - Fallback Plan

Complete Windows installer package using Inno Setup for ClawLite (OpenClaw Helper GUI).

## Overview

This installer automates:
- Node.js detection and installation (v20.11.0+)
- OpenClaw@2026.2.26 global npm installation
- ClawLite application setup
- Default configuration (127.0.0.1:4545)
- Desktop shortcut creation

## Prerequisites

### Build Machine Requirements
- Windows 10/11 (64-bit)
- [Inno Setup 6.x](https://jrsoftware.org/isdl.php) installed
- PowerShell 5.1+ (built-in on Windows 10+)
- ClawLite build artifacts in `../../build/` directory

### Build Artifacts Needed
```
build/
├── clawlite.exe          # Main executable
├── resources/            # App resources
└── [other runtime files]
```

## Build Steps

### 1. Prepare Build Directory
```powershell
# Ensure build artifacts exist
cd C:\path\to\clawlite
npm run build:win        # or your build command

# Verify build output
dir build\clawlite.exe
```

### 2. Compile Installer
```powershell
# Open Inno Setup Compiler
# File > Open > installer\windows-fallback\clawsitesetup.iss
# Build > Compile

# Or use command line:
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer\windows-fallback\clawsitesetup.iss
```

### 3. Output Location
Compiled installer will be in:
```
installer/windows-fallback/output/clawsitesetup-2026.2.26.exe
```

## Verification Steps

### Pre-Installation Testing
1. **Clean VM Test**
   - Use fresh Windows 10/11 VM
   - No Node.js or OpenClaw pre-installed
   - Run installer as Administrator

2. **Verify Node.js Installation**
   ```powershell
   node --version    # Should show v20.11.0+
   npm --version     # Should show npm version
   ```

3. **Verify OpenClaw Installation**
   ```powershell
   openclaw --version    # Should show 2026.2.26 or latest
   openclaw gateway status
   ```

4. **Verify ClawLite Installation**
   - Check installation directory: `C:\Program Files\ClawLite`
   - Verify desktop shortcut exists
   - Launch ClawLite from shortcut
   - Confirm connection to 127.0.0.1:4545

### Post-Installation Testing
1. **Application Launch**
   - Double-click desktop shortcut
   - Verify UI loads without errors
   - Check system tray icon appears

2. **Gateway Connection**
   - Start OpenClaw gateway: `openclaw gateway start`
   - Verify ClawLite connects automatically
   - Check connection status in UI

3. **Configuration**
   - Verify config file: `%USERPROFILE%\.clawlite\config.json`
   - Test settings changes persist
   - Verify theme switching works

4. **Uninstall Test**
   - Run uninstaller from Control Panel
   - Verify clean removal
   - Check if user data removal prompt works

## Manual Installation (Fallback)

If installer fails, users can install manually:

```powershell
# 1. Install Node.js
# Download from: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
# Run installer with default options

# 2. Install OpenClaw
npm install -g openclaw@2026.2.26

# 3. Extract ClawLite
# Unzip clawlite-portable.zip to desired location

# 4. Create config
mkdir $env:USERPROFILE\.clawlite
# Copy default-config.json to %USERPROFILE%\.clawlite\config.json

# 5. Run ClawLite
.\clawlite.exe --gateway 127.0.0.1:4545
```

## Troubleshooting

### Node.js Installation Fails
- Check internet connection
- Verify Windows Installer service is running
- Try manual Node.js installation first
- Check antivirus isn't blocking installer

### OpenClaw Installation Fails
- Verify npm is in PATH: `npm --version`
- Check npm registry access: `npm ping`
- Try manual installation: `npm install -g openclaw`
- Check npm logs: `%APPDATA%\npm-cache\_logs`

### ClawLite Won't Start
- Check Event Viewer for errors
- Verify all dependencies installed
- Run from command line to see errors:
  ```powershell
  cd "C:\Program Files\ClawLite"
  .\clawlite.exe --debug
  ```

### Gateway Connection Issues
- Verify gateway is running: `openclaw gateway status`
- Check firewall settings (allow port 4545)
- Test connection: `Test-NetConnection -ComputerName 127.0.0.1 -Port 4545`
- Check gateway logs: `%USERPROFILE%\.openclaw\logs`

## File Structure

```
installer/windows-fallback/
├── clawsitesetup.iss           # Inno Setup script
├── scripts/
│   ├── check-node.ps1           # Node.js verification
│   ├── install-openclaw.ps1     # OpenClaw installation
│   ├── setup-config.ps1         # Configuration setup
│   └── uninstall-cleanup.ps1    # Cleanup script
├── config/
│   └── default-config.json      # Default configuration
├── output/                      # Compiled installers (generated)
├── README.md                    # This file
└── QA-CHECKLIST.md             # Testing checklist
```

## Customization

### Change Gateway Address
Edit `config/default-config.json`:
```json
{
  "gateway": {
    "host": "your-host",
    "port": 4545
  }
}
```

### Change OpenClaw Version
Edit `clawsitesetup.iss`:
```ini
#define MyAppVersion "2026.2.26"
```

Edit `scripts/install-openclaw.ps1`:
```powershell
$OpenClawVersion = "2026.2.26"
```

### Add Custom Scripts
1. Add script to `scripts/` directory
2. Reference in `clawsitesetup.iss` [Run] section:
```ini
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\scripts\your-script.ps1"""
```

## Distribution

### Signing (Recommended)
```powershell
# Sign the installer with code signing certificate
signtool sign /f "certificate.pfx" /p "password" /t http://timestamp.digicert.com "clawsitesetup-2026.2.26.exe"
```

### Checksums
```powershell
# Generate SHA256 checksum
Get-FileHash "clawsitesetup-2026.2.26.exe" -Algorithm SHA256 | Format-List
```

### Upload Locations
- GitHub Releases
- Official website download page
- CDN for faster distribution

## Support

For issues or questions:
- GitHub Issues: https://github.com/openclaw/clawlite/issues
- Documentation: https://openclaw.com/docs
- Community: Discord/Forum links

## License

See LICENSE in the project root.
