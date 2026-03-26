# ClawLite Web Wizard — MVP Spec

_One-click OpenClaw installation guide_

## Overview

A frontend-first web application hosted at clawlite.ai, guiding users from zero to a working OpenClaw installation and configuration. Goal: enable non-technical users to get up and running in 5 minutes.

## Target Users

- Non-technical users (founders, operators, content creators)
- People who want AI agents but prefer to avoid command-line setup
- Developers with technical backgrounds who want a fast setup path

## Core Flow (Step-by-Step Wizard)

### Step 1: Detect OS
- Detect operating system (macOS / Windows / Linux)
- Display corresponding installation instructions
- Provide one-click-copy commands

### Step 2: Install Node.js
- Check whether Node.js is installed (guide user to run `node -v` in terminal and paste the result)
- Not installed → provide download link + install instructions (per OS)
- macOS: `brew install node` or official .pkg
- Windows: official .msi installer
- Linux: `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -`

### Step 3: Install OpenClaw
- One-click-copy command: `npm install -g openclaw`
- Guide user to paste output to confirm successful installation
- Common error messages (permissions, network issues)

### Step 4: Configure API Key
- **Option A (default, highlighted):** Use ClawLite Tokens — one-click register/login (email), auto-configure
- **Option B:** Bring Your Own Key (BYOK) — guide user to enter OpenAI / Anthropic / other provider key
- Generate config command, one-click copy

### Step 5: Select Channel
- Telegram (recommended) — guide user to create bot via BotFather
- Discord — guide user to create bot + invite to server
- Web Chat — simplest, no extra configuration needed
- WhatsApp — scan QR to connect

### Step 6: Launch
- One-click-copy launch command: `openclaw gateway start`
- Verify connection success
- Done page — guide user to send their first message

## Technical Architecture

### Stack
- **Frontend-first SPA** (no backend dependency for core flow)
- Framework: Next.js (Vercel deployment + SSR/SEO)
- UI: Tailwind CSS + shadcn/ui
- Animation: Framer Motion (step transition effects)

### Deployment
- Vercel (free tier sufficient)
- Domain: clawlite.ai

### Key Design Principles
- **Zero backend for core flow**: all logic runs in browser (except email collection)
- **Offline-friendly**: command generation does not depend on network requests
- **Copy-and-run**: every step has a one-click-copy terminal command
- **Error-friendly**: common errors have clear troubleshooting guidance
- **Mobile-readable**: responsive design (setup still requires a computer)

## Page Structure

```
/                → Landing page + start button
/setup           → Wizard main flow (Steps 1-6)
/troubleshoot    → Common issue troubleshooting
/docs            → Link to official OpenClaw documentation
```

## MVP Scope (Phase 1)

### Included
- [x] 6-step guided flow
- [x] macOS + Windows + Linux support
- [x] ClawLite Tokens as default recommendation
- [x] Telegram + Web Chat channel guidance
- [x] Responsive design

### Not included (future iterations)
- [ ] Discord / WhatsApp channel guidance (Phase 2)
- [ ] Automatic environment detection (requires local CLI)
- [ ] User account system
- [ ] Installation progress tracking
- [ ] Desktop app (Phase 3)

## Email Collection Strategy

### Principle: deliver value first, then ask for information

- **Do not** ask for email at the start of the wizard — user hasn't received any value yet
- **Do not** use popup modals that block the flow

### Collection Points

1. **Step 4 - ClawLite Token Registration** (natural collection)
   - Email required for ClawLite Token register/login
   - Primary collection channel, zero friction
   - Captures both paying user + email

2. **Step 6 - Completion Page** (optional collection)
   - After successful install: "Leave your email for usage tips and product updates"
   - Optional, not forced, does not block the flow
   - Supplementary collection for BYOK users

### Data Handling
- Email used only for product notifications and usage tips
- Requires backend API to receive email (Vercel Serverless Function + storage)
- Complies with GDPR / basic privacy policy requirements

## Branding & Design

- Style: clean, modern, friendly — not corporate
- Primary colors: consistent with OpenClaw brand, with ClawLite accent colors
- Tone: like a friend teaching you to install software, not official documentation

## Success Metrics

- Install completion rate > 60% (from page open to successful launch)
- Average completion time < 10 minutes
- ClawLite Token selection rate > 40%

## Open Source

- License: MIT
- Repo: github.com/X-RayLuan/ClawLite
- Community contributions welcome

---

_Spec by Muddy Fox | 2026-03-01_
