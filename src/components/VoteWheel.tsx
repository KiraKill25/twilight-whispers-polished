import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Crown, Gavel, RotateCcw, ShieldAlert, Timer, X } from "lucide-react";
import { NarratorCard } from "@/components/NarratorCard";
import {
  SeatingWheel,
  buildVoteQueue,
  type RotationDirection,
} from "@/components/SeatingWheel";
import type { VoteRecord } from "@/components/GameRecapCard";
import { useI18n } from "@/lib/i18n";
import { nk } from "@/lib/narration";
import { playGavel, playVoteTick } from "@/lib/audio";
import {
  effectiveRoleId,
  eliminateTied,
  skipVote,
  submitVote,
  type GameState,
  type Player,
} from "@/game/engine";

const ABSTAIN = "__abstain__";

/** Vote du village sur la roue circulaire, dans l'ordre du cercle. */
export function VoteWheel({
  state,
  direction,
  captainVotesFirst = true,
  onChange,
  onVoteRecord,
  onUndo,
  canUndo,
}: {
  state: GameState;
  direction: RotationDirection;
  /** Le capitaine vote en premier (sinon en dernier). */
  captainVotesFirst?: boolean;
  onChange: (s: GameState) => void;
  onVoteRecord?: (r: VoteRecord) => void;
  onUndo?: () => void;
  canUndo?: boolean;
}) {
  const { t } = useI18n();
  const alive = state.players.filter((p) => p.alive);
  const seating = alive;

  /** Bulletins : votant → liste de cibles (1 point chacune, 2 pour le capitaine). */
  const [votes, setVotes] = useState<Record<string, string[]>>({});
  const [idx, setIdx] = useState(0);
  const [tallied, setTallied] = useState(false);
  const [judgeMode, setJudgeMode] = useState(false);
  const [judgePick, setJudgePick] = useState<string[]>([]);
  const [captainMode, setCaptainMode] = useState(false);
  const [tieSubset, setTieSubset] = useState<string[]>([]);
  const [revoteRound, setRevoteRound] = useState(0);
  const [auditOpen, setAuditOpen] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [splitPick, setSplitPick] = useState<string[]>([]);
  const [doubleElim, setDoubleElim] = useState(false);

  // --- Defense Timer Logic State ---
  const defenseThreshold = state.players.length <= 10 ? 2 : 3;
  const [defensePlayerId, setDefensePlayerId] = useState<string | null>(null);
  const [defendedPlayerIds, setDefendedPlayerIds] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(60);

  // Defense countdown timer effect
  useEffect(() => {
    if (!defensePlayerId) return;
    setTimerSeconds(60);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setDefensePlayerId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [defensePlayerId]);

  const judge = state.players.find(
    (p) => p.alive && effectiveRoleId(p) === "juge",
  );

  const inTieBreak = tieSubset.length > 1;

  const voters = useMemo(
    () =>
      buildVoteQueue(
        seating,
        state.villageCaptainId,
        direction,
        captainVotesFirst,
      ).filter(
        // Revote : les joueurs à égalité ne votent pas.
        (p) => p.canVote && (!inTieBreak || !tieSubset.includes(p.id)),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      state.players,
      direction,
      state.villageCaptainId,
      captainVotesFirst,
      revoteRound,
      inTieBreak,
      tieSubset,
    ],
  );

  const candidates = alive.filter(
    (p) => !p.immuneToDayVote && (!inTieBreak || tieSubset.includes(p.id)),
  );

  /** Décompte vivant : voix de base + points de pénalité de débat + points des bulletins. */
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of alive)
      c[p.id] =
        (inTieBreak && !tieSubset.includes(p.id) ? 0 : p.baseVotes) +
        (p.penaltyVotes ?? 0);
    for (const targets of Object.values(votes)) {
      for (const targetId of targets) {
        if (targetId === ABSTAIN) continue;
        c[targetId] = (c[targetId] ?? 0) + 1;
      }
    }
    return c;
  }, [votes, alive, inTieBreak, tieSubset]);

  const currentVoter = voters[idx];
  const isCaptainTurn =
    !!currentVoter && currentVoter.id === state.villageCaptainId;
  const allVoted = idx >= voters.length;
  /** Revote / égalité : le capitaine n'a plus qu'une seule voix. */
  const isRevote = revoteRound > 0 || inTieBreak;
  const captainPoints = isRevote ? 1 : 2;

  const commit = (voterId: string, targets: string[]) => {
    playVoteTick();
    const nextVotes = { ...votes, [voterId]: targets };
    setVotes(nextVotes);
    setIdx((i) => i + 1);
    setSplitMode(false);
    setSplitPick([]);

    // Calculate updated counts immediately to check threshold trigger
    const updatedCounts: Record<string, number> = {};
    for (const p of alive) {
      updatedCounts[p.id] =
        (inTieBreak && !tieSubset.includes(p.id) ? 0 : p.baseVotes) +
        (p.penaltyVotes ?? 0);
    }
    for (const tList of Object.values(nextVotes)) {
      for (const tId of tList) {
        if (tId === ABSTAIN) continue;
        updatedCounts[tId] = (updatedCounts[tId] ?? 0) + 1;
      }
    }

    // Check if any target reached/exceeded threshold for the first time this round
    const triggeredId = targets.find(
      (tId) =>
        tId !== ABSTAIN &&
        (updatedCounts[tId] ?? 0) >= defenseThreshold &&
        !defendedPlayerIds.includes(tId),
    );

    if (triggeredId) {
      setDefensePlayerId(triggeredId);
      setDefendedPlayerIds((prev) => [...prev, triggeredId]);
    }
  };

  /** Clic simple : 1 point (2 pour le capitaine hors revote et hors mode séparé). */
  const cast = (targetId: string) => {
    if (!currentVoter) return;
    if (targetId === ABSTAIN) return commit(currentVoter.id, [ABSTAIN]);
    if (isCaptainTurn && splitMode && !isRevote) {
      const next = [...splitPick, targetId];
      if (next.length >= 2) return commit(currentVoter.id, next);
      setSplitPick(next);
      playVoteTick();
      return;
    }
    const points = isCaptainTurn
      ? captainPoints
      : Math.max(1, currentVoter.voteWeight);
    commit(currentVoter.id, Array.from({ length: points }, () => targetId));
  };

  const undoVote = (voterId: string) => {
    setVotes((v) => {
      const next = { ...v };
      delete next[voterId];
      return next;
    });
    const pos = voters.findIndex((p) => p.id === voterId);
    if (pos >= 0 && pos < idx) setIdx(pos);
    setTallied(false);
    setJudgeMode(false);
    setCaptainMode(false);
    setDefensePlayerId(null);
  };

  const resetRound = (subset: string[]) => {
    setVotes({});
    setIdx(0);
    setTallied(false);
    setJudgeMode(false);
    setJudgePick([]);
    setCaptainMode(false);
    setSplitMode(false);
    setSplitPick([]);
    setTieSubset(subset);
    setRevoteRound((r) => r + 1);
    setDefensePlayerId(null);
    setDefendedPlayerIds([]);
  };

  const ranked = [...candidates].sort(
    (a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0),
  );
  const top = counts[ranked[0]?.id ?? ""] ?? 0;
  const leaders = ranked.filter((p) => (counts[p.id] ?? 0) === top && top > 0);

  const sameAsPreviousTie =
    inTieBreak &&
    leaders.length > 1 &&
    leaders.every((p) => tieSubset.includes(p.id)) &&
    leaders.length === tieSubset.length;

  const buildRecord = (eliminatedIds: string[]): VoteRecord => ({
    day: state.day,
    votes: alive
      .map((p) => ({ id: p.id, name: p.name, count: counts[p.id] ?? 0 }))
      .filter((v) => v.count > 0),
    ballots: Object.entries(votes).map(([voterId, targets]) => ({
      voterId,
      voterName: state.players.find((p) => p.id === voterId)?.name ?? voterId,
      targets: targets.filter((tid) => tid !== ABSTAIN),
      abstained: targets.includes(ABSTAIN),
    })),
    eliminated: eliminatedIds.map((id) => {
      const p = state.players.find((x) => x.id === id)!;
      return { id, name: p.name, roleId: effectiveRoleId(p), team: p.team };
    }),
    isRevote: revoteRound > 0,
  });

  const withTallyLog = (next: GameState, elimIds: string[]): GameState => {
    const tally = alive
      .filter((p) => (counts[p.id] ?? 0) > 0)
      .map((p) => `${p.name}×${counts[p.id]}`)
      .join(", ");
    const names = elimIds
      .map((id) => state.players.find((p) => p.id === id)?.name ?? id)
      .join(", ");
    next.log.push(
      nk("logVoteTally", { d: state.day, tally: tally || "—", names }),
    );
    return next;
  };

  const eliminate = (ids: string[]) => {
    playGavel();
    onVoteRecord?.(buildRecord(ids));
    const next =
      ids.length === 1
        ? submitVote(state, ids[0], true)
        : eliminateTied(state, ids, true);
    onChange(withTallyLog(next, ids));
  };

  const tally = () => {
    if (sameAsPreviousTie) {
      setDoubleElim(true);
      eliminate(leaders.map((p) => p.id));
      return;
    }
    setTallied(true);
  };

  return (
    <NarratorCard
      title={`${t("voteTitle", { n: state.day })}${revoteRound ? t("revoteSuffix") : ""}`}
      text={t("voteText")}
    >
      {/* Active Defense Timer Banner */}
      {defensePlayerId && (
        <div className="space-y-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 text-center animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-center gap-2 text-amber-500">
            <ShieldAlert className="size-5 animate-pulse" />
            <h4 className="text-sm font-black tracking-wider uppercase">
              Temps de Défense ({defenseThreshold} votes)
            </h4>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">
              {state.players.find((p) => p.id === defensePlayerId)?.name}
            </span>{" "}
            dispose d'une minute pour plaider sa cause !
          </p>
          <div className="flex items-center justify-center gap-2 text-2xl font-black text-amber-500 tabular-nums">
            <Timer className="size-6 animate-spin" style={{ animationDuration: "3s" }} />
            <span>{timerSeconds}s</span>
          </div>
          <button
            onClick={() => setDefensePlayerId(null)}
            className="w-full rounded-full border border-amber-500/40 bg-amber-500/20 py-2 text-xs font-bold text-amber-500 transition-colors hover:bg-amber-500/30"
          >
            Terminer la défense
          </button>
        </div>
      )}

      {inTieBreak && (
        <div className="space-y-1">
          <p className="rounded-xl border border-primary/40 px-3 py-2 text-center text-xs tracking-widest text-primary uppercase">
            {t("tieBreakOnly", { n: tieSubset.length })}
          </p>
          <p className="text-center text-[11px] text-muted-foreground">
            {t("revoteTiedExcluded")}
          </p>
        </div>
      )}

      {doubleElim && (
        <p className="rounded-xl border border-destructive/50 px-3 py-2 text-center text-xs font-bold text-destructive">
          {t("doubleElimAnnounce")}
        </p>
      )}

      <SeatingWheel
        players={seating}
        activeId={currentVoter?.id}
        direction={direction}
        captainId={state.villageCaptainId}
        onNodeClick={
          !allVoted
            ? (id) => {
                const target = alive.find((p) => p.id === id);
                if (!target || target.id === currentVoter?.id) return;
                if (!candidates.some((c) => c.id === id)) return;
                cast(id);
              }
            : undefined
        }
        badge={(p) =>
          (counts[p.id] ?? 0) > 0 ? (
            <span className="mt-0.5 inline-block rounded-full bg-primary px-1.5 text-[9px] font-black text-primary-foreground tabular-nums">
              {counts[p.id]}
            </span>
          ) : null
        }
        center={
          allVoted ? (
            <div className="px-2">
              <p className="text-[9px] tracking-widest text-muted-foreground uppercase">
                {t("topVoted")}
              </p>
              <p className="truncate text-sm font-black text-primary">
                {leaders.map((p) => p.name).join(" / ") || "—"}
              </p>
              <p className="text-lg font-black tabular-nums">{top}</p>
            </div>
          ) : (
            <div className="px-2">
              <p className="text-[9px] tracking-widest text-primary uppercase">
                {t("nowVoting")}
              </p>
              <p className="truncate text-sm font-black">
                {currentVoter?.name}
              </p>
              <p className="text-[9px] text-muted-foreground tabular-nums">
                {t("voteProgress", { i: idx + 1, n: voters.length })}
              </p>
            </div>
          )
        }
      />

      {!allVoted && isCaptainTurn && (
        <div className="space-y-2 rounded-2xl border border-accent/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-accent">
            <Crown className="size-3.5" />
            {isRevote ? t("captainRevoteOneVote") : t("captainSplitTitle")}
          </p>
          {!isRevote && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSplitMode(false);
                  setSplitPick([]);
                }}
                className={`rounded-full py-2 text-[11px] font-bold ${!splitMode ? "bg-accent text-background" : "border border-accent/60 text-accent"}`}
              >
                {t("captainVoteBoth")}
              </button>
              <button
                onClick={() => {
                  setSplitMode(true);
                  setSplitPick([]);
                }}
                className={`rounded-full py-2 text-[11px] font-bold ${splitMode ? "bg-accent text-background" : "border border-accent/60 text-accent"}`}
              >
                {t("captainVoteSplit")}
              </button>
            </div>
          )}
          {!isRevote && splitMode && (
            <p className="text-[11px] text-muted-foreground">
              {splitPick.length === 0
                ? t("captainSplitPickA")
                : t("captainSplitPickB")}
              {splitPick.length > 0 && (
                <span className="ms-1 font-bold text-accent">
                  {
                    state.players.find((p) => p.id === splitPick[0])?.name
                  }
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {!allVoted && (
        <button
          onClick={() => cast(ABSTAIN)}
          className="w-full rounded-full border border-border py-3 text-sm font-semibold text-muted-foreground"
        >
          {t("abstain")}
        </button>
      )}

      <div className="rounded-xl border border-border">
        <button
          onClick={() => setAuditOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3 py-2 text-xs tracking-widest text-muted-foreground uppercase"
        >
          {t("auditTitle")} ({Object.keys(votes).length})
          <ChevronDown
            className={`size-4 transition-transform ${auditOpen ? "rotate-180" : ""}`}
          />
        </button>
        {auditOpen && (
          <ul className="space-y-1 px-3 pb-3">
            {voters
              .filter((v) => votes[v.id])
              .map((v) => {
                const targets = votes[v.id] ?? [];
                const name = (id?: string) =>
                  state.players.find((p) => p.id === id)?.name ?? "—";
                const line = targets.includes(ABSTAIN)
                  ? t("auditAbstain", { voter: v.name })
                  : targets.length === 2 && targets[0] !== targets[1]
                    ? t("auditSplitLine", {
                        voter: v.name,
                        target: name(targets[0]),
                        target2: name(targets[1]),
                      })
                    : targets.length === 2
                      ? t("auditDoubleLine", {
                          voter: v.name,
                          target: name(targets[0]),
                        })
                      : t("auditLine", {
                          voter: v.name,
                          target: name(targets[0]),
                        });
                return (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="flex flex-wrap items-center gap-1">
                      {line}
                      {targets.length === 2 && targets[0] !== targets[1] && (
                        <span className="rounded-full bg-accent/20 px-1.5 text-[9px] font-bold text-accent uppercase">
                          {t("splitBadge")}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => undoVote(v.id)}
                      className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      <X className="size-3" />
                      {t("undoVote")}
                    </button>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      {!tallied ? (
        <button
          onClick={tally}
          className="neon-ring w-full rounded-full bg-primary py-3 font-bold text-primary-foreground"
        >
          {t("tallyComplete")}
        </button>
      ) : judgeMode ? (
        <div className="space-y-3 rounded-2xl border border-primary/40 p-4">
          <p className="flex items-center gap-2 text-sm text-primary">
            <Gavel className="size-4" />
            {t("tieJudge")}
          </p>
          {leaders.map((p) => {
            const picked = judgePick.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() =>
                  setJudgePick((s) =>
                    picked ? s.filter((x) => x !== p.id) : [...s, p.id],
                  )
                }
                className={`w-full rounded-full py-3 text-sm ${picked ? "bg-primary font-bold text-primary-foreground" : "border border-primary"}`}
              >
                {p.name}
              </button>
            );
          })}
          <button
            disabled={judgePick.length === 0}
            onClick={() => eliminate(judgePick)}
            className="neon-ring w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            {t("judgeExecute")}
          </button>
          <button
            onClick={() => resetRound(leaders.map((p) => p.id))}
            className="w-full rounded-full border border-primary py-3 text-sm font-bold text-primary"
          >
            {t("orderRevote")}
          </button>
          <p className="text-xs text-muted-foreground">{t("tieNote")}</p>
        </div>
      ) : captainMode ? (
        <div className="space-y-3 rounded-2xl border border-accent/40 p-4">
          <p className="text-sm text-accent">{t("captainBreaksTie")}</p>
          {leaders.map((p) => (
            <button
              key={p.id}
              onClick={() => eliminate([p.id])}
              className="w-full rounded-full border border-accent py-3 text-sm font-bold text-accent"
            >
              {t("eliminateName", { name: p.name })}
            </button>
          ))}
        </div>
      ) : leaders.length === 1 ? (
        <div className="space-y-3 rounded-2xl border border-primary/40 p-4">
          <p className="text-xs tracking-widest text-primary uppercase">
            {t("topVoted")} — {leaders[0].name} ({top})
          </p>
          <button
            onClick={() => eliminate([leaders[0].id])}
            className="neon-ring w-full rounded-full bg-primary py-3 font-bold text-primary-foreground"
          >
            {t("eliminateName", { name: leaders[0].name })}
          </button>
        </div>
      ) : leaders.length > 1 && judge ? (
        <div className="space-y-3 rounded-2xl border border-primary/40 p-4">
          <p className="text-sm font-bold text-primary">{t("tieJudgeActive")}</p>
          <button
            onClick={() => setJudgeMode(true)}
            className="neon-ring w-full rounded-full bg-primary py-3 font-bold text-primary-foreground"
          >
            {t("passToJudge")}
          </button>
        </div>
      ) : leaders.length > 1 ? (
        <div className="space-y-3 rounded-2xl border border-destructive/40 p-4">
          <p className="text-sm font-bold text-destructive">
            {t("tieDetectedWith", {
              names: leaders.map((p) => p.name).join(", "),
            })}
          </p>
          {revoteRound < 1 ? (
            <button
              onClick={() => resetRound(leaders.map((p) => p.id))}
              className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
            >
              {t("runRevoteTied")}
            </button>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{t("tieNote")}</p>
              <button
                onClick={() => eliminate(leaders.map((p) => p.id))}
                className="w-full rounded-full bg-destructive py-3 text-sm font-bold text-destructive-foreground"
              >
                {t("validateExec")}
              </button>
            </>
          )}
          {state.villageCaptainId && (
            <button
              onClick={() => setCaptainMode(true)}
              className="w-full rounded-full border border-accent py-3 text-sm font-bold text-accent"
            >
              {t("captainBreaksTie")}
            </button>
          )}
          <button
            onClick={() => onChange(skipVote(state))}
            className="w-full rounded-full border border-border py-3 text-sm font-semibold text-muted-foreground"
          >
            {t("skipElimination")}
          </button>
        </div>
      ) : (
        <button
          onClick={() => onChange(skipVote(state))}
          className="w-full rounded-full border border-border py-3 text-sm font-semibold text-muted-foreground"
        >
          {t("skipElimination")}
        </button>
      )}

      {canUndo && onUndo && (
        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground"
        >
          <RotateCcw className="size-3.5" />
          {t("undoStep")}
        </button>
      )}
    </NarratorCard>
  );
}
