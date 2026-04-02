"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/content";

const STORAGE_KEY = "clawlite-site-lang";

const LangContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
}>({
  lang: "en",
  setLang: () => {}
});

function isSupportedLang(value: string | null): value is Lang {
  return value === "en" || value === "zh" || value === "es" || value === "ja" || value === "ko";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isSupportedLang(stored)) {
        setLangState(stored);
      }
    } catch {
      return;
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang: (nextLang: Lang) => {
        setLangState(nextLang);
        try {
          window.localStorage.setItem(STORAGE_KEY, nextLang);
        } catch {
          return;
        }
      }
    }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
