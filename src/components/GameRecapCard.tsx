import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Heart, Moon, Share2, Shield, Skull, Sun, Trophy, Users, Zap } from "lucide-react";
import { ROLE_BY_ID } from "@/data/roles";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MuteButton } from "@/components/MuteButton";
import { RecapWolfEmblem } from "@/components/RecapWolfEmblem";
import { EvaluationSection } from "@/components/EvaluationSection";

import { useI18n, type TranslationKey } from "@/lib/i18n";
import { useNarrate } from "@/hooks/use-narrate";
import {
  effectiveRoleId,
  type DeathCause,
  type GameEvent,
  type GameState,
  type Player,
} from "@/game/engine";

/** One round of village voting recorded for post-game analytics. */
export interface VoteRecord {
  day: number;
  votes: { id: string; name: string; count: number }[];
  /** Bulletins détaillés (capitaine : 2 points, éventuellement séparés). */
  ballots?: {
    voterId: string;
    voterName: string;
    targets: string[];
    abstained?: boolean;
  }[];
  eliminated: { id: string; name: string; roleId: string; team: string }[];
  isRevote: boolean;
}

/** Score-based MVP: survival > captain > winning-team alignment. */
export function computeMvp(
  players: Player[],
  winnerTeam?: string,
): { player: Player; score: number } {
  const results = players.map((p) => {
    let score = 0;
    if (p.alive) score += 5;
    if (p.isCaptain) score += 2;
    const isWolf = p.team === "WEREWOLVES" || !!p.isConvertedToWolf;
    const wins =
      (winnerTeam === "WOLVES" && isWolf) ||
      (winnerTeam === "VILLAGE" && !isWolf && p.team === "VILLAGEOIS") ||
      (winnerTeam === "LOVERS" && p.team === "LOVERS") ||
      (winnerTeam === "PIPER" && effectiveRoleId(p) === "joueur-de-flute");
    if (wins) score += 3;
    return { player: p, score };
  });
  return results.sort((a, b) => b.score - a.score)[0]!;
}

const CAUSE_KEY: Record<DeathCause, TranslationKey> = {
  WOLVES: "causeWolves",
  WITCH_POISON: "causePoison",
  WHITE_WOLF_KILL: "causeWhiteWolf",
  HUNTER_SHOT: "causeHunter",
  HEARTBREAK: "causeHeartbreak",
  VILLAGE_VOTE: "causeVote",
  JAILER_EXECUTION: "causeJailer",
  SPY_DETECTED: "causeSpy",
  TALKATIVE_WOLF: "causeTalkative",
  GENERAL_STRIKE: "causeGeneralStrike",
  GENERAL_FAILED: "causeGeneralFailed",
  MANIAC: "causeManiac",
  THREE_FACES_POISON: "causeThreeFacesPoison",
  SUICIDE_REVEAL: "causeSuicide",
};

/** Classes statiques par accent (Tailwind ne compile pas les noms dynamiques). */
const ACCENT = {
  destructive: {
    border: "border-destructive/50",
    cardBorder: "border-destructive/40",
    glow: "bg-destructive/20",
    text: "text-destructive",
  },
  primary: {
    border: "border-primary/50",
    cardBorder: "border-primary/40",
    glow: "bg-primary/20",
    text: "text-primary",
  },
  accent: {
    border: "border-accent/50",
    cardBorder: "border-accent/40",
    glow: "bg-accent/20",
    text: "text-accent",
  },
} as const;

type AccentKey = keyof typeof ACCENT;

/** Accent per faction: crimson wolves, primary village, violet specials. */
function factionAccent(p: Player): AccentKey {
  const isWolf = p.team === "WEREWOLVES" || !!p.isConvertedToWolf;
  if (isWolf) return "destructive";
  if (p.team === "SOLO" || p.team === "LOVERS") return "accent";
  return "primary";
}

const spring = { type: "spring" as const, stiffness: 220, damping: 24 };

/**
 * Carte de bilan post-partie : bannière de victoire, grille des joueurs
 * avec animation de retournement, frise chronologique et actions.
 */
