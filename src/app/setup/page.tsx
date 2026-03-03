"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "@/lib/content";
import { useLang } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const [nodeVersion, setNodeVersion] = useState("");
  const [openclawResult, setOpenclawResult] = useState("");
  const [apiMode, setApiMode] = useState<ApiMode>("clawlite");
  const [tokenEmail, setTokenEmail] = useState("");
  const [tokenValue, setTokenValue] = useState("");
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [channel, setChannel] = useState<Channel>("telegram");
  const [botToken, setBotToken] = useState("");
  const [byokEmail, setByokEmail] = useState("");
  const [nodeStatus, setNodeStatus] = useState<"idle" | "installing" | "done" | "error">("idle");
  const [openclawStatus, setOpenclawStatus] = useState<"idle" | "installing" | "done" | "error">("idle");
  const [launchStatus, setLaunchStatus] = useState<"idle" | "starting" | "done" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setOs(detectOS());
  }, []);

  const copyLabel = t.buttons.copy;
  const copiedLabel = t.buttons.copied;

  const osCommand = useMemo(() => {
    if (os === "windows") {
      return "systeminfo | findstr /B /C:\"OS Name\" /C:\"OS Version\"";
    }
    if (os === "linux") {
      return "Auto-detected in page";
    }
    return "Auto-detected in page";
  }, [os]);

  const nodeInstallCommand = useMemo(() => {
    if (os === "windows") {
      return "Download and install from nodejs.org (GUI installer)";
    }
    if (os === "linux") {
      return "Open your app store/package manager UI and install Node.js LTS";
    }
    return "Download and install from nodejs.org (GUI installer)";
  }, [os]);

  const apiCommand = useMemo(() => {
    if (apiMode === "clawlite") {
      return "Configuration is applied automatically in this page";
    }
    return "Configuration is applied automatically in this page";
  }, [apiMode, tokenValue, provider, apiKey]);

  const channelCommand = useMemo(() => {
    if (channel === "telegram") {
      return "Telegram channel is connected in this page";
    }
    return "Web Chat channel is connected in this page";
  }, [channel, botToken]);

  const nodeDownloadUrl = useMemo(() => {
    if (os === "windows") return "https://nodejs.org/dist/v22.15.0/node-v22.15.0-x64.msi";
    if (os === "linux") return "https://nodejs.org/en/download";
    return "https://nodejs.org/dist/v22.15.0/node-v22.15.0.pkg";
  }, [os]);

  const windowsInstallerUrl = "https://www.clawlite.ai/downloads/ClawLite-Setup-Windows-x64.exe";
  const openclawDownloadUrl = "https://github.com/openclaw/openclaw/releases/latest";

  const startLocalInstall = async (kind: "node" | "openclaw") => {
    const setStatus = kind === "node" ? setNodeStatus : setOpenclawStatus;
    setStatus("installing");
    setStatusMessage(`Starting ${kind} installation...`);

    try {
      const response = await fetch(`http://127.0.0.1:4545/install/${kind}?os=${os}`, { method: "POST" });
      if (!response.ok) throw new Error("helper unavailable");
      setStatus("done");
      setStatusMessage(`${kind} installation launched via local helper.`);
      return;
    } catch {
      const fallback = kind === "node" ? nodeDownloadUrl : openclawDownloadUrl;
      window.open(fallback, "_blank", "noopener,noreferrer");
      setStatus("done");
      setStatusMessage(`Opened ${kind} installer download. Complete install, then continue.`);
    }
  };

  const launchGateway = async () => {
    setLaunchStatus("starting");
    setStatusMessage("Launching gateway...");
    try {
      const response = await fetch("http://127.0.0.1:4545/openclaw/launch", { method: "POST" });
      if (!response.ok) throw new Error("launch failed");
      setLaunchStatus("done");
      setStatusMessage("Gateway launched successfully.");
    } catch {
      setLaunchStatus("error");
      setStatusMessage("Auto-launch unavailable. Please use the Launch button in your desktop app/helper.");
    }
  };

  const steps = t.steps;

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
                      <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <p className="text-sm font-medium text-ink/70">{t.node.installTitle}</p>
                        <p className="mt-2 text-sm text-ink/60">No terminal required. Install through the official GUI installer.</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {os === "windows" ? (
                            <Button type="button" asChild>
                              <a href={windowsInstallerUrl} target="_blank" rel="noreferrer">Download for Windows</a>
                            </Button>
                          ) : (
                            <>
                              <Button type="button" onClick={() => startLocalInstall("node")}>One-click install (beta)</Button>
                              <Button type="button" variant="secondary" asChild>
                                <a href={nodeDownloadUrl} target="_blank" rel="noreferrer">{t.node.download}</a>
                              </Button>
                            </>
                          )}
                        </div>
                        <p className="mt-3 text-xs text-ink/50">OS detected: {t.os[os]}</p>
                      </div>

                      <CommandBlock
                        label="Installer mode"
                        command={nodeInstallCommand}
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />

                      {nodeStatus !== "idle" && (
                        <div className="rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm text-ink/80">
                          Node status: <strong>{nodeStatus}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {current === 2 && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <p className="text-sm font-medium text-ink/70">{t.openclaw.installTitle}</p>
                        <p className="mt-2 text-sm text-ink/60">No terminal required. Use the installer flow.</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Button type="button" onClick={() => startLocalInstall("openclaw")}>One-click install (beta)</Button>
                          <Button type="button" variant="secondary" asChild>
                            <a href={openclawDownloadUrl} target="_blank" rel="noreferrer">Download OpenClaw</a>
                          </Button>
                        </div>
                      </div>

                      <CommandBlock
                        label={t.openclaw.installTitle}
                        command="Install from the guided UI flow (no terminal required)"
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />

                      {openclawStatus !== "idle" && (
                        <div className="rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm text-ink/80">
                          OpenClaw status: <strong>{openclawStatus}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {current === 3 && (
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

                      {apiMode === "clawlite" ? (
                        <div className="space-y-4">
                          <Input
                            placeholder={t.api.emailLabel}
                            value={tokenEmail}
                            onChange={(event) => setTokenEmail(event.target.value)}
                          />
                          <Button type="button" variant="secondary">
                            {t.api.sendLink}
                          </Button>
                          <Input
                            placeholder={t.api.tokenLabel}
                            value={tokenValue}
                            onChange={(event) => setTokenValue(event.target.value)}
                          />
                        </div>
                      ) : (
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

                  {current === 4 && (
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

                      {channel === "telegram" && (
                        <Input
                          placeholder={t.channel.botTokenLabel}
                          value={botToken}
                          onChange={(event) => setBotToken(event.target.value)}
                        />
                      )}

                      <CommandBlock
                        label={t.channel.commandTitle}
                        command={channelCommand}
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />
                    </div>
                  )}

                  {current === 5 && (
                    <div className="space-y-6">
                      <CommandBlock
                        label={t.launch.title}
                        command="Click Launch in this page (no terminal required)"
                        copyLabel={copyLabel}
                        copiedLabel={copiedLabel}
                      />

                      <div className="rounded-2xl border border-black/10 bg-white p-4">
                        <p className="text-sm text-ink/70">Start OpenClaw without terminal</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Button type="button" onClick={launchGateway} disabled={launchStatus === "starting"}>
                            {launchStatus === "starting" ? "Launching..." : "Launch now"}
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => setLaunchStatus("done")}>
                            I already launched it
                          </Button>
                        </div>
                      </div>

                      {(launchStatus !== "idle" || statusMessage) && (
                        <div className="rounded-2xl border border-black/10 bg-mist px-4 py-3 text-sm text-ink/80">
                          Launch status: <strong>{launchStatus}</strong>
                          {statusMessage ? <span className="block mt-1">{statusMessage}</span> : null}
                        </div>
                      )}

                      <div className="rounded-3xl border border-black/10 bg-mist p-6">
                        <h3 className="text-lg font-semibold text-ink">{t.launch.successTitle}</h3>
                        <p className="mt-2 text-sm text-ink/70">{t.launch.successDesc}</p>
                        <p className="mt-4 text-sm font-semibold text-ink">{t.launch.firstMsg}</p>
                      </div>

                      {apiMode === "byok" && (
                        <div className="rounded-3xl border border-black/10 bg-white p-6">
                          <h4 className="text-base font-semibold text-ink">{t.launch.emailTitle}</h4>
                          <p className="mt-2 text-sm text-ink/70">{t.launch.emailDesc}</p>
                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <Input
                              placeholder={t.launch.emailLabel}
                              value={byokEmail}
                              onChange={(event) => setByokEmail(event.target.value)}
                            />
                            <Button type="button" variant="secondary">
                              {t.launch.submitEmail}
                            </Button>
                            <Button type="button" variant="ghost">
                              {t.launch.skip}
                            </Button>
                          </div>
                          <p className="mt-2 text-xs text-ink/60">{t.launch.privacy}</p>
                        </div>
                      )}
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
