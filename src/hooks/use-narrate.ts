import { useI18n } from "@/lib/i18n";
import { resolveNarration } from "@/lib/narration";

/** Traduit les phrases générées par le moteur dans la langue active. */
export function useNarrate(): (text?: string) => string {
  const { lang } = useI18n();
  return (text?: string) => (text ? resolveNarration(text, lang) : "");
}
