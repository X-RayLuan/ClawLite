export type Lang = "en" | "zh";

export const content = {
  en: {
    nav: {
      home: "Home",
      setup: "Setup",
      troubleshoot: "Troubleshoot",
      docs: "Docs",
      blog: "Blog"
    },
    hero: {
      eyebrow: "OpenClaw in 5 minutes · No terminal required",
      title: "ClawLite Web Wizard",
      subtitle:
        "A friendly step-by-step guide to install and launch OpenClaw. No terminal required.",
      start: "Start Setup",
      secondary: "View Troubleshoot",
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
          body: "Choose LazyClaw Tokens/BYOK, then follow channel instructions."
        }
      ],
      highlights: [
        "Pure front-end, no login required",
        "One-click copy for every command",
        "Bilingual English + Chinese",
        "Telegram and Web Chat ready"
      ]
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
          description: "Default to LazyClaw Tokens (50% discount) or choose BYOK."
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
        clawliteTitle: "LazyClaw Tokens (Default)",
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
      back: "Back to setup"
    },
    footer: {
      tagline: "Built for humans. Powered by OpenClaw.",
      cta: "Ready to get started?"
    }
  },
  zh: {
    nav: {
      home: "首页",
      setup: "安装向导",
      troubleshoot: "排障",
      docs: "文档",
      blog: "博客"
    },
    hero: {
      eyebrow: "5 分钟启动 OpenClaw（无需终端）",
      title: "ClawLite Web 向导",
      subtitle:
        "一步步带你完成 OpenClaw 安装和启动。全程无需终端命令。",
      start: "开始安装",
      secondary: "查看排障",
      previewTitle: "快速预览",
      previewSteps: [
        {
          title: "检测系统",
          body: "自动识别平台，一键确认。"
        },
        {
          title: "下载安装向导",
          body: "点击 Install 即可下载并运行向导。"
        },
        {
          title: "API + 渠道",
          body: "默认 LazyClaw Tokens，也可 BYOK，再按指引选渠道。"
        }
      ],
      highlights: [
        "纯前端，无需登录",
        "所有命令一键复制",
        "中英双语随时切换",
        "支持 Telegram 与 Web Chat"
      ]
    },
    setup: {
      title: "安装向导",
      subtitle: "4 步完成：系统识别 → 一键安装 → API 配置 → 渠道选择。",
      steps: [
        {
          id: "os",
          title: "检测操作系统",
          description: "根据你的系统自动调整安装流程。"
        },
        {
          id: "install",
          title: "一键安装",
          description: "点击 Install 下载并运行 ClawLite 安装向导。"
        },
        {
          id: "api",
          title: "配置 API",
          description: "默认 LazyClaw Tokens（比官方 API 便宜 50%），也可 BYOK。"
        },
        {
          id: "channel",
          title: "选择渠道",
          description: "仅提供 Telegram/Web Chat 操作指引。"
        }
      ],
      sidebar: {
        title: "步骤",
        countLabel: "步"
      },
      buttons: {
        next: "下一步",
        back: "上一步",
        copy: "复制",
        copied: "已复制",
        openDocs: "查看文档",
        done: "完成",
        reset: "重新开始"
      },
      os: {
        autoDetected: "自动检测",
        prompt: "选择你的操作系统",
        macos: "macOS",
        windows: "Windows",
        linux: "Linux",
        checkCommandTitle: "自动检测系统"
      },
      install: {
        wizardTitle: "安装 ClawLite 向导",
        wizardDesc: "一键安装：根据你的系统下载对应安装向导。",
        installButton: "Install",
        allDownloads: "全部下载",
        commandTitle: "向导安装流程"
      },
      api: {
        modeTitle: "选择 API 配置方式",
        clawliteTitle: "LazyClaw Tokens（默认）",
        clawliteDesc: "比官方 API 价格低 50%，推荐优先使用。",
        byokTitle: "自带 API Key",
        byokDesc: "使用 OpenAI / Anthropic / 其他提供方的 Key。",
        emailLabel: "接收 Token 的邮箱",
        tokenLabel: "你的 ClawLite Token",
        sendLink: "发送登录链接",
        providerLabel: "提供方",
        keyLabel: "API Key",
        commandTitle: "应用配置（无需终端）",
        note: "我们不会在浏览器中保存你的 API Key。"
      },
      channel: {
        title: "选择渠道（仅操作指引）",
        telegram: "Telegram",
        webchat: "Web Chat",
        telegramSteps: [
          "打开 Telegram，搜索 @BotFather",
          "创建新 bot 并复制 Token",
          "在下方粘贴 Token"
        ],
        webchatSteps: [
          "无需额外配置",
          "启动后打开 Web Chat 链接",
          "分享给团队即可"
        ],
        botTokenLabel: "Telegram Bot Token",
        commandTitle: "连接渠道（无需终端）"
      },
      launch: {
        title: "启动 OpenClaw（无需终端）",
        successTitle: "已上线！🦞",
        successDesc: "发送第一条消息，观察智能体响应。",
        firstMsg: "可以尝试：你好 ClawLite，帮我规划今天",
        emailTitle: "可选：留下邮箱获取技巧",
        emailDesc: "BYOK 用户可领取最佳实践和更新。",
        emailLabel: "邮箱（可选）",
        submitEmail: "接收更新",
        skip: "跳过",
        privacy: "仅用于产品通知和使用技巧。"
      }
    },
    troubleshoot: {
      title: "常见问题排查",
      subtitle: "快速解决安装中的高频问题。",
      issues: [
        {
          title: "找不到 Node.js 命令",
          body: "重新安装 Node.js 并重启终端。macOS 请确认 Homebrew 在 PATH 中。"
        },
        {
          title: "npm 安装权限不足",
          body: "macOS/Linux 使用 sudo，Windows 以管理员身份运行终端。"
        },
        {
          title: "OpenClaw 启动后无响应",
          body: "检查 API Key 是否有效，渠道 Token 是否正确。"
        },
        {
          title: "Telegram 机器人收不到消息",
          body: "先给 bot 发送 /start，并确认 Token 无误。"
        },
        {
          title: "网络或代理问题",
          body: "尝试更换网络，或为 npm/OpenClaw 配置代理。"
        }
      ]
    },
    docsPage: {
      description: "打开 OpenClaw 官方文档（新标签页）。",
      back: "返回安装向导"
    },
    footer: {
      tagline: "为真人打造的安装体验，由 OpenClaw 提供支持。",
      cta: "准备开始了吗？"
    }
  }
} as const;
