"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "@/lib/content";
import { useLang } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CommandBlock } from "@/components/command-block";
import { cn } from "@/lib/utils";

const osOptions = ["macos", "windows", "linux"] as const;
type OSOption = (typeof osOptions)[number];
type ApiMode = "clawlite" | "byok";
type Channel = "telegram" | "web";

function detectOS(): OSOption {
  if (typeof navigator === "undefined") return "macos";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux")) return "linux";
  return "macos";
}

export default function SetupPage() {
  const { lang } = useLang();
  const t = content[lang].setup;

  const [current, setCurrent] = useState(0);
  const [os, setOs] = useState<OSOption>("macos");
  const [apiMode, setApiMode] = useState<ApiMode>("clawlite");
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [channel, setChannel] = useState<Channel>("telegram");
  const [installerEmail, setInstallerEmail] = useState("");
  const [sendingInstallerLink, setSendingInstallerLink] = useState(false);
  const [installerMsg, setInstallerMsg] = useState<string | null>(null);

  useEffect(() => {
    setOs(detectOS());
  }, []);

  const osCommand = "Auto-detected in page";

  const steps = t.steps;
  const copyLabel = t.buttons.copy;
  const copiedLabel = t.buttons.copied;

  const nextStep = () => setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrent((prev) => Math.max(prev - 1, 0));

  const sendInstallerLink = async () => {
    if (!installerEmail.trim()) {
      setInstallerMsg("Please enter your email first.");
      return;
    }

    setSendingInstallerLink(true);
    setInstallerMsg(null);
    try {
      const response = await fetch('/api/send-installer-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: installerEmail.trim(), os })
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to send installer link');
      }

      setInstallerMsg('Installer link sent. Please check your inbox.');
    } catch (error: any) {
      setInstallerMsg(error?.message || 'Failed to send installer link');
    } finally {
      setSendingInstallerLink(false);
    }
  };

  return (
    <main className="gradient-bg min-h-screen">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">{t.title}</h1>
            <p className="text-ink/70">{t.subtitle}</p>
          </div>
          <Badge>{steps[current].title}</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{t.sidebar.title}</CardTitle>
              <CardDescription>
                {steps.length} {t.sidebar.countLabel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {steps.map((step, index) => (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => setCurrent(index)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                        index === current
                          ? "border-ink bg-ink text-white shadow-glow"
                          : "border-black/5 bg-white hover:border-black/20"
                      )}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span>
                        <span className="block font-semibold">{step.title}</span>
                        <span className={cn("text-xs", index === current ? "text-white/80" : "text-ink/60")}>
                          {step.description}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <AnimatePresence mode="wait">
              <motion.div
                key={steps[current].id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <CardTitle>{steps[current].title}</CardTitle>
                  <CardDescription>{steps[current].description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {current === 0 && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-black/5 bg-mist px-4 py-3 text-sm">
                        {t.os.autoDetected}: <strong>{t.os[os]}</strong>
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-ink/75">
                        <p className="font-semibold text-ink">Step 1 — Environment Preparation (Beginner)</p>
                        <ul className="mt-2 space-y-1">
                          <li>• OS: macOS / Linux / Windows (WSL required)</li>
                          <li>• Node.js: v18 or higher</li>
                          <li>• API key: Claude or GPT</li>
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-ink/70">{t.os.prompt}</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {osOptions.map((option) => (
                            <Button
                              key={option}
                              type="button"
                              variant={os === option ? "primary" : "secondary"}
                              onClick={() => setOs(option)}
                            >
                              {t.os[option]}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <CommandBlock
                        label="Check Node.js version"
                        command="node --version"
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />

                      <CommandBlock
                        label="If Node < 18 (macOS/Linux)"
                        command="nvm install 18\nnvm use 18"
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />

                      <div className="rounded-2xl border border-sea/20 bg-sea/5 px-4 py-3 text-sm text-ink/75">
                        ✅ Completion criteria: terminal shows Node.js version <strong>&gt;= v18.0.0</strong>
                      </div>
                    </div>
                  )}

                  {current === 1 && (
                    <div className="space-y-6" id="installer">
                      {os === 'macos' ? (
                        <>

                          <div className="space-y-3">
                            <label className="text-sm font-medium text-ink/80">Email</label>
                            <Input
                              type="email"
                              placeholder="you@company.com"
                              value={installerEmail}
                              onChange={(event) => setInstallerEmail(event.target.value)}
                            />
                            <Button type="button" onClick={sendInstallerLink} disabled={sendingInstallerLink}>
                              {sendingInstallerLink ? 'Sending...' : 'Download Installer'}
                            </Button>
                            {installerMsg && (
                              <p className="text-sm text-ink/70">{installerMsg}</p>
                            )}
                          </div>

                          <div className="rounded-2xl border border-coral/20 bg-coral/5 px-4 py-3 text-sm text-ink/75">
                            If you do not receive the email within 1-2 minutes, check spam/junk folder.
                          </div>
                        </>
                      ) : (
                        <>

                          <CommandBlock
                            label="Method 1 (Beginner recommended): NPM"
                            command="npm install -g openclaw\nopenclaw --version"
                            copyLabel={copyLabel}
                            copiedLabel={copiedLabel}
                          />

                          <CommandBlock
                            label="Method 2: Docker"
                            command="docker pull openclaw/openclaw:latest\ndocker run -d --name openclaw \\\n-v ~/.openclaw:/root/.openclaw \\\nopenclaw/openclaw:latest"
                            copyLabel={copyLabel}
                            copiedLabel={copiedLabel}
                          />

                          <CommandBlock
                            label="Method 3: Source (Developer)"
                            command="git clone https://github.com/openclaw/openclaw.git\ncd openclaw\nnpm install\nnpm run start"
                            copyLabel={copyLabel}
                            copiedLabel={copiedLabel}
                          />

                          <div className="rounded-2xl border border-sea/20 bg-sea/5 px-4 py-3 text-sm text-ink/75">
                            ✅ Completion criteria: <strong>openclaw --version</strong> or <strong>openclaw --help</strong> works normally.
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {current === 2 && (
                    <div className="space-y-6" id="wizard">
                      <p className="text-sm font-medium text-ink/70">Step 3 — Initial Configuration (Wizard-first, beginner mode)</p>

                      <CommandBlock
                        label="Start onboarding wizard"
                        command="openclaw onboard"
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />

                      <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-ink/75">
                        <p className="font-semibold text-ink">The wizard will guide you through:</p>
                        <ul className="mt-2 space-y-1">
                          <li>1) Choose provider (Claude / GPT / local model)</li>
                          <li>2) Enter API key</li>
                          <li>3) Select messaging platform (Telegram / Discord / WhatsApp / Web)</li>
                          <li>4) Configure permissions (sandbox recommended)</li>
                        </ul>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setApiMode("clawlite")}
                          className={cn(
                            "rounded-2xl border px-4 py-4 text-left transition",
                            apiMode === "clawlite"
                              ? "border-ink bg-ink text-white shadow-glow"
                              : "border-black/10 bg-white"
                          )}
                        >
                          <p className="text-sm font-semibold">Use ClawLite tokens</p>
                          <p className={cn("mt-2 text-sm", apiMode === "clawlite" ? "text-white/80" : "text-ink/70")}>
                            Faster start, managed billing, no manual provider setup.
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setApiMode("byok")}
                          className={cn(
                            "rounded-2xl border px-4 py-4 text-left transition",
                            apiMode === "byok"
                              ? "border-ink bg-ink text-white shadow-glow"
                              : "border-black/10 bg-white"
                          )}
                        >
                          <p className="text-sm font-semibold">BYOK</p>
                          <p className={cn("mt-2 text-sm", apiMode === "byok" ? "text-white/80" : "text-ink/70")}>
                            Use your own provider and API key.
                          </p>
                        </button>
                      </div>

                      {apiMode === "byok" && (
                        <div className="space-y-4">
                          <Input
                            placeholder={t.api.providerLabel}
                            value={provider}
                            onChange={(event) => setProvider(event.target.value)}
                          />
                          <Input
                            placeholder={t.api.keyLabel}
                            value={apiKey}
                            onChange={(event) => setApiKey(event.target.value)}
                          />
                        </div>
                      )}

                      <div className="rounded-2xl border border-sea/20 bg-sea/5 px-4 py-3 text-sm text-ink/75">
                        ✅ Completion criteria: API key configured + at least one channel selected + permission settings completed (sandbox recommended).
                      </div>
                    </div>
                  )}

                  {current === 3 && (
                    <div className="space-y-6">
                      <p className="text-sm font-medium text-ink/70">Step 4 — Connect channel and complete first hello conversation</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setChannel("telegram")}
                          className={cn(
                            "rounded-2xl border px-4 py-4 text-left transition",
                            channel === "telegram"
                              ? "border-ink bg-ink text-white shadow-glow"
                              : "border-black/10 bg-white"
                          )}
                        >
                          <p className="text-sm font-semibold">{t.channel.telegram}</p>
                          <ul className={cn("mt-2 space-y-1 text-xs", channel === "telegram" ? "text-white/80" : "text-ink/70")}>
                            {t.channel.telegramSteps.map((step) => (
                              <li key={step}>• {step}</li>
                            ))}
                          </ul>
                        </button>
                        <button
                          type="button"
                          onClick={() => setChannel("web")}
                          className={cn(
                            "rounded-2xl border px-4 py-4 text-left transition",
                            channel === "web"
                              ? "border-ink bg-ink text-white shadow-glow"
                              : "border-black/10 bg-white"
                          )}
                        >
                          <p className="text-sm font-semibold">{t.channel.webchat}</p>
                          <ul className={cn("mt-2 space-y-1 text-xs", channel === "web" ? "text-white/80" : "text-ink/70")}>
                            {t.channel.webchatSteps.map((step) => (
                              <li key={step}>• {step}</li>
                            ))}
                          </ul>
                        </button>
                      </div>

                      <CommandBlock
                        label="Verification command"
                        command="Send: hello"
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />
                      <div className="rounded-2xl border border-sea/20 bg-sea/5 px-4 py-3 text-sm text-ink/75">
                        Setup is only complete when you receive a real assistant reply to <strong>hello</strong>.
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white p-5">
                        <p className="text-sm font-semibold text-ink">Need full tutorial?</p>
                        <p className="mt-2 text-sm text-ink/70">
                          Download the complete beginner-to-intermediate OpenClaw tutorial PDF.
                        </p>
                        <div className="mt-4">
                          <Button asChild variant="secondary">
                            <Link href="/downloads/openclaw-tutorial-beginner-to-intermediate-en.pdf" target="_blank" download>
                              Download Tutorial PDF
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between border-t border-black/5 px-6 py-4">
              <Button type="button" variant="secondary" onClick={prevStep} disabled={current === 0}>
                {t.buttons.back}
              </Button>
              <div className="text-xs text-ink/60">
                {current + 1} / {steps.length}
              </div>
              <Button type="button" onClick={nextStep} disabled={current === steps.length - 1}>
                {current === steps.length - 1 ? t.buttons.done : t.buttons.next}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
