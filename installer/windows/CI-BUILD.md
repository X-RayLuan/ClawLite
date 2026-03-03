# ClawLite Windows CI Build Guide

本文档说明如何通过 GitHub Actions 在 Mac 上触发 Windows 打包并下载产物。

## 概述

通过 GitHub Actions CI，Ray 可以在 Mac 上推送代码，自动在 Windows 环境中构建 Windows 安装包（exe/msi），无需本地 Windows 环境。

## 架构

- **Electron 壳**：`electron-main.js` 加载 Next.js 静态导出（`out/`）
- **构建工具**：electron-builder
- **CI 环境**：GitHub Actions (windows-latest)
- **产物**：
  - `ClawLite Setup X.X.X.exe` (NSIS 安装器)
  - `ClawLite X.X.X.exe` (便携版)

## 从 Mac 触发构建

### 方法 1：推送代码触发

```bash
cd /Users/m1/Projects/clawlite
git add .
git commit -m "Update ClawLite"
git push origin main
```

推送后，GitHub Actions 自动触发构建。

### 方法 2：手动触发（推荐）

1. 访问 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择 **Build Windows Installer** workflow
4. 点击 **Run workflow** 按钮
5. 选择分支（默认 main）
6. 点击 **Run workflow** 确认

## 下载构建产物

### 通过 GitHub Web UI

1. 访问 **Actions** 标签
2. 点击最新的 workflow run
3. 滚动到页面底部 **Artifacts** 区域
4. 下载：
   - `windows-installer` (包含 .exe 安装器)
   - `windows-portable` (便携版 .zip，如果有)

### 通过 GitHub CLI (gh)

```bash
# 列出最近的 workflow runs
gh run list --workflow=build-windows-installer.yml --limit 5

# 下载最新构建的 artifacts
gh run download --name windows-installer

# 下载特定 run 的 artifacts
gh run download <run-id> --name windows-installer
```

## 产物说明

### ClawLite Setup X.X.X.exe
- **类型**：NSIS 安装器
- **特性**：
  - 可选安装路径
  - 创建桌面快捷方式
  - 创建开始菜单快捷方式
  - 支持卸载
- **适用场景**：标准 Windows 安装

### ClawLite X.X.X.exe (便携版)
- **类型**：单文件可执行程序
- **特性**：
  - 无需安装
  - 解压即用
  - 适合 U 盘携带
- **适用场景**：临时使用、测试

## 本地构建（可选）

如果需要在 Mac 上本地构建（仅生成配置，不产出 Windows exe）：

```bash
cd /Users/m1/Projects/clawlite

# 安装依赖
npm install

# 构建 Next.js 静态站点
npm run build:next

# 尝试构建（会失败，因为 Mac 无法打包 Windows）
npm run build:win
```

**注意**：Mac 上无法直接产出 Windows exe，必须通过 CI 或 Windows 机器构建。

## 构建流程详解

### 1. 安装依赖
```bash
npm ci
```

### 2. 构建 Next.js 静态站点
```bash
npm run build:next
```
- 输出目录：`out/`
- 包含所有静态 HTML/CSS/JS

### 3. 打包 Electron 应用
```bash
npm run build:win
```
- electron-builder 读取 `package.json` 中的 `build` 配置
- 将 `out/` 和 `electron-main.js` 打包
- 产出 Windows 安装器到 `dist/`

### 4. 上传 Artifacts
GitHub Actions 自动上传 `dist/*.exe` 到 Artifacts

## 配置文件

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
  output: 'export',  // 静态导出
  images: {
    unoptimized: true,  // 静态导出需要
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

## 故障排查

### 构建失败

**检查 Actions 日志**：
1. 访问 Actions 标签
2. 点击失败的 run
3. 查看具体步骤的错误信息

**常见问题**：
- **依赖安装失败**：检查 `package.json` 依赖版本
- **Next.js 构建失败**：检查代码语法错误
- **electron-builder 失败**：检查 `build` 配置

### 产物缺失

**检查 Artifacts**：
- 确认 workflow 成功完成
- 检查 `dist/` 目录是否生成文件
- 查看 upload-artifact 步骤日志

### 图标缺失

如果构建时提示图标缺失：
```bash
# 创建占位图标
mkdir -p public
# 下载或创建 icon.png (256x256 或更大)
```

## 版本管理

### 更新版本号

编辑 `package.json`：
```json
{
  "version": "0.2.0"
}
```

构建产物会自动包含版本号：
- `ClawLite Setup 0.2.0.exe`

### 发布 Release

```bash
# 创建 tag
git tag v0.2.0
git push origin v0.2.0

# 在 GitHub Releases 页面创建 Release
# 上传构建产物
```

## 自动化建议

### 定时构建

在 `.github/workflows/build-windows-installer.yml` 添加：
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # 每天 UTC 02:00 (北京时间 10:00)
```

### Release 自动发布

添加步骤：
```yaml
- name: Create Release
  if: startsWith(github.ref, 'refs/tags/')
  uses: softprops/action-gh-release@v1
  with:
    files: dist/*.exe
```

## 安全注意事项

- **不要提交 secrets**：使用 GitHub Secrets 存储敏感信息
- **代码签名**：生产环境建议购买代码签名证书
- **Artifact 保留期**：默认 30 天，可调整

## 支持

- **GitHub Issues**：报告构建问题
- **Actions 文档**：https://docs.github.com/actions
- **electron-builder 文档**：https://www.electron.build/

---

**最后更新**：2026-03-02
**维护者**：Ray