export function GameRecapCard({
  state,
  voteHistory,
  onRestart,
  onPlayAgain,
}: {
  state: GameState;
  voteHistory: VoteRecord[];
  onRestart: () => void;
  onPlayAgain: () => void;
}) {
  const { t, roleName, team: teamLabel } = useI18n();
  const narrate = useNarrate();
  const [copied, setCopied] = useState(false);

  const wolves = state.winnerTeam === "WOLVES";
  const survivors = state.players.filter((p) => p.alive).length;
  const duration = state.day ?? 1;
  const { player: mvp, score: mvpScore } = computeMvp(state.players, state.winnerTeam);

  const victoryKey: TranslationKey = wolves
    ? state.players.some((p) => p.isConvertedToWolf)
      ? "recapVictoryBlackWolf"
      : "recapVictoryWolves"
    : state.winnerTeam === "VILLAGE"
      ? "recapVictoryVillage"
      : state.players.some((p) => p.alive && p.team === "LOVERS")
        ? "recapVictoryLovers"
        : "recapVictorySolo";

  const accent: AccentKey = wolves
    ? "destructive"
    : state.winnerTeam === "VILLAGE"
      ? "primary"
      : "accent";

  // Frise : évènements du moteur regroupés par tour.
  const events: GameEvent[] = state.events ?? [];
  const rounds = [...new Set(events.map((e) => e.round))].sort((a, b) => a - b);

  const allEliminated = voteHistory.flatMap((r) => r.eliminated);
  const wolfElims = allEliminated.filter((e) => e.team === "WEREWOLVES").length;
  const villageElims = allEliminated.filter((e) => e.team !== "WEREWOLVES").length;
  const totalElims = wolfElims + villageElims;
  const villagePct = totalElims > 0 ? Math.round((wolfElims / totalElims) * 100) : 0;
  const wolfPct = totalElims > 0 ? Math.round((villageElims / totalElims) * 100) : 0;

  const share = async () => {
    const lines = [
      `${t("bilanTitle")} — ${t(victoryKey)}`,
      `${t("bilanDuration", { d: duration })} · ${t("bilanSurvivors", { n: survivors })}`,
      "",
      ...state.players.map((p) => {
        const rid = p.originalRoleId ?? effectiveRoleId(p);
        const status = p.isConvertedToWolf
          ? t("statusContaminated")
          : p.alive
            ? t("statusAlive")
            : t("statusDead");
        return `• ${p.name} — ${roleName(rid)} — ${status}`;
      }),
      "",
      `${t("bilanMvp")}: ${mvp.name} (${t("bilanMvpScore", { n: mvpScore })})`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard indisponible */
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
      className="mx-auto max-w-lg space-y-4 px-4 py-8"
    >
      <header className="flex items-center justify-between gap-2">
        <MuteButton />
        <LanguageSwitcher />
      </header>

      {/* ── Bannière de victoire ── */}
      <motion.section
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...spring, delay: 0.05 }}
        className={`surface-card relative overflow-hidden rounded-3xl p-6 text-center ${ACCENT[accent].border}`}
      >
        <motion.div
          aria-hidden
          animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.15, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className={`pointer-events-none absolute inset-0 ${ACCENT[accent].glow} blur-2xl`}
        />
        <div className="relative space-y-3">
          <RecapWolfEmblem />
          <h1 className={`neon-text text-2xl font-black text-gold`}>
            {t(victoryKey)}
          </h1>

          <p className="text-sm text-muted-foreground">{state.winner ? narrate(state.winner) : t("gameOverFallback")}</p>
          <div className="flex flex-wrap justify-center gap-3 pt-1 text-xs text-muted-foreground">
            <span>{t("bilanDuration", { d: duration })}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {t("bilanSurvivors", { n: survivors })}
            </span>
          </div>
        </div>
      </motion.section>

      {/* ── MVP ── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.12 }}
        className="surface-card rounded-3xl p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="size-4 text-gold" />
          <p className="text-[11px] tracking-[0.3em] text-gold uppercase">{t("bilanMvp")}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="mvp-shimmer-text text-xl font-black">{mvp.name}</p>
            <p className="text-xs text-muted-foreground">
              {roleName(mvp.originalRoleId ?? effectiveRoleId(mvp))}
              {mvp.isCaptain && <span className="text-accent"> · {t("captain")}</span>}
            </p>
          </div>
          <div className="text-end">
            <p className="text-2xl font-black text-gold">{t("bilanMvpScore", { n: mvpScore })}</p>
            <p className="text-[10px] text-muted-foreground">
              {mvp.alive ? t("statusAlive") : t("statusDead")}
            </p>
          </div>
        </div>
      </motion.section>

      <EvaluationSection state={state} voteHistory={voteHistory} />

      {/* ── Grille des joueurs (retournement en cascade) ── */}
      <section className="space-y-3">
        <h2 className="text-[11px] tracking-[0.3em] text-primary uppercase">{t("recapRoster")}</h2>
        <div className="grid grid-cols-2 gap-3">
          {state.players.map((p, i) => {
            const rid = p.originalRoleId ?? effectiveRoleId(p);
            const role = ROLE_BY_ID[rid];
            const color = factionAccent(p);
            return (
              <motion.article
                key={p.id}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ transformStyle: "preserve-3d" }}
                className={`surface-card space-y-1 rounded-2xl ${ACCENT[color].cardBorder} p-3 transition-colors`}
              >
                <div className="flex items-center gap-1">
                  <p className="truncate text-sm font-black">{p.name}</p>
                  {p.isCaptain && <Crown className="size-3.5 text-accent" />}
                  {p.team === "LOVERS" && <Heart className="size-3.5 text-accent" />}
                </div>
                <p className={`truncate text-[11px] ${ACCENT[color].text}`}>{roleName(rid)}</p>
                <p className="text-[10px] text-muted-foreground">{role ? teamLabel(p.team) : ""}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {p.alive ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                      {t("statusAlive")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive uppercase">
                      <Skull className="size-3" /> {t("statusDead")}
                    </span>
                  )}
                  {p.isConvertedToWolf && (
                    <motion.span
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent uppercase"
                    >
                      <Zap className="size-3" /> {t("statusContaminated")}
                    </motion.span>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ── Frise chronologique ── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.2 }}
        className="surface-card space-y-3 rounded-3xl p-4"
      >
        <p className="text-[11px] tracking-[0.3em] text-primary uppercase">{t("recapTimeline")}</p>
        {rounds.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("recapNoEvents")}</p>
        ) : (
          <ol className="space-y-3 border-s border-border ps-4">
            {rounds.map((r) => (
              <li key={r} className="space-y-1">
                {(["NIGHT", "DAY"] as const).map((phase) => {
                  const list = events.filter((e) => e.round === r && e.phase === phase);
                  if (list.length === 0) return null;
                  return (
                    <div key={phase} className="space-y-1">
                      <p className="flex items-center gap-1 text-[11px] font-bold text-foreground uppercase">
                        {phase === "NIGHT" ? (
                          <Moon className="size-3 text-primary" />
                        ) : (
                          <Sun className="size-3 text-gold" />
                        )}
                        {phase === "NIGHT" ? t("recapNightN", { n: r }) : t("recapDayN", { n: r })}
                      </p>
                      {list.map((e, idx) => (
                        <motion.p
                          key={`${phase}-${idx}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + idx * 0.05 }}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          {e.type === "KILL" && (
                            <Skull className="size-3 shrink-0 text-destructive" />
                          )}
                          {e.type === "RESCUE" && (
                            <Shield className="size-3 shrink-0 text-primary" />
                          )}
                          {e.type === "CONTAMINATION" && (
                            <Zap className="size-3 shrink-0 text-accent" />
                          )}
                          <span className="font-semibold text-foreground">{e.name}</span>
                          <span>
                            {e.type === "KILL" && e.cause
                              ? t(CAUSE_KEY[e.cause])
                              : e.type === "RESCUE"
                                ? t("recapRescued", {
                                    role: e.bySavior ? roleName(e.bySavior) : "—",
                                  })
                                : t("recapContaminatedBy")}
                          </span>
                        </motion.p>
                      ))}
                    </div>
                  );
                })}
              </li>
            ))}
          </ol>
        )}
      </motion.section>

      {/* ── Domination stratégique ── */}
      {totalElims > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.26 }}
          className="surface-card space-y-3 rounded-3xl p-4"
        >
          <p className="text-[11px] tracking-[0.3em] text-primary uppercase">
            {t("bilanTeamDomination")}
          </p>
          {[
            {
              label: t("bilanVillageCtrl", { pct: villagePct }),
              pct: villagePct,
              bar: "bg-primary",
            },
            { label: t("bilanWolfCtrl", { pct: wolfPct }), pct: wolfPct, bar: "bg-destructive" },
          ].map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-bold text-foreground">{row.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-input">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.pct}%` }}
                  transition={{ duration: 0.9, delay: 0.35 }}
                  className={`h-full rounded-full ${row.bar}`}
                />
              </div>
            </div>
          ))}
          {villagePct === wolfPct && (
            <p className="text-center text-xs text-muted-foreground">{t("bilanBalanced")}</p>
          )}
        </motion.section>
      )}

      {/* ── Historique des votes ── */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.32 }}
        className="surface-card space-y-3 rounded-3xl p-4"
      >
        <p className="text-[11px] tracking-[0.3em] text-primary uppercase">
          {t("bilanVoteHistory")}
        </p>
        {voteHistory.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("bilanNoVotes")}</p>
        ) : (
          <div className="space-y-3">
            {voteHistory.map((record, idx) => {
              const dayLabel = `${t("bilanDayVote", { n: record.day })}${record.isRevote ? t("bilanRevoteSuffix") : ""}`;
              const elimNames = record.eliminated.map((e) => e.name).join(", ");
              const topVotes = [...record.votes].sort((a, b) => b.count - a.count).slice(0, 3);
              return (
                <div key={idx} className="space-y-2 rounded-2xl border border-border p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{dayLabel}</span>
                    <span
                      className={`font-semibold ${record.eliminated.length > 0 ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {record.eliminated.length > 0
                        ? t("bilanElim", { names: elimNames })
                        : t("bilanNobodyElim")}
                    </span>
                  </div>
                  {topVotes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topVotes.map((v) => (
                        <span
                          key={v.id}
                          className="rounded-full bg-input px-2 py-0.5 text-muted-foreground"
                        >
                          {v.name} ×{v.count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* ── Actions ── */}
      <div className="space-y-3 pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPlayAgain}
          className="neon-ring w-full rounded-full bg-primary py-4 font-bold text-primary-foreground"
        >
          {t("playAgain")}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={share}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3.5 text-sm font-semibold"
        >
          <Share2 className="size-4" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "copied" : "share"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {copied ? t("shareCopied") : t("shareRecap")}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <button
          onClick={onRestart}
          className="w-full rounded-full py-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
        >
          {t("newGame")}
        </button>
      </div>
    </motion.main>
  );
}
