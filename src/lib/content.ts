export type Lang = "en" | "zh";

export const content = {
  en: {
    nav: {
      home: "Home",
      setup: "Setup",
      troubleshoot: "Troubleshoot",
      docs: "Docs"
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
          title: "Detect OS & install Node",
          body: "Get the right commands for your system."
        },
        {
          title: "Install OpenClaw CLI",
          body: "One command and you are ready."
        },
        {
          title: "Connect a channel",
          body: "Telegram or Web Chat in minutes."
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
      subtitle: "Follow the 6 steps. You can switch language anytime.",
      steps: [
        {
          id: "os",
          title: "Detect Your OS",
          description: "We tailor the setup flow based on your system. No terminal required."
        },
        {
          id: "node",
          title: "Install Node.js",
          description: "Install Node.js with the official installer (GUI only). No terminal required."
        },
        {
          id: "openclaw",
          title: "Install OpenClaw",
          description: "Install OpenClaw with the guided UI flow. No terminal required."
        },
        {
          id: "api",
          title: "Configure API Key",
          description: "Use the default ClawLite Token or bring your own key."
        },
        {
          id: "channel",
          title: "Choose Channel",
          description: "Connect Telegram or Web Chat to talk with your agent."
        },
        {
          id: "launch",
          title: "Launch & Celebrate",
          description: "Launch from the page and send your first message."
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
      node: {
        checkTitle: "Check if Node.js is installed (assistant verifies)",
        pasteLabel: "Version check is handled automatically",
        installTitle: "Install Node.js",
        download: "Download Node.js"
      },
      openclaw: {
        installTitle: "Install OpenClaw",
        resultLabel: "Paste install result (optional)",
        tipsTitle: "Common issues",
        tips: [
          "Permission error? Try running with sudo (Linux/macOS).",
          "Slow network? Switch npm registry or retry later.",
          "Windows: run terminal as Administrator."
        ]
      },
      api: {
        modeTitle: "Choose API setup",
        clawliteTitle: "ClawLite Token (Recommended)",
        clawliteDesc: "Sign in with email to get a token. We configure everything for you.",
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
        title: "Pick a channel",
        telegram: "Telegram (Recommended)",
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
      docs: "文档"
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
          title: "检测系统并安装 Node",
          body: "自动推荐对应命令。"
        },
        {
          title: "安装 OpenClaw CLI",
          body: "一个命令即可完成。"
        },
        {
          title: "连接渠道（无需终端）",
          body: "Telegram 或 Web Chat 任选。"
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
      subtitle: "跟着 6 个步骤完成配置，可随时切换语言。",
      steps: [
        {
          id: "os",
          title: "检测操作系统",
          description: "根据你的系统自动调整流程。全程无需终端命令。"
        },
        {
          id: "node",
          title: "安装 Node.js",
          description: "通过官方安装器安装 Node.js（图形界面）。无需终端命令。"
        },
        {
          id: "openclaw",
          title: "安装 OpenClaw",
          description: "通过页面引导完成 OpenClaw 安装，无需终端命令。"
        },
        {
          id: "api",
          title: "配置 API Key",
          description: "默认推荐 ClawLite Token，也可自带 Key。"
        },
        {
          id: "channel",
          title: "选择连接渠道（无需终端）",
          description: "连接 Telegram 或 Web Chat。"
        },
        {
          id: "launch",
          title: "启动完成",
          description: "在页面内启动并发送第一条消息。"
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
      node: {
        checkTitle: "检查 Node.js 是否安装（由助手自动验证）",
        pasteLabel: "版本检查由系统自动完成",
        installTitle: "安装 Node.js",
        download: "下载 Node.js"
      },
      openclaw: {
        installTitle: "安装 OpenClaw",
        resultLabel: "粘贴安装结果（可选）",
        tipsTitle: "常见问题",
        tips: [
          "权限不足？macOS/Linux 可尝试 sudo。",
          "网络慢？可切换 npm 源或稍后重试。",
          "Windows 请以管理员身份运行终端。"
        ]
      },
      api: {
        modeTitle: "选择 API 配置方式",
        clawliteTitle: "ClawLite Token（推荐）",
        clawliteDesc: "邮箱注册/登录即可获得 Token，自动配置。",
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
        title: "选择一个渠道",
        telegram: "Telegram（推荐）",
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
