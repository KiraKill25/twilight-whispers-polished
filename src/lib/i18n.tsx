import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fr, type Dictionary, type UiKey } from "./locales/fr";
import { en } from "./locales/en";
import { ar } from "./locales/ar";
import { es } from "./locales/es";
import { zh } from "./locales/zh";
import { pt } from "./locales/pt";
import { ru } from "./locales/ru";
import { de } from "./locales/de";
import { ROLE_BY_ID } from "@/data/roles";

export type Lang = "fr" | "en" | "ar" | "es" | "zh" | "pt" | "ru" | "de";

export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "en", label: "EN", name: "English" },
  { code: "ar", label: "AR", name: "العربية" },
  { code: "es", label: "ES", name: "Español" },
  { code: "zh", label: "ZH", name: "中文" },
  { code: "pt", label: "PT", name: "Português" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "de", label: "DE", name: "Deutsch" },
];

const DICTS: Record<Lang, Dictionary> = { fr, en, ar, es, zh, pt, ru, de };

export type TranslationKey = UiKey;

const KEY = "mvno-lang";

export interface RoleText {
  name: string;
  description: string;
  power: string;
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Traduction d'une clé d'interface, avec variables {x}. */
  t: (k: UiKey, vars?: Record<string, string | number>) => string;
  /** Nom / description / pouvoir traduits d'un rôle. */
  role: (id: string) => RoleText;
  /** Nom traduit d'un rôle (raccourci). */
  roleName: (id: string) => string;
  /** Consigne nocturne traduite d'un rôle. */
  prompt: (id: string) => string;
  /** Libellé de camp traduit. */
  team: (t: string) => string;
  dir: "ltr" | "rtl";
}

function interpolate(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) =>
    k in vars ? String(vars[k]) : m,
  );
}

function roleTextFor(lang: Lang, id: string): RoleText {
  const base = ROLE_BY_ID[id];
  const over = DICTS[lang]?.roles?.[id];
  return {
    name: over?.name ?? base?.name ?? id,
    description: over?.description ?? base?.description ?? "",
    power: over?.power ?? base?.power ?? "",
  };
}

// ── Standalone Reactive State Store (bypasses missing Provider) ──────
function getInitialLang(): Lang {
  if (typeof window === "undefined") return "fr";
  try {
    const saved = localStorage.getItem(KEY) as Lang | null;
    if (saved && DICTS[saved]) return saved;
  } catch {}
  return "fr";
}

let globalLang: Lang = getInitialLang();
const listeners = new Set<() => void>();

function notifyListeners() {
  if (typeof document !== "undefined") {
    const dir = globalLang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", globalLang);
  }
  listeners.forEach((l) => l());
}

export function setGlobalLang(l: Lang) {
  if (!DICTS[l]) return;
  globalLang = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {}
  notifyListeners();
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(globalLang);

  useEffect(() => {
    const handleChange = () => setLangState(globalLang);
    listeners.add(handleChange);
    notifyListeners();
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    setGlobalLang(l);
  }, []);

  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang] ?? fr;
    return {
      lang,
      setLang,
      t: (k, vars) => interpolate(dict.ui?.[k] ?? fr.ui[k] ?? String(k), vars),
      role: (id) => roleTextFor(lang, id),
      roleName: (id) => roleTextFor(lang, id).name,
      prompt: (id) => dict.prompts?.[id] ?? fr.prompts[id] ?? "",
      team: (t) => dict.teams?.[t] ?? fr.teams[t] ?? t,
      dir: lang === "ar" ? "rtl" : "ltr",
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = (): Ctx => {
  const ctx = useContext(I18nContext);
  const [localLang, setLocalLang] = useState<Lang>(globalLang);

  useEffect(() => {
    if (ctx) return;
    const handleChange = () => setLocalLang(globalLang);
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, [ctx]);

  if (ctx) return ctx;

  const activeLang = localLang;
  const dict = DICTS[activeLang] ?? fr;
  return {
    lang: activeLang,
    setLang: setGlobalLang,
    t: (k, vars) => interpolate(dict.ui?.[k] ?? fr.ui[k] ?? String(k), vars),
    role: (id) => roleTextFor(activeLang, id),
    roleName: (id) => roleTextFor(activeLang, id).name,
    prompt: (id) => dict.prompts?.[id] ?? fr.prompts[id] ?? "",
    team: (t) => dict.teams?.[t] ?? fr.teams[t] ?? t,
    dir: activeLang === "ar" ? "rtl" : "ltr",
  };
};
