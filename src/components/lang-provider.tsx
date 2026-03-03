"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/content";

const LangContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
}>({
  lang: "en",
  setLang: () => {}
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("clawlite-lang") as Lang | null;
    if (stored === "en" || stored === "zh") {
      setLang(stored);
      return;
    }
    const browser = navigator.language.toLowerCase();
    if (browser.startsWith("zh")) {
      setLang("zh");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("clawlite-lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
