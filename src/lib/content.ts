export type Lang = "en" | "zh" | "es" | "ja" | "ko";

export const content = {
  en: {
    nav: {
      home: "Home",
      setup: "Setup",
      marketingAgentTeam: "Marketing Agent Team",
      clawrouter: "ClawRouter",
      troubleshoot: "Troubleshoot",
      docs: "Docs",
      blog: "Blog",
      skills: "Skills"
    },
    hero: {
      eyebrow: "One-click setup + SOUL Backup for OpenClaw",
      title: "Install OpenClaw in 5 minutes.",
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
      subtitle: "Follow 4 steps: OS \u2192 Install Wizard \u2192 API \u2192 Channel.",
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
        successTitle: "You are live! \ud83e\udd9e",
        successDesc: "Send your first message and watch the agent respond.",
        firstMsg: "Try: Hello ClawLite, plan my day",
        emailTitle: "Optional: leave your email for tips",
        emailDesc: "For BYOK users \u2014 get best practices and updates.",
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
          body: "In Finder, locate ClawLite.app (or drag it to Applications first), right-click and choose Open, then click Open again. If still blocked, go to System Settings \u2192 Privacy & Security and click Open Anyway. Terminal (advanced): xattr -dr com.apple.quarantine /Applications/ClawLite.app && open /Applications/ClawLite.app"
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
  },
  zh: {
    nav: {
      home: "\u9996\u9875",
      setup: "\u5b89\u88c5",
      marketingAgentTeam: "\u8425\u9500\u667a\u80fd\u4f53\u56e2\u961f",
      clawrouter: "ClawRouter",
      troubleshoot: "\u6545\u969c\u6392\u9664",
      docs: "\u6587\u6863",
      blog: "\u535a\u5ba2",
      skills: "\u6280\u80fd"
    },
    hero: {
      eyebrow: "\u4e00\u952e\u5b89\u88c5 + OpenClaw SOUL \u5907\u4efd",
      title: "5 \u5206\u949f\u5b89\u88c5 OpenClaw\u3002\u8ba9\u4f60\u7684 AI \u5927\u8111\u53ef\u6062\u590d\u3002",
      subtitle:
        "ClawLite \u63d0\u4f9b\u5feb\u901f\u4e00\u952e\u5b89\u88c5\u548c\u5185\u7f6e SOUL \u5907\u4efd\uff0c\u8ba9\u5b89\u88c5\u7b80\u5355\u3001\u56de\u6eda\u5b89\u5168\u3002",
      start: "\u514d\u8d39\u4e0b\u8f7d\u5b89\u88c5\u5305",
      secondary: "\u6253\u5f00\u5f15\u5bfc\u5411\u5bfc",
      previewTitle: "\u5feb\u901f\u9884\u89c8",
      previewSteps: [
        {
          title: "\u68c0\u6d4b\u64cd\u4f5c\u7cfb\u7edf",
          body: "\u81ea\u52a8\u68c0\u6d4b\u4f60\u7684\u5e73\u53f0\uff0c\u4e00\u952e\u786e\u8ba4\u3002"
        },
        {
          title: "\u5b89\u88c5\u5411\u5bfc",
          body: "\u70b9\u51fb\u5b89\u88c5\uff0c\u4e0b\u8f7d\u5e76\u8fd0\u884c\u5b89\u88c5\u5411\u5bfc\u3002"
        },
        {
          title: "API + \u9891\u9053",
          body: "\u9009\u62e9 ClawLite Tokens/BYOK\uff0c\u7136\u540e\u6309\u7167\u9891\u9053\u8bf4\u660e\u64cd\u4f5c\u3002"
        }
      ],
      highlights: [
        "\u514d\u8d39\u5b89\u88c5\u5305\uff0c\u652f\u6301 macOS + Windows",
        "\u4e00\u952e\u5b89\u88c5\uff0c\u66f4\u5c11\u624b\u52a8\u6b65\u9aa4",
        "SOUL \u5907\u4efd\uff0c\u66f4\u5b89\u5168\u7684\u6062\u590d\u548c\u56de\u6eda",
        "\u5f15\u5bfc\u5411\u5bfc\u4f5c\u4e3a\u5907\u7528\u65b9\u6848"
      ],
      doneVerified: {
        title: "\u5b8c\u6210 = \u5df2\u9a8c\u8bc1",
        subtitle: "\u4e0d\u4ec5\u4ec5\u662f\u5b89\u88c5 \u2014\u2014 \u800c\u662f\u9a8c\u8bc1\u53ef\u7528\u3002",
        pillars: [
          {
            title: "5 \u5206\u949f\u3002\u96f6 DevOps\u3002\u5df2\u9a8c\u8bc1\u3002",
            description: "\u4e00\u952e\u5b89\u88c5\u3002\u6bcf\u4e2a\u4f9d\u8d56\u5df2\u9a8c\u8bc1\u3002\u9996\u6b21\u67e5\u8be2\u6210\u529f\u3002"
          },
          {
            title: "\u4fbf\u5b9c 40% \u7684 Token\u3002\u5df2\u9a8c\u8bc1\u7684\u8282\u7701\u3002",
            description: "\u4e0d\u662f\u627f\u8bfa\u3002\u6bcf\u6b21\u8c03\u7528\u90fd\u9a8c\u8bc1\u8282\u7701 40%\u3002"
          },
          {
            title: "\u4f60\u7684\u914d\u7f6e\u662f\u8d44\u4ea7\u3002\u5df2\u9a8c\u8bc1\u5b89\u5168\u3002",
            description: "\u81ea\u52a8\u5907\u4efd\u3002\u52a0\u5bc6\u5b58\u50a8\u3002\u4e00\u952e\u6062\u590d\u3002\u96f6\u6570\u636e\u4e22\u5931\u3002"
          }
        ],
        cta: "\u514d\u8d39\u5f00\u59cb"
      }
    },
    setup: {
      title: "\u5b89\u88c5\u5411\u5bfc",
      subtitle: "\u8ddf\u968f 4 \u4e2a\u6b65\u9aa4\uff1a\u64cd\u4f5c\u7cfb\u7edf \u2192 \u5b89\u88c5\u5411\u5bfc \u2192 API \u2192 \u9891\u9053\u3002",
      steps: [
        {
          id: "os",
          title: "\u68c0\u6d4b\u64cd\u4f5c\u7cfb\u7edf",
          description: "\u6211\u4eec\u6839\u636e\u4f60\u7684\u7cfb\u7edf\u5b9a\u5236\u5b89\u88c5\u6d41\u7a0b\u3002"
        },
        {
          id: "install",
          title: "\u4e00\u952e\u5b89\u88c5",
          description: "\u70b9\u51fb\u5b89\u88c5\uff0c\u4e0b\u8f7d\u5e76\u8fd0\u884c ClawLite \u5411\u5bfc\u3002"
        },
        {
          id: "api",
          title: "\u914d\u7f6e API",
          description: "\u9ed8\u8ba4 ClawLite Tokens\uff085 \u6298\u4f18\u60e0\uff09\u6216\u9009\u62e9 BYOK\u3002"
        },
        {
          id: "channel",
          title: "\u9009\u62e9\u9891\u9053",
          description: "\u4ec5\u6309\u7167 Telegram/Web Chat \u8bf4\u660e\u64cd\u4f5c\u3002"
        }
      ],
      sidebar: {
        title: "\u6b65\u9aa4",
        countLabel: "\u6b65"
      },
      buttons: {
        next: "\u4e0b\u4e00\u6b65",
        back: "\u4e0a\u4e00\u6b65",
        copy: "\u590d\u5236",
        copied: "\u5df2\u590d\u5236",
        openDocs: "\u6253\u5f00\u6587\u6863",
        done: "\u5b8c\u6210",
        reset: "\u91cd\u65b0\u5f00\u59cb"
      },
      os: {
        autoDetected: "\u81ea\u52a8\u68c0\u6d4b",
        prompt: "\u9009\u62e9\u4f60\u7684\u64cd\u4f5c\u7cfb\u7edf",
        macos: "macOS",
        windows: "Windows",
        linux: "Linux",
        checkCommandTitle: "\u81ea\u52a8\u68c0\u6d4b\u64cd\u4f5c\u7cfb\u7edf"
      },
      install: {
        wizardTitle: "\u5b89\u88c5 ClawLite \u5411\u5bfc",
        wizardDesc: "\u4e00\u952e\u5b89\u88c5\u3002\u6211\u4eec\u4e3a\u4f60\u7684\u64cd\u4f5c\u7cfb\u7edf\u4e0b\u8f7d\u5b89\u88c5\u5411\u5bfc\u3002",
        installButton: "\u5b89\u88c5",
        allDownloads: "\u6240\u6709\u4e0b\u8f7d",
        commandTitle: "\u5411\u5bfc\u5b89\u88c5\u6d41\u7a0b"
      },
      api: {
        modeTitle: "\u9009\u62e9 API \u8bbe\u7f6e",
        clawliteTitle: "ClawLite Tokens\uff08\u9ed8\u8ba4\uff09",
        clawliteDesc: "\u5b98\u65b9 API \u4ef7\u683c 5 \u6298\u4f18\u60e0\u3002\u63a8\u8350\u6700\u5feb\u5b89\u88c5\u3002",
        byokTitle: "\u81ea\u5e26\u5bc6\u94a5",
        byokDesc: "\u4f7f\u7528\u4f60\u7684 OpenAI / Anthropic / \u5176\u4ed6\u63d0\u4f9b\u5546\u5bc6\u94a5\u3002",
        emailLabel: "\u7528\u4e8e Token \u7684\u90ae\u7bb1",
        tokenLabel: "\u4f60\u7684 ClawLite Token",
        sendLink: "\u53d1\u9001\u767b\u5f55\u94fe\u63a5",
        providerLabel: "\u63d0\u4f9b\u5546",
        keyLabel: "API \u5bc6\u94a5",
        commandTitle: "\u5e94\u7528\u914d\u7f6e\uff08\u65e0\u9700\u7ec8\u7aef\uff09",
        note: "\u6211\u4eec\u4e0d\u4f1a\u5728\u6d4f\u89c8\u5668\u4e2d\u4fdd\u5b58\u4f60\u7684 API \u5bc6\u94a5\u3002"
      },
      channel: {
        title: "\u9009\u62e9\u9891\u9053\uff08\u4ec5\u8bf4\u660e\uff09",
        telegram: "Telegram",
        webchat: "Web Chat",
        telegramSteps: [
          "\u6253\u5f00 Telegram \u5e76\u641c\u7d22 @BotFather",
          "\u521b\u5efa\u65b0\u673a\u5668\u4eba\u5e76\u590d\u5236 Token",
          "\u5728\u4e0b\u65b9\u7c98\u8d34 Token"
        ],
        webchatSteps: [
          "\u65e0\u9700\u989d\u5916\u8bbe\u7f6e",
          "\u542f\u52a8\u5e76\u6253\u5f00 Web Chat \u7f51\u5740",
          "\u4e0e\u4f60\u7684\u56e2\u961f\u5206\u4eab\u94fe\u63a5"
        ],
        botTokenLabel: "Telegram Bot Token",
        commandTitle: "\u8fde\u63a5\u9891\u9053\uff08\u65e0\u9700\u7ec8\u7aef\uff09"
      },
      launch: {
        title: "\u542f\u52a8 OpenClaw\uff08\u65e0\u9700\u7ec8\u7aef\uff09",
        successTitle: "\u5df2\u4e0a\u7ebf\uff01\ud83e\udd9e",
        successDesc: "\u53d1\u9001\u4f60\u7684\u7b2c\u4e00\u6761\u6d88\u606f\uff0c\u770b\u770b\u667a\u80fd\u4f53\u7684\u56de\u590d\u3002",
        firstMsg: "\u8bd5\u8bd5\uff1a\u4f60\u597d ClawLite\uff0c\u5e2e\u6211\u89c4\u5212\u4eca\u5929",
        emailTitle: "\u53ef\u9009\uff1a\u7559\u4e0b\u90ae\u7bb1\u83b7\u53d6\u63d0\u793a",
        emailDesc: "BYOK \u7528\u6237 \u2014\u2014 \u83b7\u53d6\u6700\u4f73\u5b9e\u8df5\u548c\u66f4\u65b0\u3002",
        emailLabel: "\u90ae\u7bb1\uff08\u53ef\u9009\uff09",
        submitEmail: "\u901a\u77e5\u6211",
        skip: "\u8df3\u8fc7",
        privacy: "\u6211\u4eec\u4ec5\u7528\u4e8e\u4ea7\u54c1\u63d0\u793a\u548c\u66f4\u65b0\u3002"
      }
    },
    troubleshoot: {
      title: "\u6545\u969c\u6392\u9664",
      subtitle: "\u5e38\u89c1\u5b89\u88c5\u95ee\u9898\u7684\u5feb\u901f\u4fee\u590d\u3002",
      issues: [
        {
          title: "macOS \u4e0a\u65e0\u6cd5\u6253\u5f00\u300cClawLite\u300d",
          body: "\u5728\u8bbf\u8fbe\u4e2d\u627e\u5230 ClawLite.app\uff08\u6216\u5148\u62d6\u5230\u5e94\u7528\u7a0b\u5e8f\uff09\uff0c\u53f3\u952e\u9009\u62e9\u6253\u5f00\uff0c\u518d\u6b21\u70b9\u51fb\u6253\u5f00\u3002\u5982\u679c\u4ecd\u88ab\u963b\u6b62\uff0c\u524d\u5f80\u7cfb\u7edf\u8bbe\u7f6e \u2192 \u9690\u79c1\u4e0e\u5b89\u5168\uff0c\u70b9\u51fb\u4ecd\u7136\u6253\u5f00\u3002\u7ec8\u7aef\uff08\u9ad8\u7ea7\uff09\uff1axattr -dr com.apple.quarantine /Applications/ClawLite.app && open /Applications/ClawLite.app"
        },
        {
          title: "\u627e\u4e0d\u5230 Node.js \u547d\u4ee4",
          body: "\u91cd\u65b0\u5b89\u88c5 Node.js \u5e76\u91cd\u65b0\u6253\u5f00\u7ec8\u7aef\u3002macOS \u4e0a\u8bf7\u786e\u8ba4 Homebrew \u5728 PATH \u4e2d\u3002"
        },
        {
          title: "npm install \u65f6\u6743\u9650\u88ab\u62d2\u7edd",
          body: "\u5728 macOS/Linux \u4e0a\u4f7f\u7528 sudo\uff0c\u6216\u5728 Windows \u4e0a\u4ee5\u7ba1\u7406\u5458\u8eab\u4efd\u8fd0\u884c PowerShell\u3002"
        },
        {
          title: "OpenClaw \u542f\u52a8\u4f46\u65e0\u54cd\u5e94",
          body: "\u68c0\u67e5\u4f60\u7684 API \u5bc6\u94a5\u662f\u5426\u6709\u6548\uff0c\u4ee5\u53ca\u9891\u9053 Token \u662f\u5426\u4e0e\u4f60\u521b\u5efa\u7684\u673a\u5668\u4eba\u5339\u914d\u3002"
        },
        {
          title: "Telegram \u673a\u5668\u4eba\u672a\u6536\u5230\u6d88\u606f",
          body: "\u5411\u4f60\u7684\u673a\u5668\u4eba\u53d1\u9001 /start \u5e76\u786e\u8ba4 Token \u6b63\u786e\u3002"
        },
        {
          title: "\u9632\u706b\u5899\u6216\u4ee3\u7406\u95ee\u9898",
          body: "\u5c1d\u8bd5\u5207\u6362\u7f51\u7edc\uff0c\u6216\u4e3a npm \u548c OpenClaw \u914d\u7f6e\u4ee3\u7406\u3002"
        }
      ]
    },
    docsPage: {
      description: "\u5728\u65b0\u6807\u7b7e\u9875\u4e2d\u6253\u5f00 OpenClaw \u5b98\u65b9\u6587\u6863\u3002",
      back: "\u8fd4\u56de\u5b89\u88c5\u5305\u4e0b\u8f7d"
    },
    footer: {
      tagline: "\u4e3a\u4eba\u7c7b\u6784\u5efa\u3002\u7531 OpenClaw \u9a71\u52a8\u3002",
      cta: "\u51c6\u5907\u597d\u5f00\u59cb\u4e86\u5417\uff1f"
    }
  },
  es: {
    nav: {
      home: "Inicio",
      setup: "Instalaci\u00f3n",
      marketingAgentTeam: "Equipo de Agentes de Marketing",
      clawrouter: "ClawRouter",
      troubleshoot: "Soluci\u00f3n de problemas",
      docs: "Documentaci\u00f3n",
      blog: "Blog",
      skills: "Habilidades"
    },
    hero: {
      eyebrow: "Instalaci\u00f3n en un clic + SOUL Backup para OpenClaw",
      title: "Instala OpenClaw en 5 minutos. Mant\u00e9n tu cerebro de IA recuperable.",
      subtitle:
        "ClawLite te ofrece una instalaci\u00f3n r\u00e1pida en un clic y SOUL Backup integrado para que la configuraci\u00f3n sea f\u00e1cil y la reversi\u00f3n sea segura.",
      start: "Descarga gratuita del instalador",
      secondary: "Abrir asistente de configuraci\u00f3n",
      previewTitle: "Vista r\u00e1pida",
      previewSteps: [
        {
          title: "Detectar SO",
          body: "Detecta tu plataforma autom\u00e1ticamente y confirma en un clic."
        },
        {
          title: "Asistente de instalaci\u00f3n",
          body: "Haz clic en Instalar para descargar y ejecutar el asistente."
        },
        {
          title: "API + Canal",
          body: "Elige ClawLite Tokens/BYOK, luego sigue las instrucciones del canal."
        }
      ],
      highlights: [
        "Descarga gratuita para macOS + Windows",
        "Instalaci\u00f3n en un clic con menos pasos manuales",
        "SOUL Backup para restauraci\u00f3n y reversi\u00f3n m\u00e1s seguras",
        "Asistente de configuraci\u00f3n disponible como respaldo guiado"
      ],
      doneVerified: {
        title: "Hecho = Verificado",
        subtitle: "No solo instalado \u2014 comprobado que funciona.",
        pillars: [
          {
            title: "5 minutos. Cero DevOps. Verificado.",
            description: "Instalaci\u00f3n en un clic. Cada dependencia verificada. Primera consulta exitosa."
          },
          {
            title: "Tokens 40% m\u00e1s baratos. Ahorro verificado.",
            description: "No es una promesa. Un ahorro verificado del 40% en cada llamada."
          },
          {
            title: "Tus configuraciones son activos. Seguridad verificada.",
            description: "Copias de seguridad autom\u00e1ticas. Almacenamiento cifrado. Restauraci\u00f3n en un clic. Cero p\u00e9rdida de datos."
          }
        ],
        cta: "Comenzar gratis"
      }
    },
    setup: {
      title: "Asistente de instalaci\u00f3n",
      subtitle: "Sigue 4 pasos: SO \u2192 Asistente \u2192 API \u2192 Canal.",
      steps: [
        {
          id: "os",
          title: "Detectar tu SO",
          description: "Adaptamos el flujo seg\u00fan tu sistema."
        },
        {
          id: "install",
          title: "Instalaci\u00f3n en un clic",
          description: "Haz clic en Instalar para descargar y ejecutar el asistente ClawLite."
        },
        {
          id: "api",
          title: "Configurar API",
          description: "Por defecto ClawLite Tokens (50% de descuento) o elige BYOK."
        },
        {
          id: "channel",
          title: "Seleccionar canal",
          description: "Sigue solo las instrucciones de Telegram/Web Chat."
        }
      ],
      sidebar: {
        title: "Pasos",
        countLabel: "pasos"
      },
      buttons: {
        next: "Siguiente",
        back: "Atr\u00e1s",
        copy: "Copiar",
        copied: "Copiado",
        openDocs: "Abrir documentaci\u00f3n",
        done: "Finalizar",
        reset: "Empezar de nuevo"
      },
      os: {
        autoDetected: "Detectado autom\u00e1ticamente",
        prompt: "Selecciona tu sistema operativo",
        macos: "macOS",
        windows: "Windows",
        linux: "Linux",
        checkCommandTitle: "Detectar SO autom\u00e1ticamente"
      },
      install: {
        wizardTitle: "Asistente de instalaci\u00f3n ClawLite",
        wizardDesc: "Un clic para instalar. Descargamos el asistente para tu sistema operativo.",
        installButton: "Instalar",
        allDownloads: "Todas las descargas",
        commandTitle: "Flujo de instalaci\u00f3n del asistente"
      },
      api: {
        modeTitle: "Elige configuraci\u00f3n de API",
        clawliteTitle: "ClawLite Tokens (por defecto)",
        clawliteDesc: "50% de descuento sobre el precio oficial. Recomendado para la instalaci\u00f3n m\u00e1s r\u00e1pida.",
        byokTitle: "Trae tu propia clave",
        byokDesc: "Usa tu clave de OpenAI / Anthropic / otro proveedor.",
        emailLabel: "Email para token",
        tokenLabel: "Tu ClawLite Token",
        sendLink: "Enviar enlace de acceso",
        providerLabel: "Proveedor",
        keyLabel: "Clave API",
        commandTitle: "Aplicar configuraci\u00f3n (sin terminal)",
        note: "Nunca almacenamos tu clave API en el navegador m\u00e1s all\u00e1 de esta sesi\u00f3n."
      },
      channel: {
        title: "Selecciona un canal (solo instrucciones)",
        telegram: "Telegram",
        webchat: "Web Chat",
        telegramSteps: [
          "Abre Telegram y busca @BotFather",
          "Crea un nuevo bot y copia el token",
          "Pega el token abajo"
        ],
        webchatSteps: [
          "No se necesita configuraci\u00f3n adicional",
          "Inicia y abre la URL del Web Chat",
          "Comparte el enlace con tu equipo"
        ],
        botTokenLabel: "Token del bot de Telegram",
        commandTitle: "Conectar canal (sin terminal)"
      },
      launch: {
        title: "Iniciar OpenClaw (sin terminal)",
        successTitle: "\u00a1Est\u00e1s en l\u00ednea! \ud83e\udd9e",
        successDesc: "Env\u00eda tu primer mensaje y observa la respuesta del agente.",
        firstMsg: "Prueba: Hola ClawLite, planifica mi d\u00eda",
        emailTitle: "Opcional: deja tu email para consejos",
        emailDesc: "Para usuarios BYOK \u2014 recibe mejores pr\u00e1cticas y actualizaciones.",
        emailLabel: "Email (opcional)",
        submitEmail: "Notif\u00edcame",
        skip: "Saltar",
        privacy: "Solo lo usamos para consejos de producto y actualizaciones."
      }
    },
    troubleshoot: {
      title: "Soluci\u00f3n de problemas",
      subtitle: "Soluciones r\u00e1pidas para problemas comunes de instalaci\u00f3n.",
      issues: [
        {
          title: "\"ClawLite\" no se abre en macOS",
          body: "En Finder, localiza ClawLite.app (o arr\u00e1stralo a Aplicaciones primero), haz clic derecho y elige Abrir, luego haz clic en Abrir de nuevo. Si sigue bloqueado, ve a Ajustes del Sistema \u2192 Privacidad y Seguridad y haz clic en Abrir de todos modos. Terminal (avanzado): xattr -dr com.apple.quarantine /Applications/ClawLite.app && open /Applications/ClawLite.app"
        },
        {
          title: "Comando Node.js no encontrado",
          body: "Reinstala Node.js y vuelve a abrir la terminal. En macOS, verifica que Homebrew est\u00e9 en PATH."
        },
        {
          title: "Permiso denegado durante npm install",
          body: "Usa sudo en macOS/Linux, o ejecuta PowerShell como Administrador en Windows."
        },
        {
          title: "OpenClaw arranca pero no responde",
          body: "Verifica que tu clave API sea v\u00e1lida y que el token del canal coincida con el bot que creaste."
        },
        {
          title: "El bot de Telegram no recibe mensajes",
          body: "Env\u00eda /start a tu bot y confirma que el token sea correcto."
        },
        {
          title: "Problemas de firewall o proxy",
          body: "Prueba con otra red o configura tu proxy para npm y OpenClaw."
        }
      ]
    },
    docsPage: {
      description: "Abre la documentaci\u00f3n oficial de OpenClaw en una nueva pesta\u00f1a.",
      back: "Volver a la descarga del instalador"
    },
    footer: {
      tagline: "Hecho para humanos. Impulsado por OpenClaw.",
      cta: "\u00bfListo para empezar?"
    }
  },
  ja: {
    nav: {
      home: "\u30db\u30fc\u30e0",
      setup: "\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7",
      marketingAgentTeam: "\u30de\u30fc\u30b1\u30c6\u30a3\u30f3\u30b0\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u30c1\u30fc\u30e0",
      clawrouter: "ClawRouter",
      troubleshoot: "\u30c8\u30e9\u30d6\u30eb\u30b7\u30e5\u30fc\u30c6\u30a3\u30f3\u30b0",
      docs: "\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8",
      blog: "\u30d6\u30ed\u30b0",
      skills: "\u30b9\u30ad\u30eb"
    },
    hero: {
      eyebrow: "\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7 + OpenClaw SOUL \u30d0\u30c3\u30af\u30a2\u30c3\u30d7",
      title: "5\u5206\u3067OpenClaw\u3092\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3002AI\u30d6\u30ec\u30a4\u30f3\u3092\u5fa9\u5143\u53ef\u80fd\u306b\u3002",
      subtitle:
        "ClawLite\u306f\u9ad8\u901f\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3068\u5185\u8535SOUL\u30d0\u30c3\u30af\u30a2\u30c3\u30d7\u3092\u63d0\u4f9b\u3057\u3001\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u3092\u7c21\u5358\u306b\u3001\u30ed\u30fc\u30eb\u30d0\u30c3\u30af\u3092\u5b89\u5168\u306b\u3057\u307e\u3059\u3002",
      start: "\u7121\u6599\u30a4\u30f3\u30b9\u30c8\u30fc\u30e9\u30fc\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9",
      secondary: "\u30aa\u30f3\u30dc\u30fc\u30c7\u30a3\u30f3\u30b0\u30a6\u30a3\u30b6\u30fc\u30c9\u3092\u958b\u304f",
      previewTitle: "\u30af\u30a4\u30c3\u30af\u30d7\u30ec\u30d3\u30e5\u30fc",
      previewSteps: [
        {
          title: "OS\u3092\u691c\u51fa",
          body: "\u30d7\u30e9\u30c3\u30c8\u30d5\u30a9\u30fc\u30e0\u3092\u81ea\u52d5\u691c\u51fa\u3057\u3001\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u3067\u78ba\u8a8d\u3002"
        },
        {
          title: "\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u30a6\u30a3\u30b6\u30fc\u30c9",
          body: "\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3092\u30af\u30ea\u30c3\u30af\u3057\u3066\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u30a6\u30a3\u30b6\u30fc\u30c9\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30fb\u5b9f\u884c\u3002"
        },
        {
          title: "API + \u30c1\u30e3\u30cd\u30eb",
          body: "ClawLite Tokens/BYOK\u3092\u9078\u629e\u3057\u3001\u30c1\u30e3\u30cd\u30eb\u306e\u6307\u793a\u306b\u5f93\u3044\u307e\u3059\u3002"
        }
      ],
      highlights: [
        "macOS + Windows\u5bfe\u5fdc\u306e\u7121\u6599\u30a4\u30f3\u30b9\u30c8\u30fc\u30e9\u30fc",
        "\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u3001\u624b\u52d5\u30b9\u30c6\u30c3\u30d7\u3092\u524a\u6e1b",
        "SOUL\u30d0\u30c3\u30af\u30a2\u30c3\u30d7\u3067\u5b89\u5168\u306a\u5fa9\u5143\u3068\u30ed\u30fc\u30eb\u30d0\u30c3\u30af",
        "\u30ac\u30a4\u30c9\u4ed8\u304d\u30d5\u30a9\u30fc\u30eb\u30d0\u30c3\u30af\u3068\u3057\u3066\u30a6\u30a3\u30b6\u30fc\u30c9\u304c\u5229\u7528\u53ef\u80fd"
      ],
      doneVerified: {
        title: "\u5b8c\u4e86 = \u691c\u8a3c\u6e08\u307f",
        subtitle: "\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3057\u305f\u3060\u3051\u3067\u306f\u306a\u304f \u2014 \u52d5\u4f5c\u78ba\u8a8d\u6e08\u307f\u3002",
        pillars: [
          {
            title: "5\u5206\u3002DevOps\u4e0d\u8981\u3002\u691c\u8a3c\u6e08\u307f\u3002",
            description: "\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3002\u5168\u4f9d\u5b58\u95a2\u4fc2\u691c\u8a3c\u6e08\u307f\u3002\u521d\u56de\u30af\u30a8\u30ea\u6210\u529f\u3002"
          },
          {
            title: "40%\u5b89\u3044\u30c8\u30fc\u30af\u30f3\u3002\u691c\u8a3c\u6e08\u307f\u306e\u7bc0\u7d04\u3002",
            description: "\u7d04\u675f\u3067\u306f\u3042\u308a\u307e\u305b\u3093\u3002\u6bce\u56de\u306e\u547c\u3073\u51fa\u3057\u3067\u691c\u8a3c\u6e08\u307f\u306e40%\u7bc0\u7d04\u3002"
          },
          {
            title: "\u8a2d\u5b9a\u306f\u8cc7\u7523\u3002\u5b89\u5168\u6027\u691c\u8a3c\u6e08\u307f\u3002",
            description: "\u81ea\u52d5\u30d0\u30c3\u30af\u30a2\u30c3\u30d7\u3002\u6697\u53f7\u5316\u30b9\u30c8\u30ec\u30fc\u30b8\u3002\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u5fa9\u5143\u3002\u30c7\u30fc\u30bf\u640d\u5931\u30bc\u30ed\u3002"
          }
        ],
        cta: "\u7121\u6599\u3067\u59cb\u3081\u308b"
      }
    },
    setup: {
      title: "\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u30a6\u30a3\u30b6\u30fc\u30c9",
      subtitle: "4\u30b9\u30c6\u30c3\u30d7\u306b\u5f93\u3046\uff1aOS \u2192 \u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u30a6\u30a3\u30b6\u30fc\u30c9 \u2192 API \u2192 \u30c1\u30e3\u30cd\u30eb\u3002",
      steps: [
        {
          id: "os",
          title: "OS\u3092\u691c\u51fa",
          description: "\u304a\u4f7f\u3044\u306e\u30b7\u30b9\u30c6\u30e0\u306b\u5408\u308f\u305b\u3066\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u3092\u30ab\u30b9\u30bf\u30de\u30a4\u30ba\u3002"
        },
        {
          id: "install",
          title: "\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb",
          description: "\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3092\u30af\u30ea\u30c3\u30af\u3057\u3066ClawLite\u30a6\u30a3\u30b6\u30fc\u30c9\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30fb\u5b9f\u884c\u3002"
        },
        {
          id: "api",
          title: "API\u3092\u8a2d\u5b9a",
          description: "\u30c7\u30d5\u30a9\u30eb\u30c8\u306fClawLite Tokens\uff0850%\u5272\u5f15\uff09\u307e\u305f\u306fBYOK\u3092\u9078\u629e\u3002"
        },
        {
          id: "channel",
          title: "\u30c1\u30e3\u30cd\u30eb\u3092\u9078\u629e",
          description: "Telegram/Web Chat\u306e\u6307\u793a\u306e\u307f\u306b\u5f93\u3063\u3066\u304f\u3060\u3055\u3044\u3002"
        }
      ],
      sidebar: {
        title: "\u30b9\u30c6\u30c3\u30d7",
        countLabel: "\u30b9\u30c6\u30c3\u30d7"
      },
      buttons: {
        next: "\u6b21\u3078",
        back: "\u623b\u308b",
        copy: "\u30b3\u30d4\u30fc",
        copied: "\u30b3\u30d4\u30fc\u6e08\u307f",
        openDocs: "\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u3092\u958b\u304f",
        done: "\u5b8c\u4e86",
        reset: "\u6700\u521d\u304b\u3089"
      },
      os: {
        autoDetected: "\u81ea\u52d5\u691c\u51fa",
        prompt: "\u30aa\u30da\u30ec\u30fc\u30c6\u30a3\u30f3\u30b0\u30b7\u30b9\u30c6\u30e0\u3092\u9078\u629e",
        macos: "macOS",
        windows: "Windows",
        linux: "Linux",
        checkCommandTitle: "OS\u3092\u81ea\u52d5\u691c\u51fa"
      },
      install: {
        wizardTitle: "ClawLite\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u30a6\u30a3\u30b6\u30fc\u30c9",
        wizardDesc: "\u30ef\u30f3\u30af\u30ea\u30c3\u30af\u3067\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3002\u304a\u4f7f\u3044\u306eOS\u7528\u306e\u30a4\u30f3\u30b9\u30c8\u30fc\u30e9\u30fc\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3002",
        installButton: "\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb",
        allDownloads: "\u5168\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9",
        commandTitle: "\u30a6\u30a3\u30b6\u30fc\u30c9\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u30d5\u30ed\u30fc"
      },
      api: {
        modeTitle: "API\u8a2d\u5b9a\u3092\u9078\u629e",
        clawliteTitle: "ClawLite Tokens\uff08\u30c7\u30d5\u30a9\u30eb\u30c8\uff09",
        clawliteDesc: "\u516c\u5f0fAPI\u4fa1\u683c\u304b\u308950%\u5272\u5f15\u3002\u6700\u901f\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u306b\u304a\u3059\u3059\u3081\u3002",
        byokTitle: "\u81ea\u5206\u306e\u30ad\u30fc\u3092\u4f7f\u7528",
        byokDesc: "OpenAI / Anthropic / \u4ed6\u306e\u30d7\u30ed\u30d0\u30a4\u30c0\u30fc\u306e\u30ad\u30fc\u3092\u4f7f\u7528\u3002",
        emailLabel: "\u30c8\u30fc\u30af\u30f3\u7528\u30e1\u30fc\u30eb",
        tokenLabel: "ClawLite\u30c8\u30fc\u30af\u30f3",
        sendLink: "\u30ed\u30b0\u30a4\u30f3\u30ea\u30f3\u30af\u3092\u9001\u4fe1",
        providerLabel: "\u30d7\u30ed\u30d0\u30a4\u30c0\u30fc",
        keyLabel: "API\u30ad\u30fc",
        commandTitle: "\u8a2d\u5b9a\u3092\u9069\u7528\uff08\u30bf\u30fc\u30df\u30ca\u30eb\u4e0d\u8981\uff09",
        note: "\u30d6\u30e9\u30a6\u30b6\u306b\u306fAPI\u30ad\u30fc\u3092\u4fdd\u5b58\u3057\u307e\u305b\u3093\u3002"
      },
      channel: {
        title: "\u30c1\u30e3\u30cd\u30eb\u3092\u9078\u629e\uff08\u8aac\u660e\u306e\u307f\uff09",
        telegram: "Telegram",
        webchat: "Web Chat",
        telegramSteps: [
          "Telegram\u3092\u958b\u3044\u3066@BotFather\u3092\u691c\u7d22",
          "\u65b0\u3057\u3044\u30dc\u30c3\u30c8\u3092\u4f5c\u6210\u3057\u30c8\u30fc\u30af\u30f3\u3092\u30b3\u30d4\u30fc",
          "\u4e0b\u306b\u30c8\u30fc\u30af\u30f3\u3092\u8cbc\u308a\u4ed8\u3051"
        ],
        webchatSteps: [
          "\u8ffd\u52a0\u8a2d\u5b9a\u4e0d\u8981",
          "\u8d77\u52d5\u3057\u3066Web Chat URL\u3092\u958b\u304f",
          "\u30c1\u30fc\u30e0\u3068\u30ea\u30f3\u30af\u3092\u5171\u6709"
        ],
        botTokenLabel: "Telegram Bot\u30c8\u30fc\u30af\u30f3",
        commandTitle: "\u30c1\u30e3\u30cd\u30eb\u3092\u63a5\u7d9a\uff08\u30bf\u30fc\u30df\u30ca\u30eb\u4e0d\u8981\uff09"
      },
      launch: {
        title: "OpenClaw\u3092\u8d77\u52d5\uff08\u30bf\u30fc\u30df\u30ca\u30eb\u4e0d\u8981\uff09",
        successTitle: "\u7a3c\u50cd\u4e2d\uff01\ud83e\udd9e",
        successDesc: "\u6700\u521d\u306e\u30e1\u30c3\u30bb\u30fc\u30b8\u3092\u9001\u4fe1\u3057\u3066\u30a8\u30fc\u30b8\u30a7\u30f3\u30c8\u306e\u5fdc\u7b54\u3092\u78ba\u8a8d\u3002",
        firstMsg: "\u8a66\u3057\u3066\u307f\u3066\uff1a\u3053\u3093\u306b\u3061\u306fClawLite\u3001\u4eca\u65e5\u306e\u4e88\u5b9a\u3092\u7acb\u3066\u3066",
        emailTitle: "\u4efb\u610f\uff1a\u30d2\u30f3\u30c8\u7528\u30e1\u30fc\u30eb\u3092\u6b8b\u3059",
        emailDesc: "BYOK\u30e6\u30fc\u30b6\u30fc\u5411\u3051 \u2014 \u30d9\u30b9\u30c8\u30d7\u30e9\u30af\u30c6\u30a3\u30b9\u3068\u66f4\u65b0\u60c5\u5831\u3002",
        emailLabel: "\u30e1\u30fc\u30eb\uff08\u4efb\u610f\uff09",
        submitEmail: "\u901a\u77e5\u3059\u308b",
        skip: "\u30b9\u30ad\u30c3\u30d7",
        privacy: "\u88fd\u54c1\u306e\u30d2\u30f3\u30c8\u3068\u66f4\u65b0\u306b\u306e\u307f\u4f7f\u7528\u3057\u307e\u3059\u3002"
      }
    },
    troubleshoot: {
      title: "\u30c8\u30e9\u30d6\u30eb\u30b7\u30e5\u30fc\u30c6\u30a3\u30f3\u30b0",
      subtitle: "\u4e00\u822c\u7684\u306a\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u554f\u984c\u306e\u30af\u30a4\u30c3\u30af\u30d5\u30a3\u30c3\u30af\u30b9\u3002",
      issues: [
        {
          title: "macOS\u3067\u300cClawLite\u300d\u304c\u958b\u3051\u306a\u3044",
          body: "Finder\u3067ClawLite.app\u3092\u898b\u3064\u3051\uff08\u307e\u305f\u306f\u5148\u306b\u30a2\u30d7\u30ea\u30b1\u30fc\u30b7\u30e7\u30f3\u306b\u30c9\u30e9\u30c3\u30b0\uff09\u3001\u53f3\u30af\u30ea\u30c3\u30af\u3067\u300c\u958b\u304f\u300d\u3092\u9078\u629e\u3001\u3082\u3046\u4e00\u5ea6\u300c\u958b\u304f\u300d\u3092\u30af\u30ea\u30c3\u30af\u3002\u307e\u3060\u30d6\u30ed\u30c3\u30af\u3055\u308c\u308b\u5834\u5408\u306f\u3001\u30b7\u30b9\u30c6\u30e0\u8a2d\u5b9a \u2192 \u30d7\u30e9\u30a4\u30d0\u30b7\u30fc\u3068\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u3067\u300c\u3053\u306e\u307e\u307e\u958b\u304f\u300d\u3092\u30af\u30ea\u30c3\u30af\u3002\u30bf\u30fc\u30df\u30ca\u30eb\uff08\u4e0a\u7d1a\uff09\uff1axattr -dr com.apple.quarantine /Applications/ClawLite.app && open /Applications/ClawLite.app"
        },
        {
          title: "Node.js\u30b3\u30de\u30f3\u30c9\u304c\u898b\u3064\u304b\u3089\u306a\u3044",
          body: "Node.js\u3092\u518d\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u3057\u3001\u30bf\u30fc\u30df\u30ca\u30eb\u3092\u518d\u8d77\u52d5\u3002macOS\u3067\u306fHomebrew\u304cPATH\u306b\u3042\u308b\u304b\u78ba\u8a8d\u3002"
        },
        {
          title: "npm install\u3067\u6a29\u9650\u304c\u62d2\u5426\u3055\u308c\u308b",
          body: "macOS/Linux\u3067\u306fsudo\u3092\u4f7f\u7528\u3001Windows\u3067\u306fPowerShell\u3092\u7ba1\u7406\u8005\u3068\u3057\u3066\u5b9f\u884c\u3002"
        },
        {
          title: "OpenClaw\u304c\u8d77\u52d5\u3059\u308b\u304c\u5fdc\u7b54\u304c\u306a\u3044",
          body: "API\u30ad\u30fc\u304c\u6709\u52b9\u3067\u3042\u308b\u3053\u3068\u3001\u30c1\u30e3\u30cd\u30eb\u30c8\u30fc\u30af\u30f3\u304c\u4f5c\u6210\u3057\u305f\u30dc\u30c3\u30c8\u3068\u4e00\u81f4\u3059\u308b\u3053\u3068\u3092\u78ba\u8a8d\u3002"
        },
        {
          title: "Telegram\u30dc\u30c3\u30c8\u304c\u30e1\u30c3\u30bb\u30fc\u30b8\u3092\u53d7\u4fe1\u3057\u306a\u3044",
          body: "\u30dc\u30c3\u30c8\u306b/start\u3092\u9001\u4fe1\u3057\u3001\u30c8\u30fc\u30af\u30f3\u304c\u6b63\u3057\u3044\u3053\u3068\u3092\u78ba\u8a8d\u3002"
        },
        {
          title: "\u30d5\u30a1\u30a4\u30a2\u30a6\u30a9\u30fc\u30eb\u307e\u305f\u306f\u30d7\u30ed\u30ad\u30b7\u306e\u554f\u984c",
          body: "\u5225\u306e\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u3092\u8a66\u3059\u304b\u3001npm\u3068OpenClaw\u306e\u30d7\u30ed\u30ad\u30b7\u3092\u8a2d\u5b9a\u3002"
        }
      ]
    },
    docsPage: {
      description: "OpenClaw\u306e\u516c\u5f0f\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u3092\u65b0\u3057\u3044\u30bf\u30d6\u3067\u958b\u304f\u3002",
      back: "\u30a4\u30f3\u30b9\u30c8\u30fc\u30e9\u30fc\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306b\u623b\u308b"
    },
    footer: {
      tagline: "\u4eba\u306e\u305f\u3081\u306b\u4f5c\u3089\u308c\u305f\u3002OpenClaw\u304c\u52d5\u304b\u3059\u3002",
      cta: "\u59cb\u3081\u308b\u6e96\u5099\u306f\u3067\u304d\u307e\u3057\u305f\u304b\uff1f"
    }
  },
  ko: {
    nav: {
      home: "\ud648",
      setup: "\uc124\uce58",
      marketingAgentTeam: "\ub9c8\ucf00\ud305 \uc5d0\uc774\uc804\ud2b8 \ud300",
      clawrouter: "ClawRouter",
      troubleshoot: "\ubb38\uc81c \ud574\uacb0",
      docs: "\ubb38\uc11c",
      blog: "\ube14\ub85c\uadf8",
      skills: "\uc2a4\ud0ac"
    },
    hero: {
      eyebrow: "\uc6d0\ud074\ub9ad \uc124\uce58 + OpenClaw SOUL \ubc31\uc5c5",
      title: "5\ubd84 \ub9cc\uc5d0 OpenClaw \uc124\uce58. AI \ube0c\ub808\uc778\uc744 \ubcf5\uad6c \uac00\ub2a5\ud558\uac8c.",
      subtitle:
        "ClawLite\ub294 \ube60\ub978 \uc6d0\ud074\ub9ad \uc124\uce58\uc640 \ub0b4\uc7a5 SOUL \ubc31\uc5c5\uc744 \uc81c\uacf5\ud558\uc5ec \uc124\uce58\ub294 \uc27d\uace0 \ub864\ubc31\uc740 \uc548\uc804\ud558\uac8c \ud569\ub2c8\ub2e4.",
      start: "\ubb34\ub8cc \uc124\uce58 \ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc",
      secondary: "\uc628\ubcf4\ub529 \ub9c8\ubc95\uc0ac \uc5f4\uae30",
      previewTitle: "\ube60\ub978 \ubbf8\ub9ac\ubcf4\uae30",
      previewSteps: [
        {
          title: "OS \uac10\uc9c0",
          body: "\ud50c\ub7ab\ud3fc\uc744 \uc790\ub3d9 \uac10\uc9c0\ud558\uace0 \uc6d0\ud074\ub9ad\uc73c\ub85c \ud655\uc778\ud569\ub2c8\ub2e4."
        },
        {
          title: "\uc124\uce58 \ub9c8\ubc95\uc0ac",
          body: "\uc124\uce58\ub97c \ud074\ub9ad\ud558\uc5ec \uc14b\uc5c5 \ub9c8\ubc95\uc0ac\ub97c \ub2e4\uc6b4\ub85c\ub4dc\ud558\uace0 \uc2e4\ud589\ud569\ub2c8\ub2e4."
        },
        {
          title: "API + \ucc44\ub110",
          body: "ClawLite Tokens/BYOK\ub97c \uc120\ud0dd\ud558\uace0 \ucc44\ub110 \uc548\ub0b4\ub97c \ub530\ub985\ub2c8\ub2e4."
        }
      ],
      highlights: [
        "macOS + Windows \ubb34\ub8cc \uc124\uce58 \ud504\ub85c\uadf8\ub7a8",
        "\uc6d0\ud074\ub9ad \uc124\uce58, \uc218\ub3d9 \ub2e8\uacc4 \ucd5c\uc18c\ud654",
        "SOUL \ubc31\uc5c5\uc73c\ub85c \uc548\uc804\ud55c \ubcf5\uc6d0 \ubc0f \ub864\ubc31",
        "\uac00\uc774\ub4dc \ud3f4\ubc31\uc73c\ub85c \uc628\ubcf4\ub529 \ub9c8\ubc95\uc0ac \uc0ac\uc6a9 \uac00\ub2a5"
      ],
      doneVerified: {
        title: "\uc644\ub8cc = \uac80\uc99d \uc644\ub8cc",
        subtitle: "\uc124\uce58\ub9cc \ud55c \uac83\uc774 \uc544\ub2c8\ub77c \u2014 \uc791\ub3d9\uc774 \ud655\uc778\ub418\uc5c8\uc2b5\ub2c8\ub2e4.",
        pillars: [
          {
            title: "5\ubd84. DevOps \ubd88\ud544\uc694. \uac80\uc99d \uc644\ub8cc.",
            description: "\uc6d0\ud074\ub9ad \uc124\uce58. \ubaa8\ub4e0 \uc758\uc874\uc131 \uac80\uc99d \uc644\ub8cc. \uccab \ucffc\ub9ac \uc131\uacf5."
          },
          {
            title: "40% \uc800\ub834\ud55c \ud1a0\ud070. \uac80\uc99d\ub41c \uc808\uc57d.",
            description: "\uc57d\uc18d\uc774 \uc544\ub2d9\ub2c8\ub2e4. \ub9e4 \ud638\ucd9c\ub9c8\ub2e4 \uac80\uc99d\ub41c 40% \uc808\uc57d."
          },
          {
            title: "\uc124\uc815\uc740 \uc790\uc0b0. \uc548\uc804 \uac80\uc99d \uc644\ub8cc.",
            description: "\uc790\ub3d9 \ubc31\uc5c5. \uc554\ud638\ud654 \uc800\uc7a5. \uc6d0\ud074\ub9ad \ubcf5\uc6d0. \ub370\uc774\ud130 \uc190\uc2e4 \uc81c\ub85c."
          }
        ],
        cta: "\ubb34\ub8cc\ub85c \uc2dc\uc791"
      }
    },
    setup: {
      title: "\uc14b\uc5c5 \ub9c8\ubc95\uc0ac",
      subtitle: "4\ub2e8\uacc4\ub97c \ub530\ub974\uc138\uc694: OS \u2192 \uc124\uce58 \ub9c8\ubc95\uc0ac \u2192 API \u2192 \ucc44\ub110.",
      steps: [
        {
          id: "os",
          title: "OS \uac10\uc9c0",
          description: "\uc2dc\uc2a4\ud15c\uc5d0 \ub9de\ucdb0 \uc14b\uc5c5 \ud750\ub984\uc744 \uc870\uc815\ud569\ub2c8\ub2e4."
        },
        {
          id: "install",
          title: "\uc6d0\ud074\ub9ad \uc124\uce58",
          description: "\uc124\uce58\ub97c \ud074\ub9ad\ud558\uc5ec ClawLite \ub9c8\ubc95\uc0ac\ub97c \ub2e4\uc6b4\ub85c\ub4dc\ud558\uace0 \uc2e4\ud589\ud569\ub2c8\ub2e4."
        },
        {
          id: "api",
          title: "API \uc124\uc815",
          description: "\uae30\ubcf8 ClawLite Tokens(50% \ud560\uc778) \ub610\ub294 BYOK\ub97c \uc120\ud0dd\ud569\ub2c8\ub2e4."
        },
        {
          id: "channel",
          title: "\ucc44\ub110 \uc120\ud0dd",
          description: "Telegram/Web Chat \uc548\ub0b4\ub9cc \ub530\ub974\uc138\uc694."
        }
      ],
      sidebar: {
        title: "\ub2e8\uacc4",
        countLabel: "\ub2e8\uacc4"
      },
      buttons: {
        next: "\ub2e4\uc74c",
        back: "\uc774\uc804",
        copy: "\ubcf5\uc0ac",
        copied: "\ubcf5\uc0ac\ub428",
        openDocs: "\ubb38\uc11c \uc5f4\uae30",
        done: "\uc644\ub8cc",
        reset: "\ucc98\uc74c\ubd80\ud130"
      },
      os: {
        autoDetected: "\uc790\ub3d9 \uac10\uc9c0",
        prompt: "\uc6b4\uc601\uccb4\uc81c\ub97c \uc120\ud0dd\ud558\uc138\uc694",
        macos: "macOS",
        windows: "Windows",
        linux: "Linux",
        checkCommandTitle: "OS \uc790\ub3d9 \uac10\uc9c0"
      },
      install: {
        wizardTitle: "ClawLite \uc124\uce58 \ub9c8\ubc95\uc0ac",
        wizardDesc: "\uc6d0\ud074\ub9ad\uc73c\ub85c \uc124\uce58. OS\uc5d0 \ub9de\ub294 \uc124\uce58 \ub9c8\ubc95\uc0ac\ub97c \ub2e4\uc6b4\ub85c\ub4dc\ud569\ub2c8\ub2e4.",
        installButton: "\uc124\uce58",
        allDownloads: "\ubaa8\ub4e0 \ub2e4\uc6b4\ub85c\ub4dc",
        commandTitle: "\ub9c8\ubc95\uc0ac \uc124\uce58 \ud750\ub984"
      },
      api: {
        modeTitle: "API \uc124\uc815 \uc120\ud0dd",
        clawliteTitle: "ClawLite Tokens (\uae30\ubcf8)",
        clawliteDesc: "\uacf5\uc2dd API \uac00\uaca9 50% \ud560\uc778. \uac00\uc7a5 \ube60\ub978 \uc14b\uc5c5\uc5d0 \ucd94\ucc9c.",
        byokTitle: "\uc790\uc2e0\uc758 \ud0a4 \uc0ac\uc6a9",
        byokDesc: "OpenAI / Anthropic / \uae30\ud0c0 \uc81c\uacf5\uc5c5\uccb4 \ud0a4\ub97c \uc0ac\uc6a9\ud569\ub2c8\ub2e4.",
        emailLabel: "\ud1a0\ud070\uc6a9 \uc774\uba54\uc77c",
        tokenLabel: "ClawLite \ud1a0\ud070",
        sendLink: "\ub85c\uadf8\uc778 \ub9c1\ud06c \ubcf4\ub0b4\uae30",
        providerLabel: "\uc81c\uacf5\uc5c5\uccb4",
        keyLabel: "API \ud0a4",
        commandTitle: "\uc124\uc815 \uc801\uc6a9 (\ud130\ubbf8\ub110 \ubd88\ud544\uc694)",
        note: "\ube0c\ub77c\uc6b0\uc800\uc5d0 API \ud0a4\ub97c \uc800\uc7a5\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."
      },
      channel: {
        title: "\ucc44\ub110 \uc120\ud0dd (\uc548\ub0b4\ub9cc)",
        telegram: "Telegram",
        webchat: "Web Chat",
        telegramSteps: [
          "Telegram\uc744 \uc5f4\uace0 @BotFather\ub97c \uac80\uc0c9",
          "\uc0c8 \ubd07\uc744 \ub9cc\ub4e4\uace0 \ud1a0\ud070\uc744 \ubcf5\uc0ac",
          "\uc544\ub798\uc5d0 \ud1a0\ud070\uc744 \ubd99\uc5ec\ub123\uae30"
        ],
        webchatSteps: [
          "\ucd94\uac00 \uc124\uc815 \ubd88\ud544\uc694",
          "\uc2e4\ud589\ud558\uace0 Web Chat URL\uc744 \uc5f4\uae30",
          "\ud300\uacfc \ub9c1\ud06c \uacf5\uc720"
        ],
        botTokenLabel: "Telegram Bot \ud1a0\ud070",
        commandTitle: "\ucc44\ub110 \uc5f0\uacb0 (\ud130\ubbf8\ub110 \ubd88\ud544\uc694)"
      },
      launch: {
        title: "OpenClaw \uc2dc\uc791 (\ud130\ubbf8\ub110 \ubd88\ud544\uc694)",
        successTitle: "\ub77c\uc774\ube0c! \ud83e\udd9e",
        successDesc: "\uccab \ubc88\uc9f8 \uba54\uc2dc\uc9c0\ub97c \ubcf4\ub0b4\uace0 \uc5d0\uc774\uc804\ud2b8 \uc751\ub2f5\uc744 \ud655\uc778\ud558\uc138\uc694.",
        firstMsg: "\uc2dc\ub3c4: \uc548\ub155 ClawLite, \uc624\ub298 \uc77c\uc815 \uc9dc\uc918",
        emailTitle: "\uc120\ud0dd: \ud301 \ubc1b\uc744 \uc774\uba54\uc77c \ub0a8\uae30\uae30",
        emailDesc: "BYOK \uc0ac\uc6a9\uc790\uc6a9 \u2014 \ubca0\uc2a4\ud2b8 \ud504\ub799\ud2f0\uc2a4\uc640 \uc5c5\ub370\uc774\ud2b8 \uc81c\uacf5.",
        emailLabel: "\uc774\uba54\uc77c (\uc120\ud0dd)",
        submitEmail: "\uc54c\ub9bc \ubc1b\uae30",
        skip: "\uac74\ub108\ub6f0\uae30",
        privacy: "\uc81c\ud488 \ud301\uacfc \uc5c5\ub370\uc774\ud2b8\uc5d0\ub9cc \uc0ac\uc6a9\ud569\ub2c8\ub2e4."
      }
    },
    troubleshoot: {
      title: "\ubb38\uc81c \ud574\uacb0",
      subtitle: "\uc77c\ubc18\uc801\uc778 \uc14b\uc5c5 \ubb38\uc81c\uc758 \ube60\ub978 \ud574\uacb0 \ubc29\ubc95.",
      issues: [
        {
          title: "macOS\uc5d0\uc11c \"ClawLite\"\uac00 \uc5f4\ub9ac\uc9c0 \uc54a\uc74c",
          body: "Finder\uc5d0\uc11c ClawLite.app\uc744 \ucc3e\uace0(\ub610\ub294 \uba3c\uc800 \uc751\uc6a9 \ud504\ub85c\uadf8\ub7a8\uc73c\ub85c \ub4dc\ub798\uadf8), \uc6b0\ud074\ub9ad\uc73c\ub85c \uc5f4\uae30\ub97c \uc120\ud0dd\ud55c \ud6c4 \ub2e4\uc2dc \uc5f4\uae30\ub97c \ud074\ub9ad\ud569\ub2c8\ub2e4. \uc5ec\uc804\ud788 \ucc28\ub2e8\ub418\uba74 \uc2dc\uc2a4\ud15c \uc124\uc815 \u2192 \uac1c\uc778\uc815\ubcf4 \ubcf4\ud638 \ubc0f \ubcf4\uc548\uc5d0\uc11c \uadf8\ub798\ub3c4 \uc5f4\uae30\ub97c \ud074\ub9ad\ud569\ub2c8\ub2e4. \ud130\ubbf8\ub110(\uace0\uae09): xattr -dr com.apple.quarantine /Applications/ClawLite.app && open /Applications/ClawLite.app"
        },
        {
          title: "Node.js \uba85\ub839\uc5b4\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc74c",
          body: "Node.js\ub97c \uc7ac\uc124\uce58\ud558\uace0 \ud130\ubbf8\ub110\uc744 \ub2e4\uc2dc \uc5ec\uc138\uc694. macOS\uc5d0\uc11c\ub294 Homebrew\uac00 PATH\uc5d0 \uc788\ub294\uc9c0 \ud655\uc778\ud558\uc138\uc694."
        },
        {
          title: "npm install \uc2dc \uad8c\ud55c \uac70\ubd80",
          body: "macOS/Linux\uc5d0\uc11c\ub294 sudo\ub97c \uc0ac\uc6a9\ud558\uace0, Windows\uc5d0\uc11c\ub294 PowerShell\uc744 \uad00\ub9ac\uc790\ub85c \uc2e4\ud589\ud558\uc138\uc694."
        },
        {
          title: "OpenClaw\uc774 \uc2dc\uc791\ub418\uc9c0\ub9cc \uc751\ub2f5\uc774 \uc5c6\uc74c",
          body: "API \ud0a4\uac00 \uc720\ud6a8\ud55c\uc9c0, \ucc44\ub110 \ud1a0\ud070\uc774 \ub9cc\ub4e0 \ubd07\uacfc \uc77c\uce58\ud558\ub294\uc9c0 \ud655\uc778\ud558\uc138\uc694."
        },
        {
          title: "Telegram \ubd07\uc774 \uba54\uc2dc\uc9c0\ub97c \ubc1b\uc9c0 \uc54a\uc74c",
          body: "\ubd07\uc5d0\uac8c /start\ub97c \ubcf4\ub0b4\uace0 \ud1a0\ud070\uc774 \uc62c\ubc14\ub978\uc9c0 \ud655\uc778\ud558\uc138\uc694."
        },
        {
          title: "\ubc29\ud654\ubcbd \ub610\ub294 \ud504\ub85d\uc2dc \ubb38\uc81c",
          body: "\ub2e4\ub978 \ub124\ud2b8\uc6cc\ud06c\ub97c \uc2dc\ub3c4\ud558\uac70\ub098 npm\uacfc OpenClaw\uc5d0 \ud504\ub85d\uc2dc\ub97c \uc124\uc815\ud558\uc138\uc694."
        }
      ]
    },
    docsPage: {
      description: "OpenClaw \uacf5\uc2dd \ubb38\uc11c\ub97c \uc0c8 \ud0ed\uc5d0\uc11c \uc5fd\ub2c8\ub2e4.",
      back: "\uc124\uce58 \ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc\ub85c \ub3cc\uc544\uac00\uae30"
    },
    footer: {
      tagline: "\uc0ac\ub78c\uc744 \uc704\ud574 \ub9cc\ub4e4\uc5c8\uc2b5\ub2c8\ub2e4. OpenClaw\uc774 \uad6c\ub3d9\ud569\ub2c8\ub2e4.",
      cta: "\uc2dc\uc791\ud560 \uc900\ube44\uac00 \ub418\uc168\ub098\uc694?"
    }
  },
  admin: {
    nav: {
      ezrouterKeys: { en: "EZRouter Keys", zh: "EZRouter Keys", es: "EZRouter Keys", ja: "EZRouter Keys", ko: "EZRouter Keys" },
      customers: { en: "Customers", zh: "\u5ba2\u6237\u7ba1\u7406", es: "Customers", ja: "Customers", ko: "Customers" },
      usage: { en: "Usage", zh: "\u6d88\u8d39\u7edf\u8ba1", es: "Usage", ja: "Usage", ko: "Usage" },
      admins: { en: "Admins", zh: "\u7ba1\u7406\u5458", es: "Admins", ja: "Admins", ko: "Admins" },
      logout: { en: "Logout", zh: "\u9000\u51fa", es: "Logout", ja: "Logout", ko: "Logout" }
    },
    ezrouterKeys: {
      title: { en: "EZRouter Key Pool", zh: "EZRouter Key \u6c60" },
      desc: { en: "Manage EZRouter keys. Supports add, edit, delete and status toggle.", zh: "\u7ba1\u7406 EZRouter \u7684 Key \u6c60\uff0c\u652f\u6301\u6dfb\u52a0\u3001\u7f16\u8f91\u3001\u5220\u9664\u548c\u72b6\u6001\u5207\u6362\u3002" },
      addKey: { en: "Add Key", zh: "\u6dfb\u52a0 Key" },
      name: { en: "Name", zh: "\u540d\u79f0" },
      keyPrefix: { en: "Key Prefix", zh: "Key \u524d\u7f00" },
      status: { en: "Status", zh: "\u72b6\u6001" },
      useCount: { en: "Use Count", zh: "\u4f7f\u7528\u6b21\u6570" },
      balance: { en: "Balance", zh: "\u4f59\u989d" },
      createdAt: { en: "Created", zh: "\u521b\u5efa\u65f6\u95f4" },
      actions: { en: "Actions", zh: "\u64cd\u4f5f" },
      active: { en: "Active", zh: "\u6b63\u5e38" },
      inactive: { en: "Inactive", zh: "\u505c\u7528" },
      edit: { en: "Edit", zh: "\u7f16\u8f91" },
      delete: { en: "Delete", zh: "\u5220\u9664" },
      confirmDelete: { en: "Confirm delete?", zh: "\u786e\u5b9a\u5220\u9664\uff1f" },
      save: { en: "Save", zh: "\u4fdd\u5b58" },
      cancel: { en: "Cancel", zh: "\u53d6\u6d88" },
      keyId: { en: "Key ID", zh: "Key ID" },
      plaintextKey: { en: "Plaintext Key", zh: "\u660e\u6587 Key" },
      loadWeight: { en: "Load Weight", zh: "\u8d1f\u8f93\u6743\u91cd" },
      shared: { en: "Shared", zh: "\u5171\u4eab" },
      listTitle: { en: "Key List", zh: "Key \u5217\u8868" },
      noKeys: { en: "No keys yet", zh: "\u6682\u65e0 Key" },
      sharedKey: { en: "Shared Key", zh: "\u5171\u4eab Key" }
    },
    customers: {
      title: { en: "Customer Management", zh: "\u5ba2\u6237\u7ba1\u7406" },
      desc: { en: "View all customers. Support search and balance management.", zh: "\u67e5\u770b\u6240\u6709\u6ce8\u518c\u5ba2\u6237\u4fe1\u606f\uff0c\u652f\u6301\u641c\u7d22\u548c\u4f59\u989d\u7ba1\u7406\u3002" },
      email: { en: "Email", zh: "\u90ae\u7bb1" },
      balance: { en: "Balance", zh: "\u4f59\u989d" },
      plan: { en: "Plan", zh: "\u5957\u9910" },
      registered: { en: "Registered", zh: "\u6ce8\u518c\u65f6\u95f4" },
      lastActive: { en: "Last Active", zh: "\u6700\u540e\u6d3b\u6d3b" },
      search: { en: "Search by email...", zh: "\u641c\u7d22\u90ae\u7bb1..." },
      adjustBalance: { en: "Adjust Balance", zh: "\u8c03\u6574\u4f59\u989d" },
      viewDetail: { en: "View Detail", zh: "\u67e5\u770b\u8be6\u60c5" },
      listTitle: { en: "Customer List", zh: "\u5ba2\u6237\u5217\u8868" },
      noCustomers: { en: "No customers", zh: "\u6682\u65e0\u5ba2\u6237" },
      noMatch: { en: "No matching customers", zh: "\u672a\u627e\u5230\u5339\u914d\u7684\u5ba2\u6237" },
      totalRecords: { en: "Total records", zh: "\u5171" },
      customerDetail: { en: "Customer Detail", zh: "\u5ba2\u6237\u8be6\u60c5" },
      currentBalance: { en: "Current Balance", zh: "\u5f53\u524d\u4f59\u989d" },
      billingStatus: { en: "Billing Status", zh: "\u8d26\u5355\u72b6\u6001" },
      adjustAmount: { en: "Adjust amount (positive to add, negative to subtract)", zh: "\u8c03\u6574\u91d1\u989d\uff08\u6b63\u6570\u589e\u52a0\uff0c\u8d1f\u6570\u51cf\u5c11\uff09" },
      note: { en: "Note (optional)", zh: "\u5907\u6ce8\uff08\u53ef\u9009\uff09" },
      adjustNote: { en: "Adjustment reason...", zh: "\u8c03\u6574\u539f\u56e0..." },
      confirmAdjust: { en: "Confirm Adjustment", zh: "\u786e\u8ba4\u8c03\u6574" },
      adjusting: { en: "Adjusting...", zh: "\u8c03\u6574\u4e2d..." },
      adjustingBalance: { en: "Adjusting...", zh: "\u8c03\u6574\u4e2d..." },
      saveSuccess: { en: "Save Success", zh: "\u4fdd\u5b58\u6210\u529f" },
      saveFail: { en: "Save failed", zh: "\u4fdd\u5b58\u5931\u6557" },
      invalidAmount: { en: "Please enter a valid amount", zh: "\u8bf7\u8f93\u5165\u6709\u6548\u91d1\u989d" }
    },
    usage: {
      title: { en: "Usage Statistics", zh: "\u6d88\u8d39\u7edf\u8ba1" },
      desc: { en: "Global usage overview and customer distribution.", zh: "\u5168\u5c40\u6d88\u8d39\u6982\u89c8\uff0c\u6309\u5ba2\u6237\u5206\u5e03\u5206\u6790\u3002" },
      totalRequests: { en: "Total Requests", zh: "\u603b\u8bf7\u6c42\u6570" },
      totalTokens: { en: "Total Token", zh: "\u603b Token" },
      totalCost: { en: "Total Cost", zh: "\u603b\u8d39\u7528" },
      topCustomers: { en: "Top Customers", zh: "Top \u5ba2\u6237" },
      dateRange: { en: "Date Range", zh: "\u65e5\u671f\u8303\u56f4" },
      refresh: { en: "Refresh", zh: "\u5237\u65b0" },
      allTime: { en: "All time", zh: "\u5168\u90e8\u65f6\u95f4\u7d2f\u8ba1" },
      dateFilter: { en: "Date Filter", zh: "\u65e5\u671f\u7b5b\u9009" },
      from: { en: "From", zh: "\u4ece" },
      to: { en: "To", zh: "\u81f3" },
      topAccountsTitle: { en: "Top 10 Accounts by Cost", zh: "\u6309\u5ba2\u6237\u8d39\u7528\u6392\u540d\uff08TOP 10\uff09" },
      rank: { en: "Rank", zh: "\u6392\u540d" },
      customerEmail: { en: "Customer Email", zh: "\u5ba2\u6237\u90ae\u7bb1" },
      totalCostUSD: { en: "Total Cost (USD)", zh: "\u7d2f\u8ba1\u8d39\u7528 (USD)" },
      costShare: { en: "Cost Share", zh: "\u8d39\u7528\u5360\u6bd4" },
      noData: { en: "No usage data", zh: "\u6682\u65e0\u6d88\u8d39\u6570\u636e" },
      totalCustomers: { en: "Total customers", zh: "\u5171" },
      tokenIn: { en: "In", zh: "\u8f93\u5165" },
      tokenOut: { en: "Out", zh: "\u8f93\u51fa" }
    },
    admins: {
      title: { en: "Admin Management", zh: "\u7ba1\u7406\u5458\u7ba1\u7406" },
      desc: { en: "Manage admin accounts. Super admin has full permissions.", zh: "\u7ba1\u7406\u7cfb\u7edf\u7ba1\u7406\u5458\u8d26\u53f7\uff0c\u8d85\u7ea7\u7ba1\u7406\u5458\u62e5\u6709\u5168\u90e8\u6743\u9650\u3002" },
      list: { en: "Admin List", zh: "\u7ba1\u7406\u5458\u5217\u8868" },
      addAdmin: { en: "Add Admin", zh: "\u6dfb\u52a0\u7ba1\u7406\u5458" },
      name: { en: "Name", zh: "\u540d\u79f0" },
      email: { en: "Email", zh: "\u90ae\u7bb1" },
      role: { en: "Role", zh: "\u89d2\u8272" },
      superAdmin: { en: "Super Admin", zh: "\u8d85\u7ea7\u7ba1\u7406\u5458" },
      admin: { en: "Admin", zh: "\u7ba1\u7406\u5458" },
      lastLogin: { en: "Last Login", zh: "\u6700\u540e\u767b\u5f55" },
      createdAt: { en: "Created", zh: "\u521b\u5efa\u65f6\u95f4" },
      actions: { en: "Actions", zh: "\u64cd\u4f5f" },
      remove: { en: "Remove", zh: "\u79fb\u9664" },
      confirmRemove: { en: "Confirm remove admin?", zh: "\u786e\u5b9a\u79fb\u9664\u8be5\u7ba1\u7406\u5458\uff1f" },
      noAdmins: { en: "No admins", zh: "\u6682\u65e0\u7ba1\u7406\u5458" },
      adminEmail: { en: "Admin Email", zh: "\u7ba1\u7406\u5458\u90ae\u7bb1" },
      addEmailPlaceholder: { en: "admin@example.com", zh: "admin@example.com" },
      addingAdmin: { en: "Adding...", zh: "\u6dfb\u52a0\u4e2d..." },
      add: { en: "Add", zh: "\u6dfb\u52a0" },
      removing: { en: "Removing...", zh: "\u5220\u9664\u4e2d..." },
      active: { en: "Active", zh: "\u6709\u6548" },
      disabled: { en: "Disabled", zh: "\u5df2\u7981\u7528" }
    },
    login: {
      title: { en: "Admin Login", zh: "\u7ba1\u7406\u5458\u767b\u5f55" },
      enterEmail: { en: "Enter admin email", zh: "\u8f93\u5165\u7ba1\u7406\u5458\u90ae\u7bb1" },
      sendCode: { en: "Send Code", zh: "\u53d1\u9001\u9a8c\u8bc1\u7801" },
      enterCode: { en: "Enter 6-digit code", zh: "\u8f93\u51656\u4f4d\u9a8c\u8bc1\u7801" },
      login: { en: "Login", zh: "\u767b\u5f55" },
      resend: { en: "Resend", zh: "\u91cd\u65b0\u53d1\u9001" },
      codeSent: { en: "Code sent to", zh: "\u9a8c\u8bc1\u7801\u5df2\u53d1\u9001\u5230" },
      error: { en: "Error", zh: "\u9519\u8bef" },
      emailPlaceholder: { en: "admin@example.com", zh: "admin@example.com" },
      sending: { en: "Sending...", zh: "\u53d1\u9001\u4e2d..." },
      verifying: { en: "Verifying...", zh: "\u9a8c\u8bc1\u4e2d..." },
      enterFullCode: { en: "Please enter the complete 6-digit code", zh: "\u8bf7\u8f93\u5165\u5b8c\u6574\u76846\u4f4d\u9a8c\u8bc1\u7801" },
      changeEmail: { en: "Change email", zh: "\u66f4\u6362\u90ae\u7bb1" },
      resendCooldown: { en: "Resend in {n}s", zh: "{n}s \u540e\u91cd\u65b0\u53d1\u9001" },
      invalidEmail: { en: "Please enter a valid email address", zh: "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u90ae\u7bb1\u5730\u5740" },
      sendFailed: { en: "Failed to send code. Please try again later.", zh: "\u53d1\u9001\u9a8c\u8bc1\u7801\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5" },
      verifyFailed: { en: "Verification failed. Please try again.", zh: "\u9a8c\u8bc1\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5" },
      loginFailed: { en: "Login failed. Please try again.", zh: "\u767b\u5f55\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5" },
      processing: { en: "Processing...", zh: "\u5904\u7406\u4e2d..." },
      backToEmail: { en: "Back to re-enter email", zh: "\u8fd4\u56de\u91cd\u65b0\u8f93\u5165\u90ae\u7bb1" },
      authorizedOnly: { en: "Service for authorized admins only", zh: "\u4ec5\u4e3a\u6388\u6743\u7ba1\u7406\u5458\u63d0\u4f9b\u670d\u52a1" }
    }
  },
  downloads: {
    en: {
      pageTitle: "Your ClawLite Access",
      loggedInAs: "Logged in as {email}",
      goToDashboard: "Go to Dashboard →",
      section1Title: "Free Download Installer",
      section1Desc: "Download the latest ClawLite installer for macOS or Windows.",
      downloadMac: "Download macOS",
      downloadWin: "Download Windows",
      section2Title: "Backup Skills",
      section2Desc: "Get the soul-backup-skill to protect configs and make recovery easier.",
      openBackupSkills: "Open Backup Skills",
      checkingLogin: "Checking login status...",
      apiKey: {
        titleWithKey: "Your ClawLite API Key",
        titleWithoutKey: "Get Your ClawLite API Key",
        descWithKey: "Use this key to authenticate your installer and route AI requests through ClawRouter.",
        descWithoutKey: "Generate your personal API key to activate the installer after purchase.",
        generate: "Generate API Key",
        generating: "Generating...",
        show: "Show",
        revealing: "Revealing...",
        hide: "Hide",
        copyKey: "Copy Key",
        copied: "Copied",
        copy: "Copy",
        regenerate: "Regenerate",
        regenerating: "Regenerating...",
        saveOnce: "Save this key — it's shown only once.",
        hintHasEncrypted: "Click Show to reveal your full key.",
        hintNoEncrypted: "Full key only shown on first creation. Regenerate to get a new key.",
        created: "Created {date}",
        loadError: "Failed to load API key.",
        generateError: "Failed to generate key. Please try again.",
        revealError: "Failed to reveal key. Please try again.",
        copyError: "Failed to copy key. Please try selecting the text manually.",
        confirmRegenerate: "This will deactivate your current key and create a new one. Continue?",
        oldKeyError: "This key was created before the reveal feature was enabled. Please regenerate the key.",
      }
    },
    zh: {
      pageTitle: "你的 ClawLite 访问权限",
      loggedInAs: "登录账号：{email}",
      goToDashboard: "前往控制台 →",
      section1Title: "免费下载安装程序",
      section1Desc: "下载适用于 macOS 或 Windows 的最新 ClawLite 安装程序。",
      downloadMac: "下载 macOS 版",
      downloadWin: "下载 Windows 版",
      section2Title: "备份技能",
      section2Desc: "获取 soul-backup-skill，保护配置并轻松恢复。",
      openBackupSkills: "打开备份技能",
      checkingLogin: "正在检查登录状态...",
      apiKey: {
        titleWithKey: "你的 ClawLite API 密钥",
        titleWithoutKey: "获取你的 ClawLite API 密钥",
        descWithKey: "使用此密钥认证你的安装程序并通过 ClawRouter 路由 AI 请求。",
        descWithoutKey: "生成个人 API 密钥以便在购买后激活安装程序。",
        generate: "生成 API 密钥",
        generating: "生成中...",
        show: "显示",
        revealing: "显示中...",
        hide: "隐藏",
        copyKey: "复制密钥",
        copied: "已复制",
        copy: "复制",
        regenerate: "重新生成",
        regenerating: "重新生成中...",
        saveOnce: "保存此密钥——它只显示一次。",
        hintHasEncrypted: "点击显示以查看完整密钥。",
        hintNoEncrypted: "完整密钥仅在首次创建时显示。请重新生成以获取新密钥。",
        created: "创建于 {date}",
        loadError: "加载 API 密钥失败。",
        generateError: "生成密钥失败，请重试。",
        revealError: "显示密钥失败，请重试。",
        copyError: "复制密钥失败，请手动选择文本。",
        confirmRegenerate: "这将停用当前密钥并创建新密钥。是否继续？",
        oldKeyError: "此密钥是在显示功能启用之前创建的。请重新生成密钥。",
      }
    },
    es: {
      pageTitle: "Tu Acceso a ClawLite",
      loggedInAs: "Conectado como {email}",
      goToDashboard: "Ir al Panel →",
      section1Title: "Descarga Gratuita del Instalador",
      section1Desc: "Descarga el último instalador de ClawLite para macOS o Windows.",
      downloadMac: "Descargar para macOS",
      downloadWin: "Descargar para Windows",
      section2Title: "Skills de Respaldo",
      section2Desc: "Obtén soul-backup-skill para proteger configuraciones y facilitar la recuperación.",
      openBackupSkills: "Abrir Skills de Respaldo",
      checkingLogin: "Verificando estado de sesión...",
      apiKey: {
        titleWithKey: "Tu Clave API de ClawLite",
        titleWithoutKey: "Obtén tu Clave API de ClawLite",
        descWithKey: "Usa esta clave para autenticar tu instalador y enrutar solicitudes de IA a través de ClawRouter.",
        descWithoutKey: "Genera tu clave API personal para activar el instalador después de la compra.",
        generate: "Generar Clave API",
        generating: "Generando...",
        show: "Mostrar",
        revealing: "Mostrando...",
        hide: "Ocultar",
        copyKey: "Copiar Clave",
        copied: "Copiado",
        copy: "Copiar",
        regenerate: "Regenerar",
        regenerating: "Regenerando...",
        saveOnce: "Guarda esta clave — solo se muestra una vez.",
        hintHasEncrypted: "Haz clic en Mostrar para revelar tu clave completa.",
        hintNoEncrypted: "La clave completa solo se muestra en la primera creación. Regenera para obtener una nueva.",
        created: "Creada {date}",
        loadError: "Error al cargar la clave API.",
        generateError: "Error al generar la clave. Inténtalo de nuevo.",
        revealError: "Error al revelar la clave. Inténtalo de nuevo.",
        copyError: "Error al copiar la clave. Selecciona el texto manualmente.",
        confirmRegenerate: "Esto desactivará tu clave actual y creará una nueva. ¿Continuar?",
        oldKeyError: "Esta clave fue creada antes de que se habilitara la función de revelar. Regenera la clave.",
      }
    },
    ja: {
      pageTitle: "ClawLite アクセス",
      loggedInAs: "ログイン中: {email}",
      goToDashboard: "ダッシュボードへ →",
      section1Title: "（無料）インストーダウンロード",
      section1Desc: "macOS または Windows 用の最新 ClawLite インストーダーをダウンロード。",
      downloadMac: "macOS 版をダウンロード",
      downloadWin: "Windows 版をダウンロード",
      section2Title: "バックアップスキル",
      section2Desc: "soul-backup-skill で構成を保護し、復元を容易にします。",
      openBackupSkills: "バックアップスキルを開く",
      checkingLogin: "ログイン状態を確認中...",
      apiKey: {
        titleWithKey: "ClawLite API キー",
        titleWithoutKey: "ClawLite API キーを取得",
        descWithKey: "このキーでインストーダーを認証し、ClawRouter 経由で AI リクエストをルーティングします。",
        descWithoutKey: "購入後にインストーダーを激活する個人 API キーを生成します。",
        generate: "API キーを生成",
        generating: "生成中...",
        show: "表示",
        revealing: "表示中...",
        hide: "非表示",
        copyKey: "キーをコピー",
        copied: "コピー済み",
        copy: "コピー",
        regenerate: "再生成",
        regenerating: "再生成中...",
        saveOnce: "このキーは一度しか表示されません。今すぐ保存してください。",
        hintHasEncrypted: "表示をクリックして完全なキーを表示します。",
        hintNoEncrypted: "完全なキーは初回作成時のみ表示されます。新しいキーを取得するには再生成してください。",
        created: "作成日: {date}",
        loadError: "API キーの読み込みに失敗しました。",
        generateError: "キーの生成に失敗しました。もう一度お試しください。",
        revealError: "キーの表示に失敗しました。もう一度お試しください。",
        copyError: "キーのコピーに失敗しました。手動でテキストを選択してください。",
        confirmRegenerate: "現在のキーを無効化して新しいキーを作成します。続行しますか？",
        oldKeyError: "このキーは表示機能有効前に作成されました。キーを再生成してください。",
      }
    },
    ko: {
      pageTitle: "ClawLite 액세스",
      loggedInAs: "로그인: {email}",
      goToDashboard: "대시보드로 이동 →",
      section1Title: "무료 설치 프로그램 다운로드",
      section1Desc: "macOS 또는 Windows용 최신 ClawLite 설치 프로그램을 다운로드하세요.",
      downloadMac: "macOS용 다운로드",
      downloadWin: "Windows용 다운로드",
      section2Title: "백업 스킬",
      section2Desc: "soul-backup-skill으로 구성을 보호하고 복구를 쉽게 만드세요.",
      openBackupSkills: "백업 스킬 열기",
      checkingLogin: "로그인 상태 확인 중...",
      apiKey: {
        titleWithKey: "ClawLite API 키",
        titleWithoutKey: "ClawLite API 키 가져오기",
        descWithKey: "이 키를 사용하여 설치 프로그램을 인증하고 ClawRouter를 통해 AI 요청을 라우팅합니다.",
        descWithoutKey: "구매 후 설치 프로그램을 활성화할 개인 API 키를 생성합니다.",
        generate: "API 키 생성",
        generating: "생성 중...",
        show: "표시",
        revealing: "표시 중...",
        hide: "숨기기",
        copyKey: "키 복사",
        copied: "복사됨",
        copy: "복사",
        regenerate: "재生成",
        regenerating: "재생성 중...",
        saveOnce: "이 키는 한 번만 표시됩니다. 지금 저장하세요.",
        hintHasEncrypted: "표시를 클릭하여 전체 키를 표시하세요.",
        hintNoEncrypted: "전체 키는 첫 생성 시에만 표시됩니다. 새 키를 获取하려면 재생성하세요.",
        created: "생성일: {date}",
        loadError: "API 키를 불러오지 못했습니다.",
        generateError: "키 생성에 실패했습니다. 다시 시도하세요.",
        revealError: "키 표시에 실패했습니다. 다시 시도하세요.",
        copyError: "키 복사에 실패했습니다. 텍스트를 수동으로 선택하세요.",
        confirmRegenerate: "현재 키를 비활성화하고 새 키를 생성합니다. 계속하시겠습니까?",
        oldKeyError: "이 키는 표시 기능이 활성화되기 전에 생성되었습니다. 키를 재생성하세요.",
      }
    },
  },
  dashboard: {
    en: {
      nav: {
        dashboard: "Dashboard",
        apiKeys: "API Keys",
        quickStart: "Quick Start",
        models: "Models",
        usage: "Usage",
        transactions: "Transactions",
        affiliate: "Affiliate",
        profile: "Profile"
      },
      common: {
        dashboard: "Dashboard",
        clawRouter: "ClawRouter",
        accountFallback: "account",
        quickActions: "Quick actions",
        addCredits: "Add Credits",
        topUp: "Top Up",
        apiDocs: "API Docs",
        viewAll: "View all",
        backToDashboard: "Back to Dashboard",
        backToSalesPage: "Back to sales page",
        credits: "Credits",
        loadingDashboard: "Loading ClawRouter dashboard...",
        loadingTransactions: "Loading transactions...",
        loadingAddCredits: "Loading add credits...",
        loadingTransactionsTable: "Loading transactions...",
        statusActive: "Active",
        statusCompleted: "Completed",
        statusPending: "Pending",
        statusFailed: "Failed",
        statusProcessing: "Processing",
        statusReleased: "Released",
        statusFrozen: "Frozen",
        dateFrom: "From",
        dateTo: "To",
        apply: "Apply",
        today: "Today",
        thisWeek: "This Week",
        thisMonth: "This Month",
        allTime: "All Time",
        never: "Never"
      },
      page: {
        title: "ClawRouter Dashboard",
        subtitle:
          "This is the logged-in surface after checkout: add credits, manage your ClawLite API key, inspect available models, and track spend and usage in one place.",
        welcomeBack: "Welcome back",
        yourAccount: "Your Account",
        quickActionsHint: "Your ClawLite API key appears in the card below after your first eligible purchase.",
        topupSuccessTitle: "Credits added successfully",
        topupSuccessBody:
          "Stripe checkout returned successfully{amount}. If the balance below hasn't updated yet, refresh once after the webhook settles.",
        topupSuccessAmount: " for {amount}",
        usageByModelTitle: "Usage by Model",
        usageByModelSubtitle: "Breakdown appears here once requests start flowing through ClawRouter.",
        usageByProviderTitle: "Usage by Provider",
        usageByProviderSubtitle: "Provider mix, spend share, and routing distribution will render here.",
        modelsLabel: "Models",
        modelsTitle: "Available lanes",
        modelRows: [
          { model: "clawrouter/auto", provider: "Managed route", status: "Default" },
          { model: "Claude / GPT / Gemini class", provider: "Provider-routed", status: "Available" },
          { model: "BYOK fallback", provider: "Manual provider path", status: "Optional" }
        ],
        topupHistoryTitle: "Top-up History",
        noTopupsYet: "No completed top-ups yet.",
        recentRequestsTitle: "Recent requests",
        recentRequestsEmpty: "No requests yet",
        recentRequestsHeaders: {
          time: "Time",
          model: "Model",
          key: "Key",
          cost: "Cost"
        }
      },
      balance: {
        totalBalance: "Total Balance",
        totalBalanceDescription: "Account total before deductions",
        available: "Available",
        availableDescription: "Spendable balance for API requests",
        frozen: "Frozen",
        frozenDescription: "Processing requests (will be deducted)",
        total: "Total"
      },
      summary: {
        totalSpent: "Total Spent",
        totalSpentNote: "All-time spend across ClawRouter",
        today: "Today",
        todayNote: "Current-day cost",
        totalTokens: "Total Tokens",
        totalTokensNote: "Input + output tokens so far",
        avgCostPerRequest: "Avg Cost / Req",
        avgCostPerRequestNote: "Cost efficiency will appear here",
        apiKeys: "API Keys",
        apiKeysNote: "Active ClawLite API keys on this account",
        totalRequests: "Total Requests",
        lastRequest: "Last Request",
        cost: "Cost"
      },
      apiKey: {
        label: "My API Key",
        title: "ClawRouter API Key",
        empty: "You don't have an API key yet.",
        generate: "Generate Key",
        generating: "Generating...",
        regenerate: "Regenerate Key",
        regenerating: "Regenerating...",
        copy: "Copy",
        copyKey: "Copy Key",
        copied: "Copied",
        saveOnce: "Save this key — it's shown only once.",
        shownOnlyOnce: "API Key is shown only once. Save it now.",
        generatedNotice: "Your key has been generated",
        noFullKey: "The full key is no longer available in this session. Regenerate to reveal a new key and copy it again.",
        created: "Created {date}",
        connectError: "Unable to connect to authentication.",
        sessionError: "Unable to load your session.",
        loadError: "Failed to load API key.",
        generateError: "Failed to generate key. Please try again.",
        copyError: "Failed to copy key.",
        confirmRegenerate: "This will deactivate your current key and create a new one. Continue?",
        statusActive: "Active",
        statusDisabled: "Disabled"
      },
      alert: {
        lowBalanceTitle: "Low Balance Alert",
        lowBalanceMessage: "Your balance is low. Top up now to continue using ClawRouter.",
        criticalTitle: "Balance critically low",
        criticalMessage:
          "Your available balance ({amount}) is insufficient for API requests. Please add credits immediately to avoid service interruption.",
        warningTitle: "Balance running low",
        warningMessage:
          "Your available balance ({amount}) is below {threshold}. Consider adding credits soon to ensure uninterrupted service.",
        frozenHint: "{amount} is being processed for pending requests and will be deducted shortly.",
        addCredits: "Top up now",
        dismiss: "Dismiss"
      },
      transactionsPage: {
        title: "Transaction History",
        subtitle: "View all your account balance transactions including recharges, charges, and refunds.",
        balance: "Balance: {amount}"
      },
      transactionTable: {
        title: "Transaction History",
        allKeys: "All Keys",
        allTypes: "All Types",
        dateRange7d: "7 days",
        dateRange30d: "30 days",
        dateRange90d: "90 days",
        dateRangeCustom: "Custom",
        exportCsv: "Export CSV",
        exporting: "Exporting...",
        time: "Time",
        type: "Type",
        amount: "Amount",
        balance: "Balance",
        status: "Status",
        description: "Description",
        noTransactions: "No transactions yet",
        noTransactionsFound: "No transactions found",
        loadMore: "Load More",
        showing: "Showing {start} - {end} of {total}",
        filters: {
          recharge: "Recharge",
          charge: "Usage",
          refund: "Refund",
          freeze: "Freeze"
        },
        statuses: {
          frozen: "Processing",
          completed: "Completed",
          released: "Released",
          pending: "Pending",
          failed: "Failed"
        }
      },
      addCreditsPage: {
        title: "Add Credits",
        subtitle:
          "Select a top-up amount to add credits to your ClawRouter account. Credits never expire and can be used for API requests across all supported models.",
        selectAmount: "Select Amount",
        selectTopupAmount: "Select a top-up amount",
        creditsNeverExpire: "Credits never expire",
        bestValue: "Best Value",
        promoCodeOptional: "Promo Code (Optional)",
        enterPromoCode: "Enter promo code",
        validating: "Validating...",
        originalAmount: "Original amount",
        discount: "Discount",
        bonusCredits: "Bonus credits",
        finalAmount: "Final amount",
        payWithStripe: "Pay {amount} with Stripe",
        openingStripe: "Opening Stripe...",
        securePayment: "Secure payment via Stripe. Credits never expire.",
        invalidPromoCode: "Invalid promo code",
        validateError: "Failed to validate promo code. Please try again.",
        signInAgain: "Please sign in again.",
        checkoutError: "Could not create Stripe checkout session."
      },
      apiKeysPage: {
        title: "API Keys",
        subtitle: "Create and manage your ClawRouter API keys.",
        table: { name: "Name", prefix: "Prefix", status: "Status", createdAt: "Created", actions: "Actions" },
        status: { active: "Active", revoked: "Revoked", inactive: "Inactive" },
        buttons: { createNew: "Create New Key", show: "Show", copy: "Copy", copied: "Copied", reveal: "Reveal", revealing: "Revealing...", regenerate: "Regenerate", regenerating: "Regenerating...", delete: "Delete", deleting: "Deleting..." },
        createModal: { title: "Create New API Key", namePlaceholder: "My API Key", create: "Create", creating: "Creating...", cancel: "Cancel" },
        confirmDelete: "Are you sure you want to delete this API key? This action cannot be undone.",
        confirmRegenerate: "This will deactivate your current key and create a new one. Continue?",
        noKeys: "No API keys yet. Create your first key to get started.",
        errors: { load: "Failed to load API keys.", create: "Failed to create key. Please try again.", delete: "Failed to delete key. Please try again.", regenerate: "Failed to regenerate key. Please try again.", reveal: "Failed to reveal key. Please try again.", copy: "Failed to copy key." },
        savedKeyNotice: "Save this key — it's shown only once."
      },
      quickStartPage: {
        title: "Quick Start",
        subtitle: "Get up and running with ClawRouter in a few minutes.",
        steps: {
          download: { title: "Download the Installer", description: "Download the ClawLite installer for your operating system.", actionLabel: "Download for {os}", actionHref: "/downloads" },
          apiKey: { title: "Configure Your API Key", description: "Set up your ClawRouter API key to authenticate requests.", actionLabel: "Go to API Keys", actionHref: "/clawrouter/dashboard/api-keys" },
          channel: { title: "Configure a Channel", description: "Connect a channel like Telegram or Web Chat to receive messages.", actionLabel: "View Channel Docs", actionHref: "/clawrouter/docs/channels" },
          firstMessage: { title: "Send Your First Message", description: "Once everything is set up, send your first message through your channel.", actionLabel: "Open Dashboard", actionHref: "/clawrouter/dashboard" }
        },
        completed: "Completed",
        current: "Current step"
      },
      modelsPage: {
        title: "Available Models",
        subtitle: "All models available through ClawRouter. Your entitlements determine access.",
        providers: { openai: "OpenAI", anthropic: "Anthropic", minimax: "MiniMax", google: "Google" },
        input: "Input",
        output: "Output",
        per1m: "/ 1M tokens",
        available: "Available",
        unavailable: "No access",
        loadingModels: "Loading models...",
        loadError: "Failed to load models.",
        noModels: "No models available."
      },
      affiliatePage: {
        title: "Referral Program",
        subtitle: "Earn commissions by referring new users to ClawRouter.",
        referralCode: "Your Referral Code",
        copyCode: "Copy Code",
        copied: "Copied!",
        stats: { referredUsers: "Referred Users", earnedCommission: "Earned Commission", pendingCommission: "Pending Commission" },
        claim: "Claim Commission",
        claiming: "Claiming...",
        claimSuccess: "Commission claimed successfully.",
        claimError: "Failed to claim commission.",
        records: { title: "Referral Records", time: "Time", referredUser: "Referred User", status: "Status", amount: "Amount", noRecords: "No referral records yet." },
        statuses: { pending: "Pending", approved: "Approved", paid: "Paid", rejected: "Rejected" },
        loadError: "Failed to load affiliate data."
      },
      profilePage: {
        title: "Account Settings",
        subtitle: "Manage your account information and preferences.",
        basicInfo: "Basic Information",
        email: "Email",
        accountId: "Account ID",
        registeredAt: "Registered",
        displayName: "Display Name",
        displayNamePlaceholder: "Enter your display name",
        updateDisplayName: "Update",
        updating: "Updating...",
        updateSuccess: "Display name updated.",
        updateError: "Failed to update display name.",
        dangerZone: "Danger Zone",
        deleteAccount: "Delete Account",
        deleteAccountDesc: "Permanently delete your account and all associated data. This action cannot be undone.",
        confirmDeleteTitle: "Confirm Account Deletion?",
        confirmDeleteBody: "This will permanently delete your account, all API keys, and all usage data. This action cannot be undone. Type DELETE to confirm.",
        deleteInputPlaceholder: "Type DELETE to confirm",
        deleteAccountBtn: "Delete My Account",
        deleting: "Deleting...",
        deleteSuccess: "Account deleted.",
        deleteError: "Failed to delete account.",
        loadError: "Failed to load account info."
      }
    },
    zh: {
      nav: {
        dashboard: "控制台",
        apiKeys: "API 密钥",
        quickStart: "快速开始",
        models: "模型",
        usage: "用量",
        transactions: "交易记录",
        affiliate: "联盟",
        profile: "个人资料"
      },
      common: {
        dashboard: "控制台",
        clawRouter: "ClawRouter",
        accountFallback: "账户",
        quickActions: "快捷操作",
        addCredits: "充值",
        topUp: "充值",
        apiDocs: "API 文档",
        viewAll: "查看全部",
        backToDashboard: "返回控制台",
        backToSalesPage: "返回销售页",
        credits: "额度",
        loadingDashboard: "正在加载 ClawRouter 控制台...",
        loadingTransactions: "正在加载交易记录...",
        loadingAddCredits: "正在加载充值页面...",
        loadingTransactionsTable: "正在加载交易记录...",
        statusActive: "有效",
        statusCompleted: "已完成",
        statusPending: "处理中",
        statusFailed: "失败",
        statusProcessing: "处理中",
        statusReleased: "已释放",
        statusFrozen: "冻结中",
        dateFrom: "从",
        dateTo: "至",
        apply: "应用",
        today: "今天",
        thisWeek: "本周",
        thisMonth: "本月",
        allTime: "全部时间",
        never: "从未"
      },
      page: {
        title: "ClawRouter 控制台",
        subtitle: "这是登录后的工作台：可在此充值、管理 ClawLite API 密钥、查看可用模型，并统一跟踪消费与用量。",
        welcomeBack: "欢迎回来",
        yourAccount: "你的账户",
        quickActionsHint: "完成首次符合条件的购买后，你的 ClawLite API 密钥会显示在下方卡片中。",
        topupSuccessTitle: "充值成功",
        topupSuccessBody: "Stripe 结账已成功返回{amount}。如果下方余额尚未更新，请在 webhook 完成后刷新一次。",
        topupSuccessAmount: "，金额为 {amount}",
        usageByModelTitle: "按模型统计用量",
        usageByModelSubtitle: "当请求开始通过 ClawRouter 流转后，这里会显示详细拆分。",
        usageByProviderTitle: "按提供商统计用量",
        usageByProviderSubtitle: "这里将展示提供商占比、支出份额与路由分布。",
        modelsLabel: "模型",
        modelsTitle: "可用通道",
        modelRows: [
          { model: "clawrouter/auto", provider: "托管路由", status: "默认" },
          { model: "Claude / GPT / Gemini 类", provider: "按提供商路由", status: "可用" },
          { model: "BYOK 兜底", provider: "手动提供商路径", status: "可选" }
        ],
        topupHistoryTitle: "充值记录",
        noTopupsYet: "暂无已完成充值。",
        recentRequestsTitle: "最近请求",
        recentRequestsEmpty: "暂无请求",
        recentRequestsHeaders: {
          time: "时间",
          model: "模型",
          key: "密钥",
          cost: "费用"
        }
      },
      balance: {
        totalBalance: "总余额",
        totalBalanceDescription: "扣减前的账户总额",
        available: "可用",
        availableDescription: "可用于 API 请求的余额",
        frozen: "冻结",
        frozenDescription: "正在处理中的请求（稍后扣减）",
        total: "总计"
      },
      summary: {
        totalSpent: "累计消费",
        totalSpentNote: "ClawRouter 全部历史支出",
        today: "今日",
        todayNote: "当天成本",
        totalTokens: "总 Token",
        totalTokensNote: "截至目前的输入与输出 Token 总和",
        avgCostPerRequest: "单次请求均价",
        avgCostPerRequestNote: "这里会显示成本效率",
        apiKeys: "API 密钥",
        apiKeysNote: "该账户当前有效的 ClawLite API 密钥数量",
        totalRequests: "总请求数",
        lastRequest: "最后一次请求",
        cost: "费用"
      },
      apiKey: {
        label: "我的 API 密钥",
        title: "ClawRouter API 密钥",
        empty: "你还没有 API 密钥。",
        generate: "生成密钥",
        generating: "生成中...",
        regenerate: "重新生成密钥",
        regenerating: "重新生成中...",
        copy: "复制",
        copyKey: "复制密钥",
        copied: "已复制",
        saveOnce: "请保存此密钥，它只会显示一次。",
        shownOnlyOnce: "API 密钥只显示一次，请立即保存。",
        generatedNotice: "你的密钥已生成",
        noFullKey: "当前会话中已无法再次查看完整密钥。请重新生成新密钥后再复制。",
        created: "创建于 {date}",
        connectError: "无法连接身份验证服务。",
        sessionError: "无法加载你的会话。",
        loadError: "加载 API 密钥失败。",
        generateError: "生成密钥失败，请重试。",
        copyError: "复制密钥失败。",
        confirmRegenerate: "这将停用当前密钥并创建新密钥。是否继续？",
        statusActive: "有效",
        statusDisabled: "已禁用"
      },
      alert: {
        lowBalanceTitle: "低余额提醒",
        lowBalanceMessage: "你的余额较低。请立即充值以继续使用 ClawRouter。",
        criticalTitle: "余额严重不足",
        criticalMessage: "你的可用余额（{amount}）不足以发起 API 请求。请立即充值以避免服务中断。",
        warningTitle: "余额即将不足",
        warningMessage: "你的可用余额（{amount}）已低于 {threshold}。建议尽快充值以避免服务中断。",
        frozenHint: "{amount} 正在用于处理待完成请求，稍后会被扣除。",
        addCredits: "立即充值",
        dismiss: "关闭"
      },
      transactionsPage: {
        title: "交易记录",
        subtitle: "查看账户余额相关的全部交易记录，包括充值、扣费和退款。",
        balance: "余额：{amount}"
      },
      transactionTable: {
        title: "交易记录",
        allKeys: "全部密钥",
        allTypes: "全部类型",
        dateRange7d: "7 天",
        dateRange30d: "30 天",
        dateRange90d: "90 天",
        dateRangeCustom: "自定义",
        exportCsv: "导出 CSV",
        exporting: "导出中...",
        time: "时间",
        type: "类型",
        amount: "金额",
        balance: "余额",
        status: "状态",
        description: "说明",
        noTransactions: "暂无交易记录",
        noTransactionsFound: "未找到交易记录",
        loadMore: "加载更多",
        showing: "显示 {start} - {end} / 共 {total}",
        filters: {
          recharge: "充值",
          charge: "用量",
          refund: "退款",
          freeze: "冻结"
        },
        statuses: {
          frozen: "处理中",
          completed: "已完成",
          released: "已释放",
          pending: "待处理",
          failed: "失败"
        }
      },
      addCreditsPage: {
        title: "充值",
        subtitle: "选择充值金额为你的 ClawRouter 账户添加额度。额度永不过期，可用于所有支持模型的 API 请求。",
        selectAmount: "选择金额",
        selectTopupAmount: "选择充值金额",
        creditsNeverExpire: "额度永不过期",
        bestValue: "最划算",
        promoCodeOptional: "优惠码（可选）",
        enterPromoCode: "输入优惠码",
        validating: "校验中...",
        originalAmount: "原始金额",
        discount: "优惠",
        bonusCredits: "赠送额度",
        finalAmount: "最终金额",
        payWithStripe: "使用 Stripe 支付 {amount}",
        openingStripe: "正在打开 Stripe...",
        securePayment: "通过 Stripe 安全支付。额度永不过期。",
        invalidPromoCode: "优惠码无效",
        validateError: "优惠码校验失败，请重试。",
        signInAgain: "请重新登录。",
        checkoutError: "无法创建 Stripe 结账会话。"
      },
      apiKeysPage: {
        title: "API 密钥",
        subtitle: "创建和管理你的 ClawRouter API 密钥。",
        table: { name: "名称", prefix: "前缀", status: "状态", createdAt: "创建时间", actions: "操作" },
        status: { active: "有效", revoked: "已撤销", inactive: "未激活" },
        buttons: { createNew: "创建新密钥", show: "显示", copy: "复制", copied: "已复制", reveal: "显示密钥", revealing: "显示中...", regenerate: "重新生成", regenerating: "重新生成中...", delete: "删除", deleting: "删除中..." },
        createModal: { title: "创建新 API 密钥", namePlaceholder: "我的 API 密钥", create: "创建", creating: "创建中...", cancel: "取消" },
        confirmDelete: "确定要删除此 API 密钥吗？此操作无法撤销。",
        confirmRegenerate: "这将停用当前密钥并创建新密钥。是否继续？",
        noKeys: "暂无 API 密钥。创建你的第一个密钥开始使用。",
        errors: { load: "加载 API 密钥失败。", create: "创建密钥失败，请重试。", delete: "删除密钥失败，请重试。", regenerate: "重新生成密钥失败，请重试。", reveal: "显示密钥失败，请重试。", copy: "复制密钥失败。" },
        savedKeyNotice: "请保存此密钥，它只会显示一次。"
      },
      quickStartPage: {
        title: "快速开始",
        subtitle: "在几分钟内启动并运行 ClawRouter。",
        steps: {
          download: { title: "下载安装程序", description: "下载适用于你操作系统的 ClawLite 安装程序。", actionLabel: "下载 {os} 版本", actionHref: "/downloads" },
          apiKey: { title: "配置 API 密钥", description: "设置你的 ClawRouter API 密钥以验证请求。", actionLabel: "前往 API 密钥", actionHref: "/clawrouter/dashboard/api-keys" },
          channel: { title: "配置频道", description: "连接 Telegram 或网页聊天等频道以接收消息。", actionLabel: "查看频道文档", actionHref: "/clawrouter/docs/channels" },
          firstMessage: { title: "发送第一条消息", description: "设置完成后，通过你的频道发送第一条消息。", actionLabel: "打开控制台", actionHref: "/clawrouter/dashboard" }
        },
        completed: "已完成",
        current: "当前步骤"
      },
      modelsPage: {
        title: "可用模型",
        subtitle: "ClawRouter 支持的所有模型。你的权益决定访问权限。",
        providers: { openai: "OpenAI", anthropic: "Anthropic", minimax: "MiniMax", google: "Google" },
        input: "输入",
        output: "输出",
        per1m: "/ 100万 token",
        available: "可用",
        unavailable: "无权限",
        loadingModels: "正在加载模型...",
        loadError: "加载模型失败。",
        noModels: "暂无可用模型。"
      },
      affiliatePage: {
        title: "推荐计划",
        subtitle: "通过向新用户推荐 ClawRouter 来赚取佣金。",
        referralCode: "你的推荐码",
        copyCode: "复制代码",
        copied: "已复制！",
        stats: { referredUsers: "推荐用户", earnedCommission: "已赚佣金", pendingCommission: "待结算佣金" },
        claim: "领取佣金",
        claiming: "领取中...",
        claimSuccess: "佣金领取成功。",
        claimError: "领取佣金失败。",
        records: { title: "推荐记录", time: "时间", referredUser: "被推荐用户", status: "状态", amount: "金额", noRecords: "暂无推荐记录。" },
        statuses: { pending: "待处理", approved: "已批准", paid: "已支付", rejected: "已拒绝" },
        loadError: "加载推荐数据失败。"
      },
      profilePage: {
        title: "账户设置",
        subtitle: "管理你的账户信息和偏好设置。",
        basicInfo: "基本信息",
        email: "邮箱",
        accountId: "账户 ID",
        registeredAt: "注册时间",
        displayName: "显示名称",
        displayNamePlaceholder: "输入你的显示名称",
        updateDisplayName: "更新",
        updating: "更新中...",
        updateSuccess: "显示名称已更新。",
        updateError: "更新显示名称失败。",
        dangerZone: "危险区域",
        deleteAccount: "删除账户",
        deleteAccountDesc: "永久删除你的账户及所有相关数据。此操作无法撤销。",
        confirmDeleteTitle: "确认删除账户？",
        confirmDeleteBody: "这将永久删除你的账户、所有 API 密钥和所有使用数据。此操作无法撤销。请输入 DELETE 确认。",
        deleteInputPlaceholder: "输入 DELETE 确认",
        deleteAccountBtn: "删除我的账户",
        deleting: "删除中...",
        deleteSuccess: "账户已删除。",
        deleteError: "删除账户失败。",
        loadError: "加载账户信息失败。"
      },
    },
    es: {
      nav: {
        dashboard: "Panel",
        apiKeys: "Claves API",
        quickStart: "Inicio rápido",
        models: "Modelos",
        usage: "Uso",
        transactions: "Transacciones",
        affiliate: "Afiliados",
        profile: "Perfil"
      },
      common: {
        dashboard: "Panel",
        clawRouter: "ClawRouter",
        accountFallback: "cuenta",
        quickActions: "Acciones rápidas",
        addCredits: "Agregar créditos",
        topUp: "Recargar",
        apiDocs: "Docs API",
        viewAll: "Ver todo",
        backToDashboard: "Volver al panel",
        backToSalesPage: "Volver a la página comercial",
        credits: "Créditos",
        loadingDashboard: "Cargando el panel de ClawRouter...",
        loadingTransactions: "Cargando transacciones...",
        loadingAddCredits: "Cargando la página de créditos...",
        loadingTransactionsTable: "Cargando transacciones...",
        statusActive: "Activo",
        statusCompleted: "Completado",
        statusPending: "Pendiente",
        statusFailed: "Fallido",
        statusProcessing: "Procesando",
        statusReleased: "Liberado",
        statusFrozen: "Congelado",
        dateFrom: "Desde",
        dateTo: "Hasta",
        apply: "Aplicar",
        today: "Hoy",
        thisWeek: "Esta semana",
        thisMonth: "Este mes",
        allTime: "Todo el tiempo",
        never: "Nunca"
      },
      page: {
        title: "Panel de ClawRouter",
        subtitle:
          "Esta es la superficie para usuarios con sesión iniciada: agrega créditos, administra tu clave API de ClawLite, revisa los modelos disponibles y sigue el gasto y el uso en un solo lugar.",
        welcomeBack: "Bienvenido de nuevo",
        yourAccount: "Tu cuenta",
        quickActionsHint: "Tu clave API de ClawLite aparecerá en la tarjeta de abajo después de tu primera compra válida.",
        topupSuccessTitle: "Créditos agregados correctamente",
        topupSuccessBody:
          "El checkout de Stripe volvió correctamente{amount}. Si el saldo de abajo aún no se actualiza, refresca una vez cuando termine el webhook.",
        topupSuccessAmount: " por {amount}",
        usageByModelTitle: "Uso por modelo",
        usageByModelSubtitle: "El desglose aparecerá aquí cuando las solicitudes empiecen a pasar por ClawRouter.",
        usageByProviderTitle: "Uso por proveedor",
        usageByProviderSubtitle: "Aquí se mostrará la mezcla de proveedores, la participación del gasto y la distribución del enrutamiento.",
        modelsLabel: "Modelos",
        modelsTitle: "Canales disponibles",
        modelRows: [
          { model: "clawrouter/auto", provider: "Ruta gestionada", status: "Predeterminado" },
          { model: "Clase Claude / GPT / Gemini", provider: "Enrutado por proveedor", status: "Disponible" },
          { model: "Respaldo BYOK", provider: "Ruta manual del proveedor", status: "Opcional" }
        ],
        topupHistoryTitle: "Historial de recargas",
        noTopupsYet: "Aún no hay recargas completadas.",
        recentRequestsTitle: "Solicitudes recientes",
        recentRequestsEmpty: "Aún no hay solicitudes",
        recentRequestsHeaders: {
          time: "Hora",
          model: "Modelo",
          key: "Clave",
          cost: "Costo"
        }
      },
      balance: {
        totalBalance: "Saldo total",
        totalBalanceDescription: "Total de la cuenta antes de deducciones",
        available: "Disponible",
        availableDescription: "Saldo utilizable para solicitudes API",
        frozen: "Congelado",
        frozenDescription: "Solicitudes en proceso (se descontarán)",
        total: "Total"
      },
      summary: {
        totalSpent: "Gasto total",
        totalSpentNote: "Gasto histórico en ClawRouter",
        today: "Hoy",
        todayNote: "Costo del día actual",
        totalTokens: "Tokens totales",
        totalTokensNote: "Tokens de entrada y salida hasta ahora",
        avgCostPerRequest: "Costo prom. / solicitud",
        avgCostPerRequestNote: "La eficiencia de costo aparecerá aquí",
        apiKeys: "Claves API",
        apiKeysNote: "Claves API activas de ClawLite en esta cuenta",
        totalRequests: "Solicitudes totales",
        lastRequest: "Última solicitud",
        cost: "Costo"
      },
      apiKey: {
        label: "Mi clave API",
        title: "Clave API de ClawRouter",
        empty: "Todavía no tienes una clave API.",
        generate: "Generar clave",
        generating: "Generando...",
        regenerate: "Regenerar clave",
        regenerating: "Regenerando...",
        copy: "Copiar",
        copyKey: "Copiar clave",
        copied: "Copiado",
        saveOnce: "Guarda esta clave: solo se muestra una vez.",
        shownOnlyOnce: "La clave API solo se muestra una vez. Guárdala ahora.",
        generatedNotice: "Tu clave ha sido generada",
        noFullKey: "La clave completa ya no está disponible en esta sesión. Regenera una nueva clave para verla y copiarla otra vez.",
        created: "Creada el {date}",
        connectError: "No se pudo conectar con la autenticación.",
        sessionError: "No se pudo cargar tu sesión.",
        loadError: "No se pudo cargar la clave API.",
        generateError: "No se pudo generar la clave. Inténtalo de nuevo.",
        copyError: "No se pudo copiar la clave.",
        confirmRegenerate: "Esto desactivará tu clave actual y creará una nueva. ¿Continuar?",
        statusActive: "Activa",
        statusDisabled: "Deshabilitada"
      },
      alert: {
        lowBalanceTitle: "Alerta de saldo bajo",
        lowBalanceMessage: "Tu saldo es bajo. Recarga ahora para seguir usando ClawRouter.",
        criticalTitle: "Saldo críticamente bajo",
        criticalMessage:
          "Tu saldo disponible ({amount}) es insuficiente para solicitudes API. Agrega créditos de inmediato para evitar interrupciones del servicio.",
        warningTitle: "El saldo se está agotando",
        warningMessage:
          "Tu saldo disponible ({amount}) está por debajo de {threshold}. Considera agregar créditos pronto para evitar interrupciones.",
        frozenHint: "{amount} se está procesando para solicitudes pendientes y se descontará en breve.",
        addCredits: "Recargar ahora",
        dismiss: "Cerrar"
      },
      transactionsPage: {
        title: "Historial de transacciones",
        subtitle: "Consulta todas las transacciones de saldo de tu cuenta, incluidas recargas, cargos y reembolsos.",
        balance: "Saldo: {amount}"
      },
      transactionTable: {
        title: "Historial de transacciones",
        allKeys: "Todas las claves",
        allTypes: "Todos los tipos",
        dateRange7d: "7 días",
        dateRange30d: "30 días",
        dateRange90d: "90 días",
        dateRangeCustom: "Personalizado",
        exportCsv: "Exportar CSV",
        exporting: "Exportando...",
        time: "Hora",
        type: "Tipo",
        amount: "Monto",
        balance: "Saldo",
        status: "Estado",
        description: "Descripción",
        noTransactions: "Todavía no hay transacciones",
        noTransactionsFound: "No se encontraron transacciones",
        loadMore: "Cargar más",
        showing: "Mostrando {start} - {end} de {total}",
        filters: {
          recharge: "Recarga",
          charge: "Uso",
          refund: "Reembolso",
          freeze: "Congelar"
        },
        statuses: {
          frozen: "Procesando",
          completed: "Completado",
          released: "Liberado",
          pending: "Pendiente",
          failed: "Fallido"
        }
      },
      addCreditsPage: {
        title: "Agregar créditos",
        subtitle:
          "Selecciona un monto de recarga para agregar créditos a tu cuenta de ClawRouter. Los créditos no vencen y pueden usarse para solicitudes API en todos los modelos compatibles.",
        selectAmount: "Seleccionar monto",
        selectTopupAmount: "Selecciona un monto de recarga",
        creditsNeverExpire: "Los créditos no vencen",
        bestValue: "Mejor valor",
        promoCodeOptional: "Código promocional (opcional)",
        enterPromoCode: "Ingresa el código promocional",
        validating: "Validando...",
        originalAmount: "Monto original",
        discount: "Descuento",
        bonusCredits: "Créditos extra",
        finalAmount: "Monto final",
        payWithStripe: "Pagar {amount} con Stripe",
        openingStripe: "Abriendo Stripe...",
        securePayment: "Pago seguro con Stripe. Los créditos no vencen.",
        invalidPromoCode: "Código promocional no válido",
        validateError: "No se pudo validar el código promocional. Inténtalo de nuevo.",
        signInAgain: "Vuelve a iniciar sesión.",
        checkoutError: "No se pudo crear la sesión de checkout de Stripe."
      },
      apiKeysPage: {
        title: "Claves API",
        subtitle: "Crea y gestiona tus claves API de ClawRouter.",
        table: { name: "Nombre", prefix: "Prefijo", status: "Estado", createdAt: "Creado", actions: "Acciones" },
        status: { active: "Activa", revoked: "Revocada", inactive: "Inactiva" },
        buttons: { createNew: "Crear Nueva Clave", show: "Mostrar", copy: "Copiar", copied: "Copiado", reveal: "Revelar", revealing: "Revelando...", regenerate: "Regenerar", regenerating: "Regenerando...", delete: "Eliminar", deleting: "Eliminando..." },
        createModal: { title: "Crear Nueva Clave API", namePlaceholder: "Mi Clave API", create: "Crear", creating: "Creando...", cancel: "Cancelar" },
        confirmDelete: "¿Estás seguro de que deseas eliminar esta clave API? Esta acción no se puede deshacer.",
        confirmRegenerate: "Esto desactivará tu clave actual y creará una nueva. ¿Continuar?",
        noKeys: "Sin claves API aún. Crea tu primera clave para comenzar.",
        errors: { load: "Error al cargar claves API.", create: "Error al crear clave. Inténtalo de nuevo.", delete: "Error al eliminar clave. Inténtalo de nuevo.", regenerate: "Error al regenerar clave. Inténtalo de nuevo.", reveal: "Error al revelar clave. Inténtalo de nuevo.", copy: "Error al copiar clave." },
        savedKeyNotice: "Guarda esta clave — solo se muestra una vez."
      },
      quickStartPage: {
        title: "Inicio Rápido",
        subtitle: "Pon en marcha ClawRouter en unos minutos.",
        steps: {
          download: { title: "Descarga el Instalador", description: "Descarga el instalador de ClawLite para tu sistema operativo.", actionLabel: "Descargar para {os}", actionHref: "/downloads" },
          apiKey: { title: "Configura Tu Clave API", description: "Configura tu clave API de ClawRouter para autenticar solicitudes.", actionLabel: "Ir a Claves API", actionHref: "/clawrouter/dashboard/api-keys" },
          channel: { title: "Configura un Canal", description: "Conecta un canal como Telegram o Web Chat para recibir mensajes.", actionLabel: "Ver Docs de Canales", actionHref: "/clawrouter/docs/channels" },
          firstMessage: { title: "Envía Tu Primer Mensaje", description: "Una vez configurado todo, envía tu primer mensaje a través de tu canal.", actionLabel: "Abrir Panel", actionHref: "/clawrouter/dashboard" }
        },
        completed: "Completado",
        current: "Paso actual"
      },
      modelsPage: {
        title: "Modelos Disponibles",
        subtitle: "Todos los modelos disponibles a través de ClawRouter. Tus derechos determinan el acceso.",
        providers: { openai: "OpenAI", anthropic: "Anthropic", minimax: "MiniMax", google: "Google" },
        input: "Entrada",
        output: "Salida",
        per1m: "/ 1M tokens",
        available: "Disponible",
        unavailable: "Sin acceso",
        loadingModels: "Cargando modelos...",
        loadError: "Error al cargar modelos.",
        noModels: "No hay modelos disponibles."
      },
      affiliatePage: {
        title: "Programa de Afiliados",
        subtitle: "Gana comisiones refiriendo nuevos usuarios a ClawRouter.",
        referralCode: "Tu Código de Afiliado",
        copyCode: "Copiar Código",
        copied: "¡Copiado!",
        stats: { referredUsers: "Usuarios Referidos", earnedCommission: "Comisión Ganada", pendingCommission: "Comisión Pendiente" },
        claim: "Reclamar Comisión",
        claiming: "Reclamando...",
        claimSuccess: "Comisión reclamada con éxito.",
        claimError: "Error al reclamar comisión.",
        records: { title: "Registros de Afiliados", time: "Hora", referredUser: "Usuario Referido", status: "Estado", amount: "Cantidad", noRecords: "Sin registros de afiliados aún." },
        statuses: { pending: "Pendiente", approved: "Aprobado", paid: "Pagado", rejected: "Rechazado" },
        loadError: "Error al cargar datos de afiliados."
      },
      profilePage: {
        title: "Configuración de Cuenta",
        subtitle: "Gestiona la información y preferencias de tu cuenta.",
        basicInfo: "Información Básica",
        email: "Correo Electrónico",
        accountId: "ID de Cuenta",
        registeredAt: "Registrado",
        displayName: "Nombre a Mostrar",
        displayNamePlaceholder: "Ingresa tu nombre a mostrar",
        updateDisplayName: "Actualizar",
        updating: "Actualizando...",
        updateSuccess: "Nombre a mostrar actualizado.",
        updateError: "Error al actualizar nombre a mostrar.",
        dangerZone: "Zona de Peligro",
        deleteAccount: "Eliminar Cuenta",
        deleteAccountDesc: "Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.",
        confirmDeleteTitle: "¿Confirmar Eliminación de Cuenta?",
        confirmDeleteBody: "Esto eliminará permanentemente tu cuenta, todas las claves API y todos los datos de uso. Esta acción no se puede deshacer. Escribe DELETE para confirmar.",
        deleteInputPlaceholder: "Escribe DELETE para confirmar",
        deleteAccountBtn: "Eliminar Mi Cuenta",
        deleting: "Eliminando...",
        deleteSuccess: "Cuenta eliminada.",
        deleteError: "Error al eliminar cuenta.",
        loadError: "Error al cargar información de cuenta."
      }
    },
    ja: {
      nav: {
        dashboard: "ダッシュボード",
        apiKeys: "API キー",
        quickStart: "クイックスタート",
        models: "モデル",
        usage: "使用量",
        transactions: "取引履歴",
        affiliate: "アフィリエイト",
        profile: "プロフィール"
      },
      common: {
        dashboard: "ダッシュボード",
        clawRouter: "ClawRouter",
        accountFallback: "アカウント",
        quickActions: "クイックアクション",
        addCredits: "クレジット追加",
        topUp: "チャージ",
        apiDocs: "API ドキュメント",
        viewAll: "すべて表示",
        backToDashboard: "ダッシュボードに戻る",
        backToSalesPage: "販売ページに戻る",
        credits: "クレジット",
        loadingDashboard: "ClawRouter ダッシュボードを読み込み中...",
        loadingTransactions: "取引履歴を読み込み中...",
        loadingAddCredits: "クレジット追加ページを読み込み中...",
        loadingTransactionsTable: "取引履歴を読み込み中...",
        statusActive: "有効",
        statusCompleted: "完了",
        statusPending: "保留中",
        statusFailed: "失敗",
        statusProcessing: "処理中",
        statusReleased: "解放済み",
        statusFrozen: "凍結中",
        dateFrom: "開始",
        dateTo: "終了",
        apply: "適用",
        today: "今日",
        thisWeek: "今週",
        thisMonth: "今月",
        allTime: "全期間",
        never: "なし"
      },
      page: {
        title: "ClawRouter ダッシュボード",
        subtitle:
          "ログイン後の作業画面です。クレジット追加、ClawLite API キー管理、利用可能モデルの確認、支出と使用量の追跡を 1 か所で行えます。",
        welcomeBack: "おかえりなさい",
        yourAccount: "あなたのアカウント",
        quickActionsHint: "対象となる初回購入が完了すると、ClawLite API キーが下のカードに表示されます。",
        topupSuccessTitle: "クレジットの追加が完了しました",
        topupSuccessBody:
          "Stripe のチェックアウトが正常に完了しました{amount}。下の残高がまだ更新されていない場合は、Webhook の反映後に一度更新してください。",
        topupSuccessAmount: "（{amount}）",
        usageByModelTitle: "モデル別使用量",
        usageByModelSubtitle: "リクエストが ClawRouter を通り始めると、ここに内訳が表示されます。",
        usageByProviderTitle: "プロバイダー別使用量",
        usageByProviderSubtitle: "ここにプロバイダー構成、支出比率、ルーティング分布が表示されます。",
        modelsLabel: "モデル",
        modelsTitle: "利用可能レーン",
        modelRows: [
          { model: "clawrouter/auto", provider: "管理ルート", status: "デフォルト" },
          { model: "Claude / GPT / Gemini 系", provider: "プロバイダー経由ルーティング", status: "利用可能" },
          { model: "BYOK フォールバック", provider: "手動プロバイダーパス", status: "任意" }
        ],
        topupHistoryTitle: "チャージ履歴",
        noTopupsYet: "完了したチャージはまだありません。",
        recentRequestsTitle: "最近のリクエスト",
        recentRequestsEmpty: "リクエストはまだありません",
        recentRequestsHeaders: {
          time: "時間",
          model: "モデル",
          key: "キー",
          cost: "コスト"
        }
      },
      balance: {
        totalBalance: "総残高",
        totalBalanceDescription: "差し引き前のアカウント総額",
        available: "利用可能",
        availableDescription: "API リクエストに使える残高",
        frozen: "凍結中",
        frozenDescription: "処理中のリクエスト分（後で差し引かれます）",
        total: "合計"
      },
      summary: {
        totalSpent: "累計支出",
        totalSpentNote: "ClawRouter 全期間の支出",
        today: "今日",
        todayNote: "当日のコスト",
        totalTokens: "総トークン数",
        totalTokensNote: "これまでの入力 + 出力トークン",
        avgCostPerRequest: "1 リクエスト平均",
        avgCostPerRequestNote: "ここにコスト効率が表示されます",
        apiKeys: "API キー",
        apiKeysNote: "このアカウントで有効な ClawLite API キー数",
        totalRequests: "総リクエスト数",
        lastRequest: "最終リクエスト",
        cost: "コスト"
      },
      apiKey: {
        label: "マイ API キー",
        title: "ClawRouter API キー",
        empty: "まだ API キーがありません。",
        generate: "キーを生成",
        generating: "生成中...",
        regenerate: "キーを再生成",
        regenerating: "再生成中...",
        copy: "コピー",
        copyKey: "キーをコピー",
        copied: "コピー済み",
        saveOnce: "このキーは一度しか表示されません。必ず保存してください。",
        shownOnlyOnce: "API キーは一度しか表示されません。今すぐ保存してください。",
        generatedNotice: "キーが生成されました",
        noFullKey: "このセッションでは完全なキーを再表示できません。新しいキーを再生成してコピーしてください。",
        created: "作成日 {date}",
        connectError: "認証に接続できません。",
        sessionError: "セッションを読み込めません。",
        loadError: "API キーの読み込みに失敗しました。",
        generateError: "キーの生成に失敗しました。もう一度お試しください。",
        copyError: "キーのコピーに失敗しました。",
        confirmRegenerate: "現在のキーを無効化して新しいキーを作成します。続行しますか？",
        statusActive: "有効",
        statusDisabled: "無効"
      },
      alert: {
        lowBalanceTitle: "低残高アラート",
        lowBalanceMessage: "残高が少なくなっています。ClawRouter を継続利用するには今すぐチャージしてください。",
        criticalTitle: "残高が著しく不足しています",
        criticalMessage:
          "利用可能残高（{amount}）では API リクエストを処理できません。サービス中断を避けるため、すぐにクレジットを追加してください。",
        warningTitle: "残高が少なくなっています",
        warningMessage:
          "利用可能残高（{amount}）が {threshold} を下回っています。中断を避けるため、早めのチャージをおすすめします。",
        frozenHint: "{amount} は保留中リクエストの処理中で、まもなく差し引かれます。",
        addCredits: "今すぐチャージ",
        dismiss: "閉じる"
      },
      transactionsPage: {
        title: "取引履歴",
        subtitle: "チャージ、利用料金、返金を含むアカウント残高のすべての取引を確認できます。",
        balance: "残高: {amount}"
      },
      transactionTable: {
        title: "取引履歴",
        allKeys: "すべてのキー",
        allTypes: "すべての種類",
        dateRange7d: "7日間",
        dateRange30d: "30日間",
        dateRange90d: "90日間",
        dateRangeCustom: "カスタム",
        exportCsv: "CSV をエクスポート",
        exporting: "エクスポート中...",
        time: "時間",
        type: "種類",
        amount: "金額",
        balance: "残高",
        status: "状態",
        description: "説明",
        noTransactions: "取引履歴はまだありません",
        noTransactionsFound: "取引は見つかりませんでした",
        loadMore: "さらに読み込む",
        showing: "{total} 件中 {start} - {end} を表示",
        filters: {
          recharge: "チャージ",
          charge: "利用",
          refund: "返金",
          freeze: "凍結"
        },
        statuses: {
          frozen: "処理中",
          completed: "完了",
          released: "解放済み",
          pending: "保留中",
          failed: "失敗"
        }
      },
      addCreditsPage: {
        title: "クレジット追加",
        subtitle:
          "チャージ金額を選択して ClawRouter アカウントにクレジットを追加します。クレジットに有効期限はなく、対応するすべてのモデルの API リクエストに使用できます。",
        selectAmount: "金額を選択",
        selectTopupAmount: "チャージ金額を選択",
        creditsNeverExpire: "クレジットに有効期限はありません",
        bestValue: "おすすめ",
        promoCodeOptional: "プロモコード（任意）",
        enterPromoCode: "プロモコードを入力",
        validating: "確認中...",
        originalAmount: "元の金額",
        discount: "割引",
        bonusCredits: "ボーナスクレジット",
        finalAmount: "最終金額",
        payWithStripe: "Stripe で {amount} を支払う",
        openingStripe: "Stripe を開いています...",
        securePayment: "Stripe による安全な決済です。クレジットに有効期限はありません。",
        invalidPromoCode: "無効なプロモコードです",
        validateError: "プロモコードの確認に失敗しました。もう一度お試しください。",
        signInAgain: "もう一度サインインしてください。",
        checkoutError: "Stripe チェックアウトセッションを作成できませんでした。"
      },
      apiKeysPage: {
        title: "API キー",
        subtitle: "ClawRouter API キーの作成と管理。",
        table: { name: "名前", prefix: "プレフィックス", status: "ステータス", createdAt: "作成日", actions: "操作" },
        status: { active: "有効", revoked: "取り消し済み", inactive: "非アクティブ" },
        buttons: { createNew: "新規キーを作成", show: "表示", copy: "コピー", copied: "コピー済み", reveal: "表示", revealing: "表示中...", regenerate: "再生成", regenerating: "再生成中...", delete: "削除", deleting: "削除中..." },
        createModal: { title: "新規 API キー作成", namePlaceholder: "マイ API キー", create: "作成", creating: "作成中...", cancel: "キャンセル" },
        confirmDelete: "この API キーを削除してもよろしいですか？この操作は元に戻せません。",
        confirmRegenerate: "現在のキーが無効化され、新しいキーが作成されます。続行しますか？",
        noKeys: "API キーがまだありません。最初のキーを作成して始めましょう。",
        errors: { load: "API キーの読み込みに失敗しました。", create: "キーの作成に失敗しました。もう一度お試しください。", delete: "キーの削除に失敗しました。もう一度お試しください。", regenerate: "キーの再生成に失敗しました。もう一度お試しください。", reveal: "キーの表示に失敗しました。もう一度お試しください。", copy: "キーのコピーに失敗しました。" },
        savedKeyNotice: "このキーは一度しか表示されません。必ず保存してください。"
      },
      quickStartPage: {
        title: "クイックスタート",
        subtitle: "ClawRouter を数分で起動して実行します。",
        steps: {
          download: { title: "インストーラーをダウンロード", description: "オペレーティングシステム用の ClawLite インストーラーをダウンロードします。", actionLabel: "{os} 用をダウンロード", actionHref: "/downloads" },
          apiKey: { title: "API キーの設定", description: "リクエストを認証するために ClawRouter API キーを設定します。", actionLabel: "API キーへ移動", actionHref: "/clawrouter/dashboard/api-keys" },
          channel: { title: "チャンネルの設定", description: "Telegram や Web チャットなどのチャンネルを接続してメッセージを受信します。", actionLabel: "チャンネルドキュメントを見る", actionHref: "/clawrouter/docs/channels" },
          firstMessage: { title: "最初のメッセージを送信", description: "すべてが設定されたら、チャンネルを介して最初のメッセージを送信します。", actionLabel: "ダッシュボードを開く", actionHref: "/clawrouter/dashboard" }
        },
        completed: "完了",
        current: "現在のステップ"
      },
      modelsPage: {
        title: "利用可能なモデル",
        subtitle: "ClawRouter で利用可能なすべてのモデル。あなたの権利がアクセスを決定します。",
        providers: { openai: "OpenAI", anthropic: "Anthropic", minimax: "MiniMax", google: "Google" },
        input: "入力",
        output: "出力",
        per1m: "/ 100万トークン",
        available: "利用可能",
        unavailable: "権利なし",
        loadingModels: "モデルを読み込み中...",
        loadError: "モデルの読み込みに失敗しました。",
        noModels: "利用可能なモデルがありません。"
      },
      affiliatePage: {
        title: "AFFILIATE Program",
        subtitle: "新しいユーザーを ClawRouter に紹介してコミッションを稼ぎましょう。",
        referralCode: "あなたの紹介コード",
        copyCode: "コードをコピー",
        copied: "コピーしました！",
        stats: { referredUsers: "紹介ユーザー", earnedCommission: "獲得コミッション", pendingCommission: "未払いコミッション" },
        claim: "コミッションを受け取る",
        claiming: "受け取り中...",
        claimSuccess: "コミッションを受け取りました。",
        claimError: "コミッションの取得に失敗しました。",
        records: { title: "紹介記録", time: "時間", referredUser: "紹介されたユーザー", status: "ステータス", amount: "金額", noRecords: "紹介記録はまだありません。" },
        statuses: { pending: "保留中", approved: "承認済み", paid: "支払済み", rejected: "拒否済み" },
        loadError: "紹介データの読み込みに失敗しました。"
      },
      profilePage: {
        title: "アカウント設定",
        subtitle: "アカウント情報と環境設定の管理。",
        basicInfo: "基本情報",
        email: "メールアドレス",
        accountId: "アカウント ID",
        registeredAt: "登録日",
        displayName: "表示名",
        displayNamePlaceholder: "表示名を入力",
        updateDisplayName: "更新",
        updating: "更新中...",
        updateSuccess: "表示名を更新しました。",
        updateError: "表示名の更新に失敗しました。",
        dangerZone: "危険ゾーン",
        deleteAccount: "アカウント削除",
        deleteAccountDesc: "アカウントとすべての関連データを完全に削除します。この操作は元に戻せません。",
        confirmDeleteTitle: "アカウントを削除しますか？",
        confirmDeleteBody: "これにより、アカウント、すべての API キー、およびすべての使用データが完全に削除されます。この操作は元に戻せません。DELETE と入力して確認してください。",
        deleteInputPlaceholder: "DELETE と入力して確認",
        deleteAccountBtn: "私のアカウントを削除",
        deleting: "削除中...",
        deleteSuccess: "アカウントが削除されました。",
        deleteError: "アカウントの削除に失敗しました。",
        loadError: "アカウント情報の読み込みに失敗しました。"
      },
    },
    ko: {
      nav: {
        dashboard: "대시보드",
        apiKeys: "API 키",
        quickStart: "빠른 시작",
        models: "모델",
        usage: "사용량",
        transactions: "거래 내역",
        affiliate: "제휴",
        profile: "프로필"
      },
      common: {
        dashboard: "대시보드",
        clawRouter: "ClawRouter",
        accountFallback: "계정",
        quickActions: "빠른 작업",
        addCredits: "크레딧 추가",
        topUp: "충전",
        apiDocs: "API 문서",
        viewAll: "전체 보기",
        backToDashboard: "대시보드로 돌아가기",
        backToSalesPage: "판매 페이지로 돌아가기",
        credits: "크레딧",
        loadingDashboard: "ClawRouter 대시보드를 불러오는 중...",
        loadingTransactions: "거래 내역을 불러오는 중...",
        loadingAddCredits: "크레딧 추가 페이지를 불러오는 중...",
        loadingTransactionsTable: "거래 내역을 불러오는 중...",
        statusActive: "활성",
        statusCompleted: "완료",
        statusPending: "대기 중",
        statusFailed: "실패",
        statusProcessing: "처리 중",
        statusReleased: "해제됨",
        statusFrozen: "동결됨",
        dateFrom: "시작",
        dateTo: "종료",
        apply: "적용",
        today: "오늘",
        thisWeek: "이번 주",
        thisMonth: "이번 달",
        allTime: "전체 기간",
        never: "없음"
      },
      page: {
        title: "ClawRouter 대시보드",
        subtitle:
          "로그인 후 사용하는 작업 공간입니다. 크레딧 충전, ClawLite API 키 관리, 사용 가능한 모델 확인, 비용과 사용량 추적을 한곳에서 처리할 수 있습니다.",
        welcomeBack: "다시 오신 것을 환영합니다",
        yourAccount: "내 계정",
        quickActionsHint: "첫 유효 구매가 완료되면 아래 카드에 ClawLite API 키가 표시됩니다.",
        topupSuccessTitle: "크레딧이 성공적으로 추가되었습니다",
        topupSuccessBody:
          "Stripe 체크아웃이 성공적으로 완료되었습니다{amount}. 아래 잔액이 아직 업데이트되지 않았다면 webhook 반영 후 한 번 새로고침하세요.",
        topupSuccessAmount: " ({amount})",
        usageByModelTitle: "모델별 사용량",
        usageByModelSubtitle: "요청이 ClawRouter를 통해 흐르기 시작하면 여기에 상세 내역이 표시됩니다.",
        usageByProviderTitle: "제공자별 사용량",
        usageByProviderSubtitle: "여기에 제공자 구성, 비용 비중, 라우팅 분포가 표시됩니다.",
        modelsLabel: "모델",
        modelsTitle: "사용 가능한 경로",
        modelRows: [
          { model: "clawrouter/auto", provider: "관리형 라우트", status: "기본값" },
          { model: "Claude / GPT / Gemini 계열", provider: "제공자 라우팅", status: "사용 가능" },
          { model: "BYOK 대체 경로", provider: "수동 제공자 경로", status: "선택 사항" }
        ],
        topupHistoryTitle: "충전 내역",
        noTopupsYet: "완료된 충전 내역이 아직 없습니다.",
        recentRequestsTitle: "최근 요청",
        recentRequestsEmpty: "요청 내역이 아직 없습니다",
        recentRequestsHeaders: {
          time: "시간",
          model: "모델",
          key: "키",
          cost: "비용"
        }
      },
      balance: {
        totalBalance: "총 잔액",
        totalBalanceDescription: "차감 전 계정 총액",
        available: "사용 가능",
        availableDescription: "API 요청에 사용할 수 있는 잔액",
        frozen: "동결",
        frozenDescription: "처리 중인 요청 금액(곧 차감됨)",
        total: "합계"
      },
      summary: {
        totalSpent: "총 지출",
        totalSpentNote: "ClawRouter 전체 기간 지출",
        today: "오늘",
        todayNote: "오늘 발생한 비용",
        totalTokens: "총 토큰",
        totalTokensNote: "지금까지의 입력 + 출력 토큰",
        avgCostPerRequest: "요청당 평균 비용",
        avgCostPerRequestNote: "여기에 비용 효율이 표시됩니다",
        apiKeys: "API 키",
        apiKeysNote: "이 계정의 활성 ClawLite API 키 수",
        totalRequests: "총 요청 수",
        lastRequest: "마지막 요청",
        cost: "비용"
      },
      apiKey: {
        label: "내 API 키",
        title: "ClawRouter API 키",
        empty: "아직 API 키가 없습니다.",
        generate: "키 생성",
        generating: "생성 중...",
        regenerate: "키 재생성",
        regenerating: "재생성 중...",
        copy: "복사",
        copyKey: "키 복사",
        copied: "복사됨",
        saveOnce: "이 키는 한 번만 표시되므로 반드시 저장하세요.",
        shownOnlyOnce: "API 키는 한 번만 표시됩니다. 지금 저장하세요.",
        generatedNotice: "키가 생성되었습니다",
        noFullKey: "이 세션에서는 전체 키를 다시 볼 수 없습니다. 새 키를 재생성한 뒤 다시 복사하세요.",
        created: "{date} 생성",
        connectError: "인증에 연결할 수 없습니다.",
        sessionError: "세션을 불러올 수 없습니다.",
        loadError: "API 키를 불러오지 못했습니다.",
        generateError: "키 생성에 실패했습니다. 다시 시도하세요.",
        copyError: "키 복사에 실패했습니다.",
        confirmRegenerate: "현재 키를 비활성화하고 새 키를 생성합니다. 계속하시겠습니까?",
        statusActive: "활성",
        statusDisabled: "비활성"
      },
      alert: {
        lowBalanceTitle: "잔액 부족 알림",
        lowBalanceMessage: "잔액이 부족합니다. ClawRouter를 계속 사용하려면 지금 충전하세요.",
        criticalTitle: "잔액이 매우 부족합니다",
        criticalMessage:
          "사용 가능한 잔액({amount})이 API 요청을 처리하기에 부족합니다. 서비스 중단을 피하려면 즉시 크레딧을 추가하세요.",
        warningTitle: "잔액이 곧 부족해집니다",
        warningMessage:
          "사용 가능한 잔액({amount})이 {threshold} 아래입니다. 중단 없는 사용을 위해 곧 충전하는 것을 권장합니다.",
        frozenHint: "{amount}은 보류 중인 요청 처리에 사용 중이며 곧 차감됩니다.",
        addCredits: "지금 충전",
        dismiss: "닫기"
      },
      transactionsPage: {
        title: "거래 내역",
        subtitle: "충전, 사용, 환불을 포함한 계정 잔액 거래를 모두 확인하세요.",
        balance: "잔액: {amount}"
      },
      transactionTable: {
        title: "거래 내역",
        allKeys: "모든 키",
        allTypes: "모든 유형",
        dateRange7d: "7일",
        dateRange30d: "30일",
        dateRange90d: "90일",
        dateRangeCustom: "사용자 지정",
        exportCsv: "CSV 내보내기",
        exporting: "내보내는 중...",
        time: "시간",
        type: "유형",
        amount: "금액",
        balance: "잔액",
        status: "상태",
        description: "설명",
        noTransactions: "거래 내역이 아직 없습니다",
        noTransactionsFound: "거래를 찾을 수 없습니다",
        loadMore: "더 불러오기",
        showing: "{total}건 중 {start} - {end} 표시",
        filters: {
          recharge: "충전",
          charge: "사용",
          refund: "환불",
          freeze: "동결"
        },
        statuses: {
          frozen: "처리 중",
          completed: "완료",
          released: "해제됨",
          pending: "대기 중",
          failed: "실패"
        }
      },
      addCreditsPage: {
        title: "크레딧 추가",
        subtitle:
          "충전 금액을 선택해 ClawRouter 계정에 크레딧을 추가하세요. 크레딧은 만료되지 않으며 지원되는 모든 모델의 API 요청에 사용할 수 있습니다.",
        selectAmount: "금액 선택",
        selectTopupAmount: "충전 금액 선택",
        creditsNeverExpire: "크레딧은 만료되지 않습니다",
        bestValue: "가성비 최고",
        promoCodeOptional: "프로모션 코드(선택)",
        enterPromoCode: "프로모션 코드 입력",
        validating: "확인 중...",
        originalAmount: "원래 금액",
        discount: "할인",
        bonusCredits: "보너스 크레딧",
        finalAmount: "최종 금액",
        payWithStripe: "Stripe로 {amount} 결제",
        openingStripe: "Stripe를 여는 중...",
        securePayment: "Stripe를 통한 안전한 결제입니다. 크레딧은 만료되지 않습니다.",
        invalidPromoCode: "유효하지 않은 프로모션 코드입니다",
        validateError: "프로모션 코드 확인에 실패했습니다. 다시 시도하세요.",
        signInAgain: "다시 로그인하세요.",
        checkoutError: "Stripe 체크아웃 세션을 생성할 수 없습니다."
      },
      apiKeysPage: {
        title: "API 키",
        subtitle: "ClawRouter API 키를 생성하고 관리합니다.",
        table: { name: "이름", prefix: "접두사", status: "상태", createdAt: "생성일", actions: "작업" },
        status: { active: "활성", revoked: "취소됨", inactive: "비활성" },
        buttons: { createNew: "새 키 생성", show: "보기", copy: "복사", copied: "복사됨", reveal: "표시", revealing: "표시 중...", regenerate: "재생성", regenerating: "재생성 중...", delete: "삭제", deleting: "삭제 중..." },
        createModal: { title: "새 API 키 생성", namePlaceholder: "내 API 키", create: "생성", creating: "생성 중...", cancel: "취소" },
        confirmDelete: "이 API 키를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        confirmRegenerate: "현재 키가 비활성화되고 새 키가 생성됩니다. 계속하시겠습니까?",
        noKeys: "아직 API 키가 없습니다. 첫 번째 키를 만들어 시작하세요.",
        errors: { load: "API 키를 불러오지 못했습니다.", create: "키 생성에 실패했습니다. 다시 시도하세요.", delete: "키 삭제에 실패했습니다. 다시 시도하세요.", regenerate: "키 재생성에 실패했습니다. 다시 시도하세요.", reveal: "키 표시에 실패했습니다. 다시 시도하세요.", copy: "키 복사에 실패했습니다." },
        savedKeyNotice: "이 키는 한 번만 표시되므로 반드시 저장하세요."
      },
      quickStartPage: {
        title: "빠른 시작",
        subtitle: "ClawRouter를 몇 분 만에 시작하세요.",
        steps: {
          download: { title: "인스톨러 다운로드", description: "운영 체제용 ClawLite 인스톨러를 다운로드합니다.", actionLabel: "{os}용 다운로드", actionHref: "/downloads" },
          apiKey: { title: "API 키 구성", description: "요청을 인증하려면 ClawRouter API 키를 설정합니다.", actionLabel: "API 키로 이동", actionHref: "/clawrouter/dashboard/api-keys" },
          channel: { title: "채널 구성", description: "Telegram이나 웹 채팅 등의 채널을 연결하여 메시지를 수신합니다.", actionLabel: "채널 문서 보기", actionHref: "/clawrouter/docs/channels" },
          firstMessage: { title: "첫 번째 메시지 보내기", description: "모든 설정이 완료되면 채널을 통해 첫 번째 메시지를 보냅니다.", actionLabel: "대시보드 열기", actionHref: "/clawrouter/dashboard" }
        },
        completed: "완료",
        current: "현재 단계"
      },
      modelsPage: {
        title: "사용 가능한 모델",
        subtitle: "ClawRouter를 통해可以利用 가능한 모든 모델입니다. 사용자 권한이 액세스를 결정합니다.",
        providers: { openai: "OpenAI", anthropic: "Anthropic", minimax: "MiniMax", google: "Google" },
        input: "입력",
        output: "출력",
        per1m: "/ 100만 토큰",
        available: "사용 가능",
        unavailable: "권한 없음",
        loadingModels: "모델 로드 중...",
        loadError: "모델 로드 실패.",
        noModels: "사용 가능한 모델이 없습니다."
      },
      affiliatePage: {
        title: "제휴 프로그램",
        subtitle: "ClawRouter에 새 사용자를 추천하여 커미션을 얻으세요.",
        referralCode: "내 추천 코드",
        copyCode: "코드 복사",
        copied: "복사됨!",
        stats: { referredUsers: "추천 사용자", earnedCommission: "얻은 커미션", pendingCommission: "미결제 커미션" },
        claim: "커미션 받기",
        claiming: "받는 중...",
        claimSuccess: "커미션을 성공적으로 받았습니다.",
        claimError: "커미션 받기에 실패했습니다.",
        records: { title: "추천 기록", time: "시간", referredUser: "추천된 사용자", status: "상태", amount: "금액", noRecords: "아직 추천 기록이 없습니다." },
        statuses: { pending: "대기 중", approved: "승인됨", paid: "지불됨", rejected: "거부됨" },
        loadError: "제휴 데이터를 불러오지 못했습니다."
      },
      profilePage: {
        title: "계정 설정",
        subtitle: "계정 정보 및 환경 설정을 관리합니다.",
        basicInfo: "기본 정보",
        email: "이메일",
        accountId: "계정 ID",
        registeredAt: "등록일",
        displayName: "표시 이름",
        displayNamePlaceholder: "표시 이름을 입력하세요",
        updateDisplayName: "업데이트",
        updating: "업데이트 중...",
        updateSuccess: "표시 이름이 업데이트되었습니다.",
        updateError: "표시 이름 업데이트에 실패했습니다.",
        dangerZone: "위험 구역",
        deleteAccount: "계정 삭제",
        deleteAccountDesc: "계정 및 모든 관련 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.",
        confirmDeleteTitle: "계정을 삭제하시겠습니까?",
        confirmDeleteBody: "이렇게 하면 계정, 모든 API 키 및 모든 사용 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다. 확인하려면 DELETE를 입력하세요.",
        deleteInputPlaceholder: "삭제를 확인하려면 DELETE를 입력하세요",
        deleteAccountBtn: "내 계정 삭제",
        deleting: "삭제 중...",
        deleteSuccess: "계정이 삭제되었습니다.",
        deleteError: "계정 삭제에 실패했습니다.",
        loadError: "계정 정보를 불러오지 못했습니다."
      }
    }
  }
} as const;

export const intlLocales: Record<Lang, string> = {
  en: "en-US",
  zh: "zh-CN",
  es: "es-ES",
  ja: "ja-JP",
  ko: "ko-KR"
};

export type LocalizedContent = (typeof content)[Lang] & {
  dashboard: (typeof content.dashboard)[Lang];
  downloads: (typeof content.downloads)[Lang];
};

export function getIntlLocale(lang: Lang) {
  return intlLocales[lang];
}

export function getContentForLang(lang: Lang): LocalizedContent {
  return {
    ...content[lang],
    dashboard: content.dashboard[lang],
    downloads: content.downloads[lang],
  };
}
