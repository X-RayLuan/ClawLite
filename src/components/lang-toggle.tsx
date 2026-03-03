"use client";

import { useLang } from "@/components/lang-provider";
import { cn } from "@/lib/utils";

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-white/70 p-1 text-xs font-medium shadow-soft",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-3 py-1 transition",
          lang === "en" ? "bg-ink text-white" : "text-ink/70 hover:text-ink"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        className={cn(
          "rounded-full px-3 py-1 transition",
          lang === "zh" ? "bg-ink text-white" : "text-ink/70 hover:text-ink"
        )}
      >
        中文
      </button>
    </div>
  );
}
