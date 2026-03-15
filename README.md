# ClawLite

**One click to install OpenClaw with cheaper tokens.**

ClawLite is the beginner-friendly layer around OpenClaw: simpler setup, web-guided onboarding, and lower-friction access for people who want OpenClaw without wrestling with terminal-heavy install flows.

**Website:** <https://clawlite.ai>

---

# Why people use ClawLite

- Install OpenClaw faster
- Avoid terminal-heavy setup friction
- Use a simpler onboarding flow on Mac and Windows
- Get a clearer path for BYOK and token routing
- Make OpenClaw easier for beginners and non-technical users

---

# What this repo is

This repo contains the ClawLite web experience and supporting flows around installation, setup, docs, and lead capture.

It powers pages and flows such as:

- homepage
- setup flow
- docs / troubleshooting pages
- installer link delivery
- email capture / product interest flows

---

# Positioning

ClawLite is designed for users looking for:

- an easier OpenClaw installer
- a beginner-friendly OpenClaw experience
- a web UI guided path into OpenClaw
- cheaper token routing / BYOK-friendly setup

---

# Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Start production server locally:

```bash
npm run start
```

---

# Repo highlights

- `app/` / Next.js app routes
- `src/` shared logic and content models
- `public/` public assets
- `api/` serverless endpoints
- `SPEC.md` product / copy / behavior reference

---

# Related repos

- `ClawLite-Installer` — desktop installer app
- `ai-search-rank-tracker` — AI visibility / GEO tracker used for prompt intelligence and market positioning

---

# Bottom line

ClawLite exists to make OpenClaw easier to install, easier to understand, and easier to adopt.
