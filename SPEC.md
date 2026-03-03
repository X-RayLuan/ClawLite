# ClawLite Web Wizard — MVP Spec

_OpenClaw 一键安装引导工具_

## 概述

一个纯前端 Web 应用，托管在 clawlite.ai（或 clawlite.tech），引导用户从零完成 OpenClaw 的安装和配置。目标：让非技术用户也能在 5 分钟内跑起来。

## 目标用户

- 非技术用户（创业者、运营、内容创作者）
- 对 AI agent 有需求但不愿折腾命令行的人
- 已有技术背景但想快速 setup 的开发者

## 核心流程（Step-by-Step Wizard）

### Step 1: 环境检测
- 检测操作系统（macOS / Windows / Linux）
- 显示对应的安装指引
- 提供一键复制的命令

### Step 2: 安装 Node.js
- 检测是否已安装 Node.js（引导用户在终端运行 `node -v` 并粘贴结果）
- 未安装 → 提供下载链接 + 安装指引（按 OS 区分）
- macOS: `brew install node` 或官网 .pkg
- Windows: 官网 .msi installer
- Linux: `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -`

### Step 3: 安装 OpenClaw
- 一键复制命令：`npm install -g openclaw`
- 引导用户粘贴运行结果确认安装成功
- 常见错误提示（权限问题、网络问题）

### Step 4: 配置 API Key
- **选项 A（默认高亮）：** 使用 ClawLite Token — 一键注册/登录（邮箱），自动配置
- **选项 B：** 自带 API Key（BYOK）— 引导输入 OpenAI / Anthropic / 其他 provider 的 key
- 生成配置命令，一键复制

### Step 5: 选择连接渠道
- Telegram（推荐）— 引导创建 bot via BotFather
- Discord — 引导创建 bot + 邀请到 server
- Web Chat — 最简单，无需额外配置
- WhatsApp — 扫码连接

### Step 6: 启动
- 一键复制启动命令：`openclaw gateway start`
- 验证连接成功
- 🎉 完成页面 — 引导用户发送第一条消息

## 技术方案

### 架构
- **纯前端 SPA**（无后端依赖）
- 框架：Next.js（方便 Vercel 部署 + SSR/SEO）
- UI：Tailwind CSS + shadcn/ui
- 动画：Framer Motion（步骤切换动效）

### 部署
- Vercel（免费 tier 足够）
- 域名：clawlite.ai 或 clawlite.tech

### 关键设计原则
- **零后端**：所有逻辑在浏览器端（邮箱采集除外）
- **离线友好**：命令生成不依赖网络请求
- **复制即用**：每一步都有一键复制的终端命令
- **错误友好**：常见错误有明确的排查指引
- **移动端可读**：响应式设计，手机上也能看（虽然安装要在电脑上）

## 页面结构

```
/                → Landing page + 开始按钮
/setup           → Wizard 主流程（Step 1-6）
/troubleshoot    → 常见问题排查
/docs            → 链接到 OpenClaw 官方文档
```

## MVP 范围（Phase 1）

### 包含
- [x] 6 步引导流程
- [x] macOS + Windows + Linux 支持
- [x] ClawLite Token 默认推荐
- [x] Telegram + Web Chat 渠道引导
- [x] 响应式设计
- [x] 中英文双语

### 不包含（后续迭代）
- [ ] Discord / WhatsApp 渠道引导（Phase 2）
- [ ] 自动检测环境（需要本地 CLI 配合）
- [ ] 用户账号系统
- [ ] 安装进度追踪
- [ ] Desktop app（Phase 3）

## 邮箱采集策略

### 原则：先给价值，再要信息

- **不要**在 wizard 开头要邮箱 — 用户还没得到任何价值
- **不要**用弹窗拦截流程

### 采集点

1. **Step 4 - ClawLite Token 注册**（自然采集）
   - 选择 ClawLite Token 时需要邮箱注册/登录
   - 这是主要采集渠道，零摩擦
   - 同时获得付费用户 + 邮箱

2. **Step 6 - 完成页面**（可选采集）
   - 安装成功后显示："留下邮箱，接收使用技巧和产品更新"
   - 可选，不强制，不挡路
   - 针对 BYOK 用户的补充采集

### 数据处理
- 邮箱仅用于产品通知和使用技巧推送
- 需要后端 API 接收邮箱（Vercel Serverless Function + 存储）
- 遵守 GDPR / 隐私政策基本要求

## 品牌 & 设计

- 风格：简洁、现代、友好，不要 corporate 感
- 主色调：跟 OpenClaw 品牌一致，可以有自己的辅助色
- 吉祥物：可以复用 LazyClaw 的懒龙虾 🦞，或者设计一个轻量版
- 语气：像朋友教你装软件，不是官方文档

## 成功指标

- 安装完成率 > 60%（从打开页面到成功启动）
- 平均完成时间 < 10 分钟
- ClawLite Token 选择率 > 40%

## 开源

- License: MIT
- Repo: github.com/openclaw/clawlite（或独立 org）
- 欢迎社区贡献翻译、渠道引导模板

---

_Spec by Muddy Fox 🐾 | 2026-03-01_
