"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setOs(detectOS());
  }, []);

  const osCommand = "Auto-detected in page";
  const apiCommand =
    apiMode === "clawlite"
      ? "Use LazyClaw Tokens (default, 50% discount vs official API pricing)"
      : `Provider: ${provider}\nAPI Key: ${apiKey ? "Configured in wizard" : "Pending"}`;

  const channelCommand =
    channel === "telegram"
      ? "Follow Telegram steps in wizard (instructions only)"
      : "Follow Web Chat steps in wizard (instructions only)";

  const steps = t.steps;
  const copyLabel = t.buttons.copy;
  const copiedLabel = t.buttons.copied;

  const nextStep = () => setCurrent((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrent((prev) => Math.max(prev - 1, 0));

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
                        label={t.os.checkCommandTitle}
                        command={osCommand}
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />
                    </div>
                  )}

                  {current === 1 && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-black/10 bg-white p-5">
                        <p className="text-sm font-semibold text-ink">{t.install.wizardTitle}</p>
                        <p className="mt-2 text-sm text-ink/65">{t.install.wizardDesc}</p>
                        <p className="mt-2 text-xs text-ink/50">
                          {t.os.autoDetected}: {t.os[os]}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Button type="button" onClick={nextStep}>
                            Continue web onboarding
                          </Button>
                        </div>
                      </div>

                      <CommandBlock
                        label={t.install.commandTitle}
command="Web onboarding only (no installer launch in setup flow)"
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />
                    </div>
                  )}

                  {current === 2 && (
                    <div className="space-y-6">
                      <p className="text-sm font-medium text-ink/70">{t.api.modeTitle}</p>
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
                          <p className="text-sm font-semibold">{t.api.clawliteTitle}</p>
                          <p className={cn("mt-2 text-sm", apiMode === "clawlite" ? "text-white/80" : "text-ink/70")}>
                            {t.api.clawliteDesc}
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
                          <p className="text-sm font-semibold">{t.api.byokTitle}</p>
                          <p className={cn("mt-2 text-sm", apiMode === "byok" ? "text-white/80" : "text-ink/70")}>
                            {t.api.byokDesc}
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

                      <CommandBlock
                        label={t.api.commandTitle}
                        command={apiCommand}
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />
                      <p className="text-xs text-ink/60">{t.api.note}</p>
                    </div>
                  )}

                  {current === 3 && (
                    <div className="space-y-6">
                      <p className="text-sm font-medium text-ink/70">{t.channel.title}</p>
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
                        label={t.channel.commandTitle}
                        command={channelCommand}
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />
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
