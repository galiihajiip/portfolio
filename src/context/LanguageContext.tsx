"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Language } from "@/types";
import { getTranslations, type TranslationKeys } from "@/i18n";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationKeys;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = localStorage.getItem("portfolio-lang") as Language | null;
      if (stored && (stored === "en" || stored === "id")) {
        setLangState(stored);
      }
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("portfolio-lang", newLang);
  }, []);

  const translations = getTranslations(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
