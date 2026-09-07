import { useEffect } from "react";
import { ScrollText } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useNarrate } from "@/hooks/use-narrate";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { clearBgm, startBgm } from "@/lib/audio";
import { roleImage } from "@/data/roles";
import type { GameState } from "@/game/engine";

const OPEN = "\u27E6";
const CLOSE = "\u27E7";

/** Mapping direct : clé de rapport → ID de rôle pour l'illustration. */
const REPORT_ROLE_MAP: Record<string, string> = {
  repWolvesTarget: "loup-garou",
  repNoWolvesTarget: "loup-garou",
  repManiacTarget: "maniaque",
  repProtect: "salvateur",
  repVillageShield: "salvateur",
  repWitchLife: "sorciere",
  repWitchPoison: "sorciere",
  repSilence: "loup-noir",
  repSilenceSelf: "loup-noir",
  repInfect: "loup-noir",
  repThief: "voleur",
  repFaces: "trois-faces",
  repRenardConfidant: "renard",
  renardVagueAttack: "loup-garou",
  renardVagueProtect: "salvateur",
  renardVaguePoison: "sorciere",
  renardVagueManiac: "maniaque",
  renardVagueSilence: "loup-noir",
};

/** Extrait l'ID du rôle illustrant une ligne de rapport nocturne. */
function reportRoleId(line: string): string | null {
  const match = line.match(new RegExp(`${OPEN}(\\w+)${CLOSE}`));
  if (!match) return null;
  const key = match[1];

  if (key in REPORT_ROLE_MAP) return REPORT_ROLE_MAP[key];

  // Jetons avec variable de rôle imbriquée (repSeerCheck, repDied, repSavedBy…)
  const roleMatch = line.match(
    new RegExp(`${OPEN}@role${CLOSE}\\{"id":"([^"]+)"\\}`),
  );
  if (roleMatch) return roleMatch[1];

  return null;
}

/**
 * Rapport nocturne du Maître du Jeu.
 * Écran 100 % silencieux : aucune narration vocale, aucun effet sonore, aucune
 * musique de fond tant que la carte est affichée.
 * Chaque ligne est illustrée par la petite image du rôle concerné.
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
  const lines = state?.nightReport ?? [];
  useScrollLock();

  useEffect(() => {
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
              {lines.map((line, i) => {
                const roleId = reportRoleId(line);
                return (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl border border-border px-3 py-2 text-sm leading-relaxed"
                  >
                    {roleId && (
                      <img
                        src={roleImage(roleId)}
                        alt=""
                        loading="lazy"
                        className="size-8 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <span className="flex-1">{narrate(line)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-[11px] tracking-[0.3em] text-primary uppercase">
            {t("nightReportOutcomes")}
          </h3>
          <ul className="space-y-1">
            {(state?.dawnSummary ?? []).map((line, i) => (
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
