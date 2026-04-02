export type Lang = "en" | "zh" | "es" | "ja" | "ko";

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
  }
} as const;

export function getContentForLang(lang: Lang) {
  return content[lang];
}
