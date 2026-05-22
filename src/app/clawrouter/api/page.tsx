"use client";

import { useState } from "react";
import { useLang } from "@/components/lang-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LANG_CONTENT = {
  en: {
    title: "API Reference",
    subtitle: "Call any model with a single unified endpoint.",
    baseUrl: "Base URL",
    auth: "Authentication",
    authDesc: "Pass your API key as a Bearer token in the Authorization header.",
    envVar: "Environment variable",
    quickstart: "Quickstart",
    chatTitle: "Chat Completions",
    chatDesc: "The unified endpoint for all providers. Use the model prefix to specify which provider to route to.",
    endpoint: "Endpoint",
    method: "Method",
    chatExample: "Example",
    modelsTitle: "List Models",
    modelsDesc: "Get all available models and their metadata.",
    modelsExample: "Example",
    providerBadge: (p: string) => p,
    copyNote: "Copy any example by clicking it",
    codeBlock: "Code Example",
    note: "Note",
    noteText: "The unified /api/v1/chat/completions endpoint automatically routes to the correct upstream provider based on the model prefix.",
    langs: {
      curl: "cURL",
      python: "Python",
      js: "JavaScript",
    },
    errors: "Error Codes",
    error401: "401 Unauthorized — Invalid or missing API key",
    error402: "402 Payment Required — Insufficient balance",
    error400: "400 Bad Request — Invalid request body or model format",
    error500: "500 Internal Server Error — Server-side error",
  },
  zh: {
    title: "API 参考",
    subtitle: "一个统一端点，调用任意模型。",
    baseUrl: "请求地址",
    auth: "认证方式",
    authDesc: "在 Authorization header 中以 Bearer Token 形式传入你的 API Key。",
    envVar: "环境变量",
    quickstart: "快速开始",
    chatTitle: "对话补全（Chat Completions）",
    chatDesc: "统一端点，自动根据 model 前缀路由到对应 provider。",
    endpoint: "端点",
    method: "请求方法",
    chatExample: "示例",
    modelsTitle: "模型列表",
    modelsDesc: "获取所有可用模型及其元信息。",
    modelsExample: "示例",
    providerBadge: (p: string) => p,
    copyNote: "点击代码块即可复制",
    codeBlock: "代码示例",
    note: "注意",
    noteText: "统一端点 /api/v1/chat/completions 会根据 model 前缀自动路由到正确的上游 provider。",
    langs: {
      curl: "cURL",
      python: "Python",
      js: "JavaScript",
    },
    errors: "错误码",
    error401: "401 Unauthorized — API Key 无效或未提供",
    error402: "402 Payment Required — 余额不足",
    error400: "400 Bad Request — 请求体格式错误或 model 格式错误",
    error500: "500 Internal Server Error — 服务器内部错误",
  },
};

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
  };
  return (
    <div className="relative group">
      <pre className="bg-[#1a1a2e] text-green-400 text-sm p-4 rounded-lg overflow-x-auto font-mono cursor-pointer" onClick={handleCopy} title="Click to copy">
        <code>{code}</code>
      </pre>
      <span className="absolute top-2 right-2 text-[10px] text-white/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
        {lang}
      </span>
    </div>
  );
}

function ApiCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 border border-black/10 bg-white shadow-soft">
      <h2 className="font-display text-xl font-semibold text-ink mb-2">{title}</h2>
      {children}
    </Card>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold ${colors[method] || "bg-gray-100 text-gray-700"}`}>
      {method}
    </span>
  );
}

export default function ApiPage() {
  const { lang } = useLang();
  const t = (LANG_CONTENT as Record<string, typeof LANG_CONTENT.en>)[lang] || LANG_CONTENT.en;

  const examples = {
    chat: {
      curl: `curl https://clawlite.ai/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openai/gpt-5.2",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
      python: `import requests

response = requests.post(
    "https://clawlite.ai/api/v1/chat/completions",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "model": "openai/gpt-5.2",
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)
print(response.json())`,
      js: `const response = await fetch(
  "https://clawlite.ai/api/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.2",
      messages: [{ role: "user", content: "Hello!" }],
    }),
  }
);
const data = await response.json();
console.log(data);`,
    },
    models: {
      curl: `curl https://clawlite.ai/api/models`,
      python: `import requests

response = requests.get("https://clawlite.ai/api/models")
print(response.json())`,
      js: `const response = await fetch("https://clawlite.ai/api/models");
const data = await response.json();
console.log(data);`,
    },
  };

  const modelExamples = {
    curl: `curl https://clawlite.ai/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "anthropic/claude-sonnet-4-6",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
    python: `response = requests.post(
    "https://clawlite.ai/api/v1/chat/completions",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "model": "anthropic/claude-sonnet-4-6",
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)`,
    js: `const response = await fetch(
  "https://clawlite.ai/api/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4-6",
      messages: [{ role: "user", content: "Hello!" }],
    }),
  }
);`,
  };

  const minimaxExamples = {
    curl: `curl https://clawlite.ai/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "minimax/MiniMax-M2.7",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
    python: `response = requests.post(
    "https://clawlite.ai/api/v1/chat/completions",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "model": "minimax/MiniMax-M2.7",
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)`,
    js: `const response = await fetch(
  "https://clawlite.ai/api/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "minimax/MiniMax-M2.7",
      messages: [{ role: "user", content: "Hello!" }],
    }),
  }
);`,
  };

  const [activeTab, setActiveTab] = useState<"chat" | "models" | "agents">("chat");
  const [activeLang, setActiveLang] = useState<"curl" | "python" | "js">("curl");
  const [activeModelTab, setActiveModelTab] = useState<"openai" | "anthropic" | "minimax">("openai");
  const [activeAgent, setActiveAgent] = useState<"claude-code" | "codex" | "openclaw" | "hermes">("claude-code");

  return (
    <main className="gradient-bg min-h-screen">
      <section className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold text-ink mb-2">{t.title}</h1>
          <p className="text-ink/60 text-lg">{t.subtitle}</p>
        </div>

        {/* Base URL & Auth */}
        <ApiCard title={t.baseUrl}>
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm mb-4">
            https://clawlite.ai
          </div>
        </ApiCard>

        <div className="h-4" />

        <ApiCard title={t.auth}>
          <p className="text-ink/70 mb-4">{t.authDesc}</p>
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
            Authorization: Bearer YOUR_API_KEY
          </div>
        </ApiCard>

        <div className="h-4" />

        {/* Tab: Chat / Models */}
        <ApiCard title="">
          <div className="flex gap-1 mb-6 border-b border-black/5">
            <button
              onClick={() => setActiveTab("chat")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "chat" ? "border-blue-500 text-ink" : "border-transparent text-ink/40 hover:text-ink/70"
              }`}
            >
              {t.chatTitle}
            </button>
            <button
              onClick={() => setActiveTab("models")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "models" ? "border-blue-500 text-ink" : "border-transparent text-ink/40 hover:text-ink/70"
              }`}
            >
              {t.modelsTitle}
            </button>
            <button
              onClick={() => setActiveTab("agents")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "agents" ? "border-blue-500 text-ink" : "border-transparent text-ink/40 hover:text-ink/70"
              }`}
            >
              AI Agents
            </button>
          </div>

          {activeTab === "chat" && (
            <div>
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <MethodBadge method="POST" />
                  <span className="font-mono text-ink/70">/api/v1/chat/completions</span>
                </div>
              </div>
              <p className="text-ink/60 text-sm mb-6">{t.chatDesc}</p>

              {/* Model tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(["openai", "anthropic", "minimax"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setActiveModelTab(p)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeModelTab === p
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-ink/60 hover:bg-gray-200"
                    }`}
                  >
                    {p === "openai" ? "OpenAI" : p === "anthropic" ? "Anthropic" : "MiniMax"}
                  </button>
                ))}
              </div>

              <p className="text-xs text-ink/50 mb-2 font-medium">
                {activeModelTab === "openai"
                  ? "Model prefix: openai/ — routes via ezrouter to OpenAI-compatible endpoint"
                  : activeModelTab === "anthropic"
                  ? "Model prefix: anthropic/ — routes via ezrouter to Anthropic Messages API"
                  : "Model prefix: minimax/ — routes directly to MiniMax official API"}
              </p>

              <div className="flex gap-2 mb-4">
                {(["curl", "python", "js"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setActiveLang(l)}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                      activeLang === l
                        ? "bg-ink text-white"
                        : "bg-gray-100 text-ink/60 hover:bg-gray-200"
                    }`}
                  >
                    {t.langs[l]}
                  </button>
                ))}
              </div>

              <CodeBlock
                code={
                  activeModelTab === "openai"
                    ? examples.chat[activeLang]
                    : activeModelTab === "anthropic"
                    ? modelExamples[activeLang]
                    : minimaxExamples[activeLang]
                }
                lang={t.langs[activeLang]}
              />

              <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <strong>{t.note}:</strong> {t.noteText}
              </div>
            </div>
          )}

          {activeTab === "models" && (
            <div>
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <MethodBadge method="GET" />
                  <span className="font-mono text-ink/70">/api/models</span>
                </div>
              </div>
              <p className="text-ink/60 text-sm mb-6">{t.modelsDesc}</p>

              <div className="flex gap-2 mb-4">
                {(["curl", "python", "js"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setActiveLang(l)}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                      activeLang === l
                        ? "bg-ink text-white"
                        : "bg-gray-100 text-ink/60 hover:bg-gray-200"
                    }`}
                  >
                    {t.langs[l]}
                  </button>
                ))}
              </div>

              <CodeBlock code={examples.models[activeLang]} lang={t.langs[activeLang]} />
            </div>
          )}

          {activeTab === "agents" && (
            <div>
              <p className="text-ink/60 text-sm mb-6">
                Configure these AI coding agents to use ClawRouter. Set the base URL and API key in your config or environment.
              </p>

              {/* Agent selector */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {(["claude-code", "codex", "openclaw", "hermes"] as const).map((agent) => (
                  <button
                    key={agent}
                    onClick={() => setActiveAgent(agent)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      activeAgent === agent
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-ink/60 hover:bg-gray-200"
                    }`}
                  >
                    {agent === "claude-code" ? "Claude Code" :
                     agent === "codex" ? "Codex" :
                     agent === "openclaw" ? "OpenClaw" : "Hermes Agent"}
                  </button>
                ))}
              </div>

              {activeAgent === "claude-code" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-ink mb-1">Environment Variables</h3>
                    <CodeBlock
                      code={`export CLAUDE_API_KEY="your_clawrouter_api_key"
export CLAUDE_BASE_URL="https://clawlite.ai/v1"
export CLAUDE_MODEL="openai/gpt-5.2"`}
                      lang=".env"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-ink mb-1">Or in ~/.claude/settings.json</h3>
                    <CodeBlock
                      code={`{
  "api_key": "your_clawrouter_api_key",
  "base_url": "https://clawlite.ai/v1",
  "model": "openai/gpt-5.2"
}`}
                      lang="JSON"
                    />
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                    <strong>Tip:</strong> Set <code className="font-mono text-xs bg-green-100 px-1 rounded">CLAUDE_BASE_URL</code> to <code className="font-mono text-xs bg-green-100 px-1 rounded">https://clawlite.ai/v1</code> to route all calls through ClawRouter. Claude Code uses OpenAI-compatible endpoints.
                  </div>
                </div>
              )}

              {activeAgent === "codex" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-ink mb-1">Environment Variables</h3>
                    <CodeBlock
                      code={`export OPENAI_API_KEY="your_clawrouter_api_key"
export OPENAI_BASE_URL="https://clawlite.ai/v1"
export OPENAI_MODEL="openai/gpt-5.2"`}
                      lang=".env"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-ink mb-1">Or in project config</h3>
                    <CodeBlock
                      code={`# .codex/config
{
  "api_key": "your_clawrouter_api_key",
  "base_url": "https://clawlite.ai/v1",
  "model": "openai/gpt-5.2"
}`}
                      lang="JSON"
                    />
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                    <strong>Tip:</strong> Codex is OpenAI-compatible. Set <code className="font-mono text-xs bg-green-100 px-1 rounded">OPENAI_BASE_URL</code> to <code className="font-mono text-xs bg-green-100 px-1 rounded">https://clawlite.ai/v1</code> and use model IDs with <code className="font-mono text-xs bg-green-100 px-1 rounded">openai/</code> prefix.
                  </div>
                </div>
              )}

              {activeAgent === "openclaw" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-ink mb-1">Environment Variables</h3>
                    <CodeBlock
                      code={`export OPENAI_API_KEY="your_clawrouter_api_key"
export OPENAI_BASE_URL="https://clawlite.ai/v1"
export OPENAI_MODEL="openai/gpt-5.2"`}
                      lang=".env"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-ink mb-1">Or in ~/.openclaw/.env</h3>
                    <CodeBlock
                      code={`OPENAI_API_KEY=your_clawrouter_api_key
OPENAI_BASE_URL=https://clawlite.ai/v1
OPENAI_MODEL=openai/gpt-5.2`}
                      lang=".env"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-ink mb-1">Or via Gateway Config</h3>
                    <CodeBlock
                      code={`# In openclaw config (gateway.yaml or config.json)
model:
  provider: openai
  api_key: your_clawrouter_api_key
  base_url: https://clawlite.ai/v1
  model: openai/gpt-5.2`}
                      lang="YAML"
                    />
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                    <strong>Tip:</strong> OpenClaw uses the <code className="font-mono text-xs bg-green-100 px-1 rounded">OPENAI_BASE_URL</code> environment variable or <code className="font-mono text-xs bg-green-100 px-1 rounded">model.base_url</code> gateway config. Supports OpenAI-compatible API calls directly.
                  </div>
                </div>
              )}

              {activeAgent === "hermes" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-ink mb-1">Environment Variables</h3>
                    <CodeBlock
                      code={`export HERMES_API_KEY="your_clawrouter_api_key"
export HERMES_BASE_URL="https://clawlite.ai/v1"
export HERMES_MODEL="openai/gpt-5.2"`}
                      lang=".env"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-ink mb-1">Or in hermes.config.json</h3>
                    <CodeBlock
                      code={`{
  "api_key": "your_clawrouter_api_key",
  "base_url": "https://clawlite.ai/v1",
  "model": "openai/gpt-5.2"
}`}
                      lang="JSON"
                    />
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                    <strong>Tip:</strong> Hermes Agent uses OpenAI-compatible endpoints. Point <code className="font-mono text-xs bg-green-100 px-1 rounded">HERMES_BASE_URL</code> to <code className="font-mono text-xs bg-green-100 px-1 rounded">https://clawlite.ai/v1</code> and prefix model names with the provider (e.g. <code className="font-mono text-xs bg-green-100 px-1 rounded">openai/gpt-5.2</code>).
                  </div>
                </div>
              )}
            </div>
          )}
        </ApiCard>

        <div className="h-4" />

        {/* Error Codes */}
        <ApiCard title={t.errors}>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs">401 — {t.error401}</div>
            <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs">402 — {t.error402}</div>
            <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs">400 — {t.error400}</div>
            <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs">500 — {t.error500}</div>
          </div>
        </ApiCard>

        <div className="h-4" />

        {/* Model prefixes reference */}
        <ApiCard title="Model Prefix Reference">
          <p className="text-ink/60 text-sm mb-4">Use the model prefix to specify the provider:</p>
          <div className="space-y-2">
            {[
              { prefix: "openai/", models: "gpt-5.2, gpt-5, gpt-5-mini, o4-mini, ...", provider: "OpenAI" },
              { prefix: "anthropic/", models: "claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5, ...", provider: "Anthropic" },
              { prefix: "minimax/", models: "MiniMax-M2.7, MiniMax-M2.7-highspeed, MiniMax-M2.5, ...", provider: "MiniMax" },
            ].map((row) => (
              <div key={row.prefix} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <code className="font-mono text-sm text-blue-600 whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded shrink-0">
                  {row.prefix}
                </code>
                <div className="text-sm text-ink/70">
                  <span className="text-ink font-medium">{row.provider}</span>
                  <span className="mx-2 text-ink/30">—</span>
                  {row.models}
                </div>
              </div>
            ))}
          </div>
        </ApiCard>

        <div className="mt-8 text-center text-xs text-ink/40">
          Click any code block to copy • Base URL: https://clawlite.ai
        </div>
      </section>
    </main>
  );
}
