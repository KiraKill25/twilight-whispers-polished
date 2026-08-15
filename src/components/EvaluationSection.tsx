import { motion } from "framer-motion";
import {
  Crown,
  Target,
  Trophy,
  TrendingDown,
  Award,
  Eye,
  Drama,
  Shield,
  Snowflake,
  Skull,
  Users,
  Crosshair,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { effectiveRoleId, type GameState, type Player } from "@/game/engine";
import type { VoteRecord } from "@/components/GameRecapCard";

const spring = { type: "spring" as const, stiffness: 220, damping: 24 };

export interface Scorecard {
  player: Player;
  /** Points de vote posés sur des joueurs du camp adverse / total posé. */
  accuracy: number;
  votePoints: number;
  /** Efficacité du rôle (nuits utiles : sauvetages, kills réussis, survie). */
  roleEfficiency: number;
  /** A initié le premier vote sur la cible finalement éliminée. */
  leaderCount: number;
  followerCount: number;
  /** Villageois éliminés au vote sur lesquels ce loup a voté. */
  deception: number;
  /** Votes justes posés alors que 4 joueurs ou moins étaient en vie. */
  clutch: number;
  /** Sauvetages provoqués par le rôle d'origine. */
  rescues: number;
  /** Éliminé pour suicide / révélation d'identité. */
  suicided: boolean;
  /** Étoiles attribuées par le meneur pendant les débats. */
  stars: number;
  score: number;
}


const isWolf = (p: Player) => p.team === "WEREWOLVES" || !!p.isConvertedToWolf;

/**
 * Évaluation post-partie 100 % basée sur les journaux enregistrés :
 * bulletins de vote (dont votes doubles / séparés du capitaine) et évènements de nuit.
 */
export function buildScorecards(state: GameState, voteHistory: VoteRecord[]): Scorecard[] {
  const wolfIds = new Set(state.players.filter(isWolf).map((p) => p.id));
  const events = state.events ?? [];
  const totalPlayers = state.players.length;

  return state.players
    .map((p) => {
      let good = 0;
      let total = 0;
      let leaderCount = 0;
      let followerCount = 0;
      let deception = 0;
      let clutch = 0;
      let roundIndex = 0;

      for (const round of voteHistory) {
        roundIndex += 1;
        /* Nombre de joueurs encore en vie à ce tour (approximation par la frise des votes). */
        const aliveAtRound =
          totalPlayers -
          voteHistory.slice(0, roundIndex - 1).reduce((n, r) => n + r.eliminated.length, 0);
        const ballots = round.ballots ?? [];
        const mine = ballots.filter((b) => b.voterId === p.id);
        for (const b of mine) {
          for (const tid of b.targets) {
            total += 1;
            const targetIsWolf = wolfIds.has(tid);
            const useful = wolfIds.has(p.id) ? !targetIsWolf : targetIsWolf;
            if (useful) good += 1;
            if (useful && aliveAtRound <= 4) clutch += 1;
          }
        }
        /* Tromperie : un loup pousse un villageois qui finit éliminé. */
        if (wolfIds.has(p.id)) {
          for (const e of round.eliminated) {
            if (wolfIds.has(e.id)) continue;
            if (mine.some((b) => b.targets.includes(e.id))) deception += 1;
          }
        }
        // Meneur : premier bulletin posé sur le joueur finalement éliminé.
        const elimIds = round.eliminated.map((e) => e.id);
        const pushers = ballots.filter((b) => b.targets.some((tid) => elimIds.includes(tid)));
        if (pushers.length > 0) {
          if (pushers[0].voterId === p.id) leaderCount += 1;
          else if (pushers.some((b) => b.voterId === p.id)) followerCount += 1;
        }
      }

      // Efficacité du rôle depuis la frise : sauvetages provoqués, survie, capitanat.
      const rid = p.originalRoleId ?? effectiveRoleId(p);
      const rescues = events.filter((e) => e.type === "RESCUE" && e.bySavior === rid).length;
      const kills = events.filter(
        (e) => e.type === "KILL" && e.cause === "WITCH_POISON" && wolfIds.has(p.id) === false,
      ).length;
      const suicided = events.some(
        (e) => e.type === "KILL" && e.cause === "SUICIDE_REVEAL" && e.name === p.name,
      );
      let roleEfficiency = rescues * 30 + Math.min(kills, 2) * 15;
      if (p.alive) roleEfficiency += 25;
      if (p.isCaptain) roleEfficiency += 10;
      roleEfficiency = Math.min(100, roleEfficiency);

      const accuracy = total > 0 ? Math.round((good / total) * 100) : 0;
      const stars = p.stars ?? 0;
      const score = Math.round(
        accuracy * 0.5 +
          roleEfficiency * 0.4 +
          leaderCount * 6 +
          followerCount * 2 +
          deception * 5 +
          clutch * 8 +
          stars * 10 -
          (suicided ? 30 : 0) +
          (p.alive ? 8 : 0),
      );

      return {
        player: p,
        accuracy,
        votePoints: total,
        roleEfficiency,
        leaderCount,
        followerCount,
        deception,
        clutch,
        rescues,
        suicided,
        stars,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}


/** Note de camp : moyenne des scores individuels du camp. */
function factionRating(cards: Scorecard[], pick: (p: Player) => boolean) {
  const list = cards.filter((c) => pick(c.player));
  if (!list.length) return null;
  return Math.round(list.reduce((s, c) => s + c.score, 0) / list.length);
}

type BadgeDef = {
  id: string;
  key:
    | "badgeMastermind"
    | "badgeEagleEye"
    | "badgeOscar"
    | "badgeGuardian"
    | "badgeBandwagoner"
    | "badgeBlindSniper"
    | "badgeIceCold"
    | "badgeStarTown"
    | "badgeStarWolf"
    | "badgeSuicidal";
  descKey: string;
  icon: typeof Award;
  tone: string;
  holders: Scorecard[];
};

/** Meilleur porteur selon une métrique, uniquement si la valeur est significative. */
function best(
  cards: Scorecard[],
  value: (c: Scorecard) => number,
  min = 1,
  eligible: (c: Scorecard) => boolean = () => true,
) {
  const list = cards.filter((c) => eligible(c) && value(c) >= min);
  if (!list.length) return [];
  const top = Math.max(...list.map(value));
  return list.filter((c) => value(c) === top);
}

/** Blasons attribués uniquement à partir des données enregistrées. */
export function buildBadges(cards: Scorecard[]): BadgeDef[] {
  const voted = (c: Scorecard) => c.votePoints > 0;
  const worstAccuracy = () => {
    const list = cards.filter(voted);
    if (!list.length) return [];
    const low = Math.min(...list.map((c) => c.accuracy));
    return low < 50 ? list.filter((c) => c.accuracy === low) : [];
  };
  const defs: BadgeDef[] = [
    {
      id: "mastermind",
      key: "badgeMastermind",
      descKey: "badgeMastermindDesc",
      icon: Award,
      tone: "text-gold border-gold/50",
      holders: best(cards, (c) => c.score, 1),
    },
    {
      id: "eagleEye",
      key: "badgeEagleEye",
      descKey: "badgeEagleEyeDesc",
      icon: Eye,
      tone: "text-primary border-primary/50",
      holders: best(cards, (c) => c.accuracy, 50, voted),
    },
    {
      id: "oscar",
      key: "badgeOscar",
      descKey: "badgeOscarDesc",
      icon: Drama,
      tone: "text-destructive border-destructive/50",
      holders: best(
        cards,
        (c) => c.deception,
        1,
        (c) => isWolf(c.player),
      ),
    },
    {
      id: "guardian",
      key: "badgeGuardian",
      descKey: "badgeGuardianDesc",
      icon: Shield,
      tone: "text-emerald-300 border-emerald-400/50",
      holders: best(cards, (c) => c.rescues, 1),
    },
    {
      id: "iceCold",
      key: "badgeIceCold",
      descKey: "badgeIceColdDesc",
      icon: Snowflake,
      tone: "text-sky-300 border-sky-400/50",
      holders: best(cards, (c) => c.clutch, 1),
    },
    {
      id: "bandwagoner",
      key: "badgeBandwagoner",
      descKey: "badgeBandwagonerDesc",
      icon: Users,
      tone: "text-accent border-accent/50",
      holders: best(
        cards,
        (c) => c.followerCount,
        2,
        (c) => c.leaderCount === 0,
      ),
    },
    {
      id: "blindSniper",
      key: "badgeBlindSniper",
      descKey: "badgeBlindSniperDesc",
      icon: Crosshair,
      tone: "text-muted-foreground border-border",
      holders: worstAccuracy(),
    },
    {
      id: "starTown",
      key: "badgeStarTown",
      descKey: "badgeStarTownDesc",
      icon: Star,
      tone: "text-gold border-gold/50",
      holders: best(
        cards,
        (c) => c.stars,
        1,
        (c) => !isWolf(c.player),
      ),
    },
    {
      id: "starWolf",
      key: "badgeStarWolf",
      descKey: "badgeStarWolfDesc",
      icon: Star,
      tone: "text-destructive border-destructive/50",
      holders: best(
        cards,
        (c) => c.stars,
        1,
        (c) => isWolf(c.player),
      ),
    },
    {
      id: "suicidal",
      key: "badgeSuicidal",
      descKey: "badgeSuicidalDesc",
      icon: Skull,
      tone: "text-destructive border-destructive/50",
      holders: cards.filter((c) => c.suicided),
    },
  ];
  return defs.filter((d) => d.holders.length > 0);
}

export function EvaluationSection({
  state,
  voteHistory,
}: {
  state: GameState;
  voteHistory: VoteRecord[];
}) {
  const { t, roleName } = useI18n();
  const cards = buildScorecards(state, voteHistory);
  if (cards.length === 0) return null;

  const mvp = cards[0];
  const lvp = cards[cards.length - 1];
  const factions = [
    {
      label: t("factionWolves"),
      value: factionRating(cards, isWolf),
      bar: "bg-destructive",
    },
    {
      label: t("factionVillage"),
      value: factionRating(cards, (p) => !isWolf(p) && p.team === "VILLAGEOIS"),
      bar: "bg-primary",
    },
    {
      label: t("factionSolo"),
      value: factionRating(cards, (p) => p.team === "SOLO" || p.team === "LOVERS"),
      bar: "bg-accent",
    },
  ].filter((f) => f.value !== null);

  const hasBallots = voteHistory.some((r) => (r.ballots ?? []).length > 0);
  const badges = buildBadges(cards);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.28 }}
      className="surface-card space-y-4 rounded-3xl p-4"
    >
      <p className="text-[11px] tracking-[0.3em] text-primary uppercase">{t("evalTitle")}</p>

      {!hasBallots && <p className="text-xs text-muted-foreground">{t("evalNoData")}</p>}

      <div className="grid gap-2">
        {[
          { card: mvp, key: "evalMvp" as const, icon: Trophy, tone: "text-gold" },
          { card: lvp, key: "evalLvp" as const, icon: TrendingDown, tone: "text-destructive" },
        ].map(({ card, key, icon: Icon, tone }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-2 rounded-2xl border border-border p-3"
          >
            <div className="min-w-0">
              <p
                className={`flex items-center gap-1 text-[10px] tracking-widest uppercase ${tone}`}
              >
                <Icon className="size-3" />
                {t(key)}
              </p>
              <p className="truncate text-sm font-black">
                {card.player.name}
                {card.player.isCaptain && <Crown className="ms-1 inline size-3 text-accent" />}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {roleName(card.player.originalRoleId ?? effectiveRoleId(card.player))}
              </p>
            </div>
            <div className="text-end">
              <p className={`text-xl font-black ${tone}`}>{card.score}</p>
              <p className="text-[10px] text-muted-foreground">
                {t("evalAccuracy")} {card.accuracy}%
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          {t("evalFactions")}
        </p>
        {factions.map((f) => (
          <div key={f.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="font-bold text-foreground">{f.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-input">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, f.value ?? 0)}%` }}
                transition={{ duration: 0.9, delay: 0.3 }}
                className={`h-full rounded-full ${f.bar}`}
              />
            </div>
          </div>
        ))}
      </div>

      {badges.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {t("badgesTitle")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {badges.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring, delay: 0.3 + i * 0.05 }}
                  className={`space-y-1 rounded-2xl border bg-input/30 p-3 ${b.tone}`}
                >
                  <p className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase">
                    <Icon className="size-3.5" />
                    {t(b.key)}
                  </p>
                  <p className="truncate text-sm font-black text-foreground">
                    {b.holders.map((h) => h.player.name).join(", ")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t(b.descKey as "badgeMastermindDesc")}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          {t("evalScorecards")}
        </p>
        <ul className="space-y-2">
          {cards.map((c, i) => (
            <li
              key={c.player.id}
              className="space-y-1 rounded-2xl border border-border p-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-black text-primary tabular-nums">
                    {i + 1}
                  </span>
                  <span className="truncate font-bold">{c.player.name}</span>
                  {c.player.isCaptain && <Crown className="size-3 text-accent" />}
                </span>
                <b className="tabular-nums">{c.score}</b>
              </div>
              <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                <span className="rounded-full bg-input px-2 py-0.5">
                  <Target className="me-1 inline size-2.5" />
                  {t("evalAccuracy")} {c.accuracy}%
                </span>
                <span className="rounded-full bg-input px-2 py-0.5">
                  {t("evalRoleEff")} {c.roleEfficiency}%
                </span>
                <span className="rounded-full bg-input px-2 py-0.5">
                  {t("evalVotesCast", { n: c.votePoints })}
                </span>
                {c.leaderCount > 0 && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary">
                    {t("evalLeader")} ×{c.leaderCount}
                  </span>
                )}
                {c.followerCount > 0 && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-accent">
                    {t("evalFollower")} ×{c.followerCount}
                  </span>
                )}
                {c.deception > 0 && (
                  <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-destructive">
                    {t("evalDeception")} ×{c.deception}
                  </span>
                )}
                {c.clutch > 0 && (
                  <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-sky-300">
                    {t("evalClutch")} ×{c.clutch}
                  </span>
                )}
                {c.suicided && (
                  <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-destructive">
                    {t("badgeSuicidal")}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
