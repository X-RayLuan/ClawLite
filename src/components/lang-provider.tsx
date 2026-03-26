"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { Lang } from "@/lib/content";

const LangContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
}>({
  lang: "en",
  setLang: () => {}
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({ lang: "en" as Lang, setLang: () => {} }), []);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
