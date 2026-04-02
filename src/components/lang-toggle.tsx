"use client";

import type { Lang } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useLang } from "@/components/lang-provider";

const languageOptions: Array<{ value: Lang; label: string }> = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "es", label: "Español" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" }
];

const selectLanguageLabel: Record<Lang, string> = {
  en: "Select language",
  zh: "选择语言",
  es: "Seleccionar idioma",
  ja: "言語を選択",
  ko: "언어 선택"
};

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div className={cn("relative", className)}>
      <label className="sr-only" htmlFor="site-language">
        {selectLanguageLabel[lang]}
      </label>
      <select
        id="site-language"
        value={lang}
        onChange={(event) => setLang(event.target.value as Lang)}
        className="min-w-[8.5rem] appearance-none rounded-full border border-black/10 bg-white/90 px-4 py-2 pr-9 text-sm font-medium text-ink shadow-sm transition hover:border-black/20 focus:outline-none focus:ring-2 focus:ring-ink/15"
        aria-label={selectLanguageLabel[lang]}
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-ink/50">
        ▾
      </span>
    </div>
  );
}
