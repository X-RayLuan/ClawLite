# ClawLite Windows Installer - QA Checklist

## Pre-Build Verification

- [ ] Build artifacts exist in `../../build/` directory
- [ ] `clawlite.exe` is present and functional
- [ ] All dependencies bundled correctly
- [ ] Version numbers match across all files
- [ ] LICENSE file is present in project root
- [ ] Inno Setup 6.x is installed on build machine

## Build Process

- [ ] Inno Setup script compiles without errors
- [ ] No warnings during compilation
- [ ] Output installer file created in `output/` directory
- [ ] Installer file size is reasonable (< 100MB)
- [ ] Installer filename includes correct version number

## Clean Installation Test (Fresh Windows VM)

### Environment Setup
- [ ] Windows 10/11 64-bit VM
- [ ] No Node.js installed
- [ ] No OpenClaw installed
- [ ] No previous ClawLite installation
- [ ] Administrator privileges available

### Installation Process
- [ ] Installer launches without errors
- [ ] License agreement displays correctly
- [ ] Installation directory selection works
- [ ] Progress bar updates during installation
- [ ] Node.js check script executes
- [ ] Node.js downloads and installs (if needed)
- [ ] OpenClaw installs via npm
- [ ] Configuration files created
- [ ] Desktop shortcut created
- [ ] Start menu entries created
- [ ] Installation completes successfully
- [ ] "Launch ClawLite" option works

### Post-Installation Verification
- [ ] Node.js version: `node --version` shows v20.11.0+
- [ ] npm version: `npm --version` shows version
- [ ] OpenClaw installed: `openclaw --version` shows 2026.2.26
- [ ] ClawLite installed in `C:\Program Files\ClawLite`
- [ ] Config file exists: `%USERPROFILE%\.clawlite\config.json`
- [ ] Desktop shortcut exists and works
- [ ] Start menu shortcut exists and works

## Application Functionality

### Launch and UI
- [ ] ClawLite launches from desktop shortcut
- [ ] Application window appears
- [ ] UI renders correctly (no visual glitches)
- [ ] System tray icon appears
- [ ] Minimize to tray works
- [ ] Restore from tray works

### Gateway Connection
- [ ] Start OpenClaw gateway: `openclaw gateway start`
- [ ] ClawLite connects to 127.0.0.1:4545
- [ ] Connection status shows "Connected"
- [ ] Gateway commands work through UI
- [ ] Disconnect/reconnect works
- [ ] Connection survives gateway restart

### Configuration
- [ ] Settings dialog opens
- [ ] Theme switching works (light/dark/system)
- [ ] Gateway host/port can be changed
- [ ] Auto-start option toggles
- [ ] Minimize to tray option toggles
- [ ] Settings persist after restart
- [ ] Invalid settings show error messages

### Performance
- [ ] Application starts in < 5 seconds
- [ ] UI is responsive (no freezing)
- [ ] Memory usage is reasonable (< 200MB)
- [ ] CPU usage is low when idle (< 5%)
- [ ] No memory leaks after 1 hour runtime

## Upgrade Installation Test

### Environment Setup
- [ ] Previous ClawLite version installed
- [ ] Node.js already installed
- [ ] OpenClaw already installed

### Upgrade Process
- [ ] Installer detects existing installation
- [ ] Upgrade option presented
- [ ] Existing settings preserved
- [ ] Application files updated
- [ ] No duplicate shortcuts created
- [ ] Upgrade completes successfully

### Post-Upgrade Verification
- [ ] Application launches with new version
- [ ] Previous settings still work
- [ ] No data loss
- [ ] Gateway connection still works

## Uninstallation Test

### Uninstall Process
- [ ] Uninstaller launches from Control Panel
- [ ] Uninstall wizard appears
- [ ] Progress bar updates
- [ ] User data removal prompt appears
- [ ] Uninstall completes successfully

### Post-Uninstall Verification
- [ ] Application files removed from `C:\Program Files\ClawLite`
- [ ] Desktop shortcut removed
- [ ] Start menu entries removed
- [ ] User config preserved (if user chose to keep)
- [ ] User config removed (if user chose to remove)
- [ ] No registry entries left behind
- [ ] Node.js still installed (not removed)
- [ ] OpenClaw still installed (not removed)

## Edge Cases and Error Handling

### Network Issues
- [ ] Installer handles no internet connection gracefully
- [ ] Node.js download failure shows clear error
- [ ] npm install failure shows clear error
- [ ] Retry mechanism works

### Permission Issues
- [ ] Non-admin user gets clear error message
- [ ] UAC prompt appears when needed
- [ ] Installation fails gracefully without admin rights

### Disk Space
- [ ] Installer checks available disk space
- [ ] Clear error if insufficient space
- [ ] Partial installation cleaned up on failure

### Antivirus/Firewall
- [ ] Installer works with Windows Defender
- [ ] No false positive virus warnings
- [ ] Firewall doesn't block gateway connection
- [ ] Instructions provided if blocked

### Existing Installations
- [ ] Detects conflicting Node.js versions
- [ ] Handles existing OpenClaw installations
- [ ] Doesn't break existing npm packages

## Compatibility Testing

### Windows Versions
- [ ] Windows 10 (21H2)
- [ ] Windows 10 (22H2)
- [ ] Windows 11 (21H2)
- [ ] Windows 11 (22H2)
- [ ] Windows 11 (23H2)

### System Configurations
- [ ] Clean Windows installation
- [ ] Windows with existing dev tools
- [ ] Windows with antivirus software
- [ ] Windows with corporate policies
- [ ] Windows in non-English locale

## Security Testing

- [ ] Installer is code-signed (if applicable)
- [ ] No malware detected by VirusTotal
- [ ] PowerShell scripts don't trigger SmartScreen
- [ ] No sensitive data in logs
- [ ] HTTPS used for all downloads
- [ ] Checksums verified for downloads

## Documentation Testing

- [ ] README.md is accurate and complete
- [ ] Build steps work as documented
- [ ] Troubleshooting section covers common issues
- [ ] Manual installation steps work
- [ ] All file paths are correct

## Final Checks

- [ ] Version number correct in all files
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] SHA256 checksum generated
- [ ] Installer uploaded to distribution server
- [ ] Download link tested
- [ ] Installation guide published
