# ClawLite Windows CI Build Guide

This document explains how to trigger a Windows build via GitHub Actions from a Mac and download the artifacts.

## Overview

Using GitHub Actions CI, you can push code from a Mac and automatically build Windows installers (exe/msi) in a Windows environment without needing a local Windows machine.

## Architecture

- **Electron shell**: `electron-main.js` loads the Next.js static export (`out/`)
- **Build tool**: electron-builder
- **CI environment**: GitHub Actions (windows-latest)
- **Artifacts**:
  - `ClawLite Setup X.X.X.exe` (NSIS installer)
  - `ClawLite X.X.X.exe` (portable version)

## Triggering a Build from Mac

### Method 1: Push to trigger

```bash
cd /Users/m1/Projects/clawlite
git add .
git commit -m "Update ClawLite"
git push origin main
```

GitHub Actions triggers automatically after push.

### Method 2: Manual trigger (recommended)

1. Go to the GitHub repository page
2. Click the **Actions** tab
3. Select the **Build Windows Installer** workflow
4. Click **Run workflow**
5. Select branch (default: main)
6. Click **Run workflow** to confirm

## Downloading Build Artifacts

### Via GitHub Web UI

1. Go to the **Actions** tab
2. Click the latest workflow run
3. Scroll to the **Artifacts** section at the bottom
4. Download:
   - `windows-installer` (contains .exe installer)
   - `windows-portable` (portable .zip, if available)

### Via GitHub CLI (gh)

```bash
# List recent workflow runs
gh run list --workflow=build-windows-installer.yml --limit 5

# Download artifacts from the latest build
gh run download --name windows-installer

# Download artifacts from a specific run
gh run download <run-id> --name windows-installer
```

## Artifact Details

### ClawLite Setup X.X.X.exe
- **Type**: NSIS installer
- **Features**:
  - Configurable install path
  - Desktop shortcut
  - Start menu shortcut
  - Uninstaller included
- **Use case**: Standard Windows installation

### ClawLite X.X.X.exe (Portable)
- **Type**: Single-file executable
- **Features**:
  - No installation required
  - Extract and run
  - USB-portable
- **Use case**: Testing, temporary use

## Local Build (Optional)

To build locally on Mac (config only — cannot produce Windows exe):

```bash
cd /Users/m1/Projects/clawlite

# Install dependencies
npm install

# Build Next.js static site
npm run build:next

# Attempt Windows build (will fail on Mac — use CI instead)
npm run build:win
```

**Note**: Mac cannot produce Windows exe directly. Use CI or a Windows machine.

## Build Pipeline Details

### 1. Install dependencies
```bash
npm ci
```

### 2. Build Next.js static site
```bash
npm run build:next
```
- Output directory: `out/`
- Contains all static HTML/CSS/JS

### 3. Package Electron app
```bash
npm run build:win
```
- electron-builder reads the `build` config from `package.json`
- Packages `out/` and `electron-main.js`
- Produces Windows installer in `dist/`

### 4. Upload Artifacts
GitHub Actions automatically uploads `dist/*.exe` to Artifacts.

## Configuration Files

### package.json
```json
{
  "main": "electron-main.js",
  "scripts": {
    "build:next": "next build",
    "build:electron": "npm run build:next && electron-builder",
    "build:win": "npm run build:next && electron-builder --win"
  },
  "build": {
    "appId": "com.clawlite.app",
    "productName": "ClawLite",
    "directories": {
      "output": "dist"
    },
    "files": [
      "out/**/*",
      "electron-main.js",
      "public/**/*",
      "package.json"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### next.config.mjs
```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // static export
  images: {
    unoptimized: true,  // required for static export
  },
};
```

### electron-main.js
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = `file://${path.join(__dirname, 'out/index.html')}`;
  mainWindow.loadURL(startUrl);
}

app.on('ready', createWindow);
```

## Troubleshooting

### Build Failures

**Check Actions logs**:
1. Go to the Actions tab
2. Click the failed run
3. Review error messages in specific steps

**Common issues**:
- **Dependency install failure**: Check `package.json` dependency versions
- **Next.js build failure**: Check for code syntax errors
- **electron-builder failure**: Check `build` configuration

### Missing Artifacts

**Check Artifacts**:
- Confirm the workflow completed successfully
- Check whether `dist/` generated files
- Review the upload-artifact step logs

### Missing Icon

If the build warns about a missing icon:
```bash
# Create placeholder icon
mkdir -p public
# Download or create icon.png (256x256 or larger)
```

## Version Management

### Updating the Version

Edit `package.json`:
```json
{
  "version": "0.2.0"
}
```

Build artifacts automatically include the version number:
- `ClawLite Setup 0.2.0.exe`

### Publishing a Release

```bash
# Create tag
git tag v0.2.0
git push origin v0.2.0

# Create a Release on the GitHub Releases page
# Upload build artifacts
```

## Automation Tips

### Scheduled Builds

Add to `.github/workflows/build-windows-installer.yml`:
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at UTC 02:00
```

### Automatic Release Publishing

Add a step:
```yaml
- name: Create Release
  if: startsWith(github.ref, 'refs/tags/')
  uses: softprops/action-gh-release@v1
  with:
    files: dist/*.exe
```

## Security Notes

- **Do not commit secrets**: Use GitHub Secrets for sensitive information
- **Code signing**: Consider purchasing a code signing certificate for production
- **Artifact retention**: Default 30 days, adjustable

## Support

- **GitHub Issues**: Report build problems
- **Actions docs**: https://docs.github.com/actions
- **electron-builder docs**: https://www.electron.build/

---

**Last updated**: 2026-03-02
**Maintainer**: Ray
