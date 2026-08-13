import { useEffect } from "react";
import { ScrollText } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useNarrate } from "@/hooks/use-narrate";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { clearBgm, startBgm } from "@/lib/audio";
import type { GameState } from "@/game/engine";

/**
 * Rapport nocturne du Maître du Jeu.
 * Écran 100 % silencieux : aucune narration vocale, aucun effet sonore, aucune
 * musique de fond tant que la carte est affichée.
 */
export function NightReportCard({
  state,
  onClose,
}: {
  state: GameState;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const narrate = useNarrate();
  const lines = state.nightReport ?? [];
  useScrollLock();

  useEffect(() => {
    // Silence total pendant la lecture du rapport.
    clearBgm();
  }, []);

  const close = () => {
    startBgm("DAY");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex w-screen max-w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <div className="surface-card animate-rise-in neon-ring mx-auto box-border max-h-[85vh] w-full max-w-sm shrink-0 space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain rounded-3xl p-6 shadow-2xl sm:max-w-md">
        <div className="flex items-center gap-2 text-primary">
          <ScrollText className="size-5" />
          <h2 className="text-lg font-black">
            {t("nightReportTitle", { n: state.night })}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">{t("nightReportSubtitle")}</p>
        <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
          {t("nightReportMuted")}
        </p>

        <section className="space-y-2">
          <h3 className="text-[11px] tracking-[0.3em] text-primary uppercase">
            {t("nightReportActions")}
          </h3>
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("nightReportEmpty")}</p>
          ) : (
            <ul className="space-y-2">
              {lines.map((line, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border px-3 py-2 text-sm leading-relaxed"
                >
                  {narrate(line)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-[11px] tracking-[0.3em] text-primary uppercase">
            {t("nightReportOutcomes")}
          </h3>
          <ul className="space-y-1">
            {state.dawnSummary.map((line, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {narrate(line)}
              </li>
            ))}
          </ul>
        </section>

        <button
          onClick={close}
          className="neon-ring w-full rounded-full bg-primary py-3 font-bold text-primary-foreground"
        >
          {t("nightReportClose")}
        </button>
      </div>
    </div>
  );
}
