export type Lang = "en";

export const content = {
  en: {
    nav: {
      home: "Home",
      setup: "Setup",
      marketingAgentTeam: "Marketing Agent Team",
      troubleshoot: "Troubleshoot",
      docs: "Docs",
      blog: "Blog",
      skills: "Skills"
    },
    hero: {
      eyebrow: "One-click setup + SOUL Backup for OpenClaw",
      title: "Install OpenClaw in 5 minutes. Keep your AI brain recoverable.",
      subtitle:
        "ClawLite gives you a fast one-click install path and built-in SOUL Backup so setup is easy and rollback is safe.",
      start: "Free Installer Download",
      secondary: "Open Onboarding Wizard",
      previewTitle: "Quick peek",
      previewSteps: [
        {
          title: "Detect OS",
          body: "Auto-detect your platform and confirm in one click."
        },
        {
          title: "Install Wizard",
          body: "Click Install to download and run the setup wizard."
        },
        {
          title: "API + Channel",
          body: "Choose ClawLite Tokens/BYOK, then follow channel instructions."
        }
      ],
      highlights: [
        "Free installer download for macOS + Windows",
        "One-click setup path with fewer manual steps",
        "SOUL Backup for safer restore and rollback",
        "Onboarding Wizard available as guided fallback"
      ],
      doneVerified: {
        title: "Done = Verified",
        subtitle: "Not just installed — proven to work.",
        pillars: [
          {
            title: "5 minutes. Zero DevOps. Verified.",
            description: "One-click install. Every dependency verified. First query successful."
          },
          {
            title: "40% cheaper tokens. Verified savings.",
            description: "Not a promise. A verified 40% savings on every single call."
          },
          {
            title: "Your configs are assets. Verified safe.",
            description: "Automatic backups. Encrypted storage. One-click restore. Zero data loss."
          }
        ],
        cta: "Get Started Free"
      }
    },
    setup: {
      title: "Setup Wizard",
      subtitle: "Follow 4 steps: OS → Install Wizard → API → Channel.",
      steps: [
        {
          id: "os",
          title: "Detect Your OS",
          description: "We tailor the setup flow based on your system."
        },
        {
          id: "install",
          title: "One Click Install",
          description: "Click Install to download and run the ClawLite wizard."
        },
        {
          id: "api",
          title: "Configure API",
          description: "Default to ClawLite Tokens (50% discount) or choose BYOK."
        },
        {
          id: "channel",
          title: "Select Channel",
          description: "Follow Telegram/Web Chat instructions only."
        }
      ],
      sidebar: {
        title: "Steps",
        countLabel: "steps"
      },
      buttons: {
        next: "Next",
        back: "Back",
        copy: "Copy",
        copied: "Copied",
        openDocs: "Open Docs",
        done: "Finish",
        reset: "Start Over"
      },
      os: {
        autoDetected: "Auto-detected",
        prompt: "Select your operating system",
        macos: "macOS",
        windows: "Windows",
        linux: "Linux",
        checkCommandTitle: "Detect OS automatically"
      },
      install: {
        wizardTitle: "Install ClawLite Wizard",
        wizardDesc: "One click to install. We download the installer wizard for your operating system.",
        installButton: "Install",
        allDownloads: "All Downloads",
        commandTitle: "Wizard install flow"
      },
      api: {
        modeTitle: "Choose API setup",
        clawliteTitle: "ClawLite Tokens (Default)",
        clawliteDesc: "50% discount from official API price. Recommended for fastest setup.",
        byokTitle: "Bring Your Own Key",
        byokDesc: "Use your OpenAI / Anthropic / other provider key.",
        emailLabel: "Email for token",
        tokenLabel: "Your ClawLite Token",
        sendLink: "Send Login Link",
        providerLabel: "Provider",
        keyLabel: "API Key",
        commandTitle: "Apply configuration (no terminal)",
        note: "We never store your API key in the browser beyond this session."
      },
      channel: {
        title: "Select a channel (instructions only)",
        telegram: "Telegram",
        webchat: "Web Chat",
        telegramSteps: [
          "Open Telegram and search @BotFather",
          "Create a new bot and copy the token",
          "Paste the token below"
        ],
        webchatSteps: [
          "No extra setup needed",
          "Launch and open the web chat URL",
          "Share the link with your team"
        ],
        botTokenLabel: "Telegram Bot Token",
        commandTitle: "Connect channel (no terminal)"
      },
      launch: {
        title: "Start OpenClaw (no terminal)",
        successTitle: "You are live! 🦞",
        successDesc: "Send your first message and watch the agent respond.",
        firstMsg: "Try: Hello ClawLite, plan my day",
        emailTitle: "Optional: leave your email for tips",
        emailDesc: "For BYOK users — get best practices and updates.",
        emailLabel: "Email (optional)",
        submitEmail: "Notify Me",
        skip: "Skip",
        privacy: "We only use it for product tips and updates."
      }
    },
    troubleshoot: {
      title: "Troubleshoot",
      subtitle: "Quick fixes for common setup issues.",
      issues: [
        {
          title: "\"ClawLite\" Not Opened on macOS",
          body: "In Finder, locate ClawLite.app (or drag it to Applications first), right-click and choose Open, then click Open again. If still blocked, go to System Settings → Privacy & Security and click Open Anyway. Terminal (advanced): xattr -dr com.apple.quarantine /Applications/ClawLite.app && open /Applications/ClawLite.app"
        },
        {
          title: "Node.js command not found",
          body: "Reinstall Node.js and reopen your terminal. On macOS, verify Homebrew is in PATH."
        },
        {
          title: "Permission denied during npm install",
          body: "Use sudo on macOS/Linux, or run PowerShell as Administrator on Windows."
        },
        {
          title: "OpenClaw starts but no response",
          body: "Check that your API key is valid and that the channel token matches the bot you created."
        },
        {
          title: "Telegram bot not receiving messages",
          body: "Send /start to your bot and confirm the token is correct."
        },
        {
          title: "Firewall or proxy issues",
          body: "Try a different network or configure your proxy for npm and OpenClaw."
        }
      ]
    },
    docsPage: {
      description: "Open the official OpenClaw documentation in a new tab.",
      back: "Back to installer download"
    },
    footer: {
      tagline: "Built for humans. Powered by OpenClaw.",
      cta: "Ready to get started?"
    }
  }
} as const;
