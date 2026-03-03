"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CommandBlock({
  command,
  label,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className
}: {
  command: string;
  label?: string;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <p className="text-sm font-medium text-ink/70">{label}</p> : null}
      <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-slate-950 px-4 py-3 text-slate-100 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <code className="text-sm">{command}</code>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCopy}
          className="bg-white/90 text-ink hover:bg-white"
        >
          {copied ? copiedLabel : copyLabel}
        </Button>
      </div>
    </div>
  );
}
