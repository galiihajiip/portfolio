import en from "./translations/en.json";
import id from "./translations/id.json";
import type { Language } from "@/types";

const translations = { en, id } as const;

export type TranslationKeys = typeof en;

export function getTranslations(lang: Language): TranslationKeys {
  return translations[lang];
}

export function t(lang: Language, key: string): string {
  const keys = key.split(".");
  let result: unknown = translations[lang];
  for (const k of keys) {
    if (result && typeof result === "object") {
      result = (result as Record<string, unknown>)[k];
    }
  }
  return typeof result === "string" ? result : key;
}
