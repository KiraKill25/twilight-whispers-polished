import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Crown,
  Droplet,
  Flame,
  Heart,
  MicOff,
  Pencil,
  RotateCcw,
  Shield,
  Skull,
  Sparkles,
  Swords,
  X,
} from "lucide-react";
import { OverlayCard } from "@/components/OverlayCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MuteButton } from "@/components/MuteButton";
import { ROLE_BY_ID, roleImage } from "@/data/roles";
import { NarratorCard } from "@/components/NarratorCard";
import { PhaseTransition } from "@/components/PhaseTransition";
import { SpeakButton } from "@/components/SpeakButton";
import {
  DebateSetupModal,
  DebateWheel,
  VoteSetupModal,
} from "@/components/DebateWheel";
import { VoteWheel } from "@/components/VoteWheel";
import type { RotationDirection } from "@/components/SeatingWheel";
import { EliminationReveal } from "@/components/EliminationReveal";
import {
  GameRecapCard,
  type VoteRecord,
} from "@/components/GameRecapCard";
import { useI18n } from "@/lib/i18n";
import { useNarrate } from "@/hooks/use-narrate";
import { NightReportCard } from "@/components/NightReportCard";
import {
  clearBgm,
  playCheer,
  playWolfHowl,
  startBgm,
} from "@/lib/audio";
import {
  clearGame,
  loadGame,
  loadSettings,
  loadSetup,
  saveGame,
  type GameSettings,
} from "@/lib/session";
import {
  addDebatePenalty,
  assignCaptain,
  bearNeighbors,
  canWitchHeal,
  createGame,
  currentStep,
  effectiveRoleId,
  executeTalkativeWolfAndSkip,
  goToVote,
  resolveHunter,
  skipVote,
  submitStep,
  suicideReveal,
  type GameState,
  type Player,
} from "@/game/engine";

const TITLE = "Partie en cours — Nightfall Oracle";
const DESC = "Le meneur guide la nuit, l'aube et le vote du village, tour après tour.";

export const Route = createFileRoute("/game")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const narrate = useNarrate();
  const [state, setState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [transition, setTransition] = useState<"NIGHT" | "DAY" | null>("NIGHT");
  const [victims, setVictims] = useState<
    { id: string; name: string; roleId: string }[] | null
  >(null);
  const [debateDoneDay, setDebateDoneDay] = useState(0);
  const [direction, setDirection] = useState<RotationDirection>("clockwise");
  const [voteDirection, setVoteDirection] =
    useState<RotationDirection>("clockwise");
  const [captainVotesFirst, setCaptainVotesFirst] = useState(true);
  const [directionDay, setDirectionDay] = useState(0);
  const [voteSetupDay, setVoteSetupDay] = useState(0);
  const [reportDay, setReportDay] = useState(0);
  const [voteHistory, setVoteHistory] = useState<VoteRecord[]>([]);
  const [stateHistory, setStateHistory] = useState<GameState[]>([]);
  const [suicideOpen, setSuicideOpen] = useState(false);
  const lastPhase = useRef<string>("");

  /** Push current state to history then apply next. Max 30 snapshots. */
  const updateState = (next: GameState) => {
    setState((cur) => {
      if (cur) setStateHistory((h) => [...h, cur].slice(-30));
      return next;
    });
  };

  /** Decrement debate penalty points by 1 (floored at 0) */
  const removePenalty = (playerId: string) => {
    if (!state) return;
    const p = state.players.find((x) => x.id === playerId);
    if (p && (p.penaltyVotes ?? 0) > 0) {
      updateState({
        ...state,
        players: state.players.map((x) =>
          x.id === playerId
            ? { ...x, penaltyVotes: Math.max(0, (x.penaltyVotes ?? 0) - 1) }
            : x
        ),
      });
      toast.info(`Pénalité retirée à ${p.name}`);
    }
  };

  /** Restore the previous snapshot. */
  const undo = () => {
    setStateHistory((h) => {
      const prev = h[h.length - 1];
      if (prev) {
        setState(prev);
        toast(t("undoDoneToast"));
      }
      return h.slice(0, -1);
    });
  };

  const canUndo = stateHistory.length > 0;

  useEffect(() => {
    setSettings(loadSettings());
    const saved = loadGame<GameState>();
    if (saved) {
      setState(saved);
      return;
    }
    const setup = loadSetup();
    if (setup?.players?.length)
      setState(createGame(setup.players, setup.villageCaptainId));
    else navigate({ to: "/setup" });
  }, [navigate]);

  // Phase transition cards
  useEffect(() => {
    if (!state) return;
    const isNight = state.phase.startsWith("NUIT");
    const key = isNight ? `N${state.night}` : `${state.phase}${state.day}`;
    if (lastPhase.current && lastPhase.current !== key) {
      if (isNight) setTransition("NIGHT");
      else if (state.phase === "AUBE") setTransition("DAY");
    }
    lastPhase.current = key;
  }, [state]);

  // End-of-game SFX
  useEffect(() => {
    if (state?.phase !== "FIN") return;
    if (state.winnerTeam === "WOLVES") playWolfHowl();
    else playCheer();
  }, [state?.phase, state?.winnerTeam]);

  useEffect(() => {
    if (state) saveGame(state);
  }, [state]);

  // BGM lifecycle
  useEffect(() => {
    if (!state) return;
    if (state.phase === "FIN") { clearBgm(); return; }
    startBgm(state.phase.startsWith("NUIT") ? "NIGHT" : "DAY");
  }, [state?.phase]);

  useEffect(() => () => clearBgm(), []);

  if (!state)
    return <main className="p-8 text-muted-foreground">{t("loading")}</main>;

  if (state.phase === "FIN")
    return (
      <GameRecapCard
        state={state}
        voteHistory={voteHistory}
        onRestart={() => { clearGame(); navigate({ to: "/" }); }}
        onPlayAgain={() => { clearGame(); navigate({ to: "/composition" }); }}
      />
    );

  const isNight = state.phase.startsWith("NUIT");
  const overlayFree =
    !state.reveal &&
    !transition &&
    !victims &&
    !state.captainSuccessionPending &&
    state.phase !== "EVENEMENT_MORT";

  const needsNightReport =
    !isNight && state.phase === "AUBE" && reportDay !== state.day && overlayFree;
  const needsDebateSetup =
    !isNight &&
    state.phase === "AUBE" &&
    !needsNightReport &&
    directionDay !== state.day &&
    overlayFree;
  const needsVoteSetup =
    !isNight &&
    state.phase === "JOUR_VOTE" &&
    voteSetupDay !== state.day &&
    overlayFree;
  const phaseLabel = isNight
    ? t("nightN", { n: state.night })
    : t("dayN", { n: state.day });

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg space-y-5 box-border overflow-x-hidden overflow-y-auto px-4 py-6 pb-16">
      <header className="sticky top-0 z-40 -mx-4 flex items-center justify-between gap-2 bg-background/80 px-4 py-2 backdrop-blur">
        <span className="text-xs tracking-widest text-muted-foreground uppercase">
          {phaseLabel}
        </span>
        <div className="flex items-center gap-2">
          {canUndo && (
            <button
              onClick={undo}
              aria-label={t("undoLabel")}
              title={t("undoLabel")}
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition active:scale-95"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">{t("undoLabel")}</span>
            </button>
          )}
          {!isNight && (
            <button
              onClick={() => setSuicideOpen(true)}
              aria-label={t("gmSuicide")}
              title={t("gmSuicide")}
              className="flex items-center gap-1 rounded-full border border-destructive/60 px-2.5 py-1.5 text-xs font-semibold text-destructive transition active:scale-95"
            >
              <Skull className="size-3.5" />
              <span className="hidden sm:inline">{t("gmSuicide")}</span>
            </button>
          )}
          <LanguageSwitcher />
          <MuteButton />
          <button
            onClick={() => { clearGame(); navigate({ to: "/" }); }}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary"
          >
            {t("quit")}
          </button>
        </div>
      </header>

      {transition && (
        <PhaseTransition
          kind={transition}
          subtitle={
            transition === "NIGHT"
              ? t("nightSubtitle", { n: state.night })
              : t("daySubtitle", { n: state.day })
          }
          onDone={() => setTransition(null)}
        />
      )}

      {suicideOpen && (
        <SuicideModal
          state={state}
          onClose={() => setSuicideOpen(false)}
          onConfirm={(id) => {
            const name = state.players.find((p) => p.id === id)?.name ?? "";
            setSuicideOpen(false);
            updateState(suicideReveal(state, id));
            toast.error(t("suicideDone", { name }));
          }}
        />
      )}

      {victims && (
        <EliminationReveal victims={victims} onClose={() => setVictims(null)} />
      )}

      {state.reveal && (
        <Overlay onClose={() => setState({ ...state, reveal: undefined })}>
          {narrate(state.reveal)}
        </Overlay>
      )}

      {needsNightReport && (
        <NightReportCard state={state} onClose={() => setReportDay(state.day)} />
      )}

      {needsDebateSetup && (
        <DebateSetupModal
          captainName={
            state.players.find((p) => p.id === state.villageCaptainId)?.name
          }
          captainMuted={
            !!state.players.find((p) => p.id === state.villageCaptainId)
              ?.mutedForDay
          }
          onConfirm={(d) => {
            setDirection(d);
            setDirectionDay(state.day);
          }}
        />
      )}

      {needsVoteSetup && (
        <VoteSetupModal
          captainName={
            state.players.find((p) => p.id === state.villageCaptainId)?.name
          }
          captainMuted={
            !!state.players.find((p) => p.id === state.villageCaptainId)
              ?.mutedForDay
          }
          onConfirm={(setup) => {
            setVoteDirection(setup.voteDirection);
            setCaptainVotesFirst(setup.captainVotesFirst);
            setVoteSetupDay(state.day);
          }}
        />
      )}

      {state.phase === "EVENEMENT_MORT" ? (
        <HunterPanel state={state} onDone={setState} />
      ) : state.captainSuccessionPending ? (
        <CaptainSuccessionPanel state={state} onDone={setState} />
      ) : state.phase === "AUBE" ? (
        <DawnPanel
          state={state}
          settings={settings}
          direction={direction}
          setupDone={directionDay === state.day}
          debateDone={debateDoneDay === state.day}
          onDebateDone={() => setDebateDoneDay(state.day)}
          onChange={updateState}
          onRemovePenalty={removePenalty}
          onUndo={undo}
          canUndo={canUndo}
        />
      ) : state.phase === "JOUR_VOTE" ? (
        voteSetupDay === state.day ? (
          <VoteWheel
            state={state}
            direction={voteDirection}
            captainVotesFirst={captainVotesFirst}
            onVoteRecord={(r) => setVoteHistory((h) => [...h, r])}
            onChange={(next) => {
              if (next.lastEliminated?.length) setVictims(next.lastEliminated);
              updateState(next);
            }}
            onUndo={undo}
            canUndo={canUndo}
            onPenalty={(id) => {
              const p = state.players.find((x) => x.id === id);
              if (p) {
                updateState(addDebatePenalty(state, id));
                toast.error(`Pénalité de débat infligée à ${p.name}`);
              }
            }}
            onRemovePenalty={removePenalty}
          />
        ) : null
      ) : (
        <NightPanel state={state} onChange={updateState} onUndo={undo} canUndo={canUndo} />
      )}

      <section className="surface-card rounded-2xl p-4">
        <h2 className="mb-2 text-xs tracking-widest text-primary uppercase">
          {t("village", { n: state.players.filter((p) => p.alive).length })}
        </h2>
        <RoleList players={state.players} revealAll />
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Overlay({
  children,
  onClose,
  tone = "NIGHT",
}: {
  children: React.ReactNode;
  onClose: () => void;
  tone?: "NIGHT" | "DAY" | "WOLF";
}) {
  const { t } = useI18n();
  return (
    <OverlayCard tone={tone}>
      <p className="text-lg font-semibold">{children}</p>
      <button
        onClick={onClose}
        className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground transition active:scale-95"
      >
        {t("continue")}
      </button>
    </OverlayCard>
  );
}

function SuicideModal({
  state,
  onClose,
  onConfirm,
}: {
  state: GameState;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  const { t } = useI18n();
  const [sel, setSel] = useState<string[]>([]);
  const alive = state.players.filter((p) => p.alive);
  return (
    <OverlayCard tone="WOLF" label={t("suicideTitle")}>
      <p className="flex items-center justify-center gap-2 text-[11px] tracking-[0.3em] text-destructive uppercase">
        <Skull className="size-4" />
        {t("suicideTitle")}
      </p>
      <p className="text-xs text-muted-foreground">{t("suicideDesc")}</p>
      <div className="text-start">
        <PlayerPicker
          players={alive}
          selected={sel}
          onToggle={(id) => setSel((s) => (s[0] === id ? [] : [id]))}
          accent="crimson"
        />
      </div>
      <div className="flex flex-col gap-2">
        <button
          disabled={sel.length !== 1}
          onClick={() => onConfirm(sel[0])}
          className="w-full rounded-full bg-destructive py-3 text-sm font-bold text-destructive-foreground transition active:scale-95 disabled:opacity-40"
        >
          {t("suicideConfirm")}
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-full border border-border py-2.5 text-sm font-semibold text-muted-foreground"
        >
          {t("cancel")}
        </button>
      </div>
    </OverlayCard>
  );
}

function RoleList({
  players,
  revealAll,
}: {
  players: Player[];
  revealAll?: boolean;
}) {
  const { t, roleName } = useI18n();
  return (
    <ul className="grid grid-cols-2 gap-2 text-sm">
      {players.map((p) => (
        <li
          key={p.id}
          className={`rounded-xl border border-border px-3 py-2 ${p.alive ? "" : "opacity-40 line-through"}`}
        >
          <span className="flex items-center gap-1 font-semibold">
            {p.name}
            {p.isCaptain && p.alive && (
              <Crown className="size-3.5 text-accent" aria-label={t("captain")} />
            )}
            {p.isConvertedToWolf && (
              <span
                title={t("convertedInfo")}
                className="rounded bg-destructive/20 px-1 text-[9px] font-bold text-destructive uppercase"
              >
                {t("wolfTag")}
              </span>
            )}
            {(p.penaltyVotes ?? 0) > 0 && (
              <span className="rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-500">
                +{p.penaltyVotes}
              </span>
            )}
          </span>
          {(revealAll || !p.alive) && (
            <span className="block text-[11px] text-muted-foreground">
              {roleName(p.originalRoleId ?? effectiveRoleId(p))}
              {p.isConvertedToWolf && t("converted")}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

const PICKER_ACCENT = {
  arcane: "border-primary bg-primary/15 text-primary shadow-[0_0_18px_rgba(99,102,241,0.45)]",
  poison: "border-emerald-400 bg-emerald-400/15 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.45)]",
  crimson:
    "border-destructive bg-destructive/15 text-destructive shadow-[0_0_18px_rgba(236,72,153,0.5)]",
} as const;

type PickerAccent = keyof typeof PICKER_ACCENT;

function PlayerPicker({
  players,
  selected,
  onToggle,
  accent = "arcane",
  marks,
  disabledIds,
}: {
  players: Player[];
  selected: string[];
  onToggle: (id: string) => void;
  accent?: PickerAccent;
  marks?: Record<string, React.ReactNode>;
  disabledIds?: string[];
}) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-2">
      {players.map((p) => {
        const off = disabledIds?.includes(p.id) ?? false;
        return (
          <button
            key={p.id}
            disabled={off}
            onClick={() => onToggle(p.id)}
            className={`relative rounded-xl border px-3 py-3 text-sm transition duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
              selected.includes(p.id) && !off
                ? PICKER_ACCENT[accent]
                : "border-border"
            }`}
          >
            {p.isCaptain && (
              <span
                aria-label={t("captain")}
                className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg"
              >
                <Crown className="size-3.5" />
              </span>
            )}
            <span className="flex items-center justify-center gap-1.5">
              {p.name}
              {marks?.[p.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function NightPanel({
  state,
  onChange,
  onUndo,
  canUndo,
}: {
  state: GameState;
  onChange: (s: GameState) => void;
  onUndo?: () => void;
  canUndo?: boolean;
}) {
  const { t, prompt, roleName } = useI18n();
  const step = currentStep(state);
  const [sel, setSel] = useState<string[]>([]);
  const [execute, setExecute] = useState(false);
  const [heal, setHeal] = useState(false);
  const [infect, setInfect] = useState(false);
  const [mute, setMute] = useState<string | null>(null);
  const [bwTab, setBwTab] = useState<"attack" | "infect" | "mute">("attack");
  const [editingWord, setEditingWord] = useState(false);
  const [shieldConfirm, setShieldConfirm] = useState(false);
  const [wordDraft, setWordDraft] = useState("");
  const [facePower, setFacePower] = useState<
    "protect" | "life" | "poison" | "inspect" | null
  >(null);
  const [spyChoice, setSpyChoice] = useState<boolean | null>(null);

  useEffect(() => {
    setSel([]);
    setExecute(false);
    setHeal(false);
    setInfect(false);
    setMute(null);
    setBwTab("attack");
    setEditingWord(false);
    setWordDraft("");
    setShieldConfirm(false);
    setFacePower(null);
    setSpyChoice(null);
  }, [step?.key]);

  useEffect(() => {
    if (!step) return;
    const WOLF_ROLES = ["loup-garou", "loup-noir", "loup-blanc", "loup-matriarche", "loup-bavard"];
    if (WOLF_ROLES.includes(step.roleId)) playWolfHowl();
  }, [step?.key]);

  if (!step) {
    return (
      <NarratorCard text={t("nightEnds")}>
        <button
          onClick={() => onChange(submitStep(state, {}))}
          className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground"
        >
          {t("raiseDay")}
        </button>
      </NarratorCard>
    );
  }

  const actor = state.players.find((p) => p.id === step.actorId)!;
  let candidates = state.players.filter((p) => p.alive);
  if (step.roleId === "loup-blanc")
    candidates = step.soloKill
      ? candidates.filter((p) => p.id !== actor.id)
      : candidates.filter((p) => p.team === "WEREWOLVES" && p.id !== actor.id);

  if (step.roleId === "salvateur")
    candidates = candidates.filter((p) => p.id !== state.round.previousProtectedId);
  if (
    ["voyante", "cupidon", "mime", "enfant-sauvage", "general", "voleur", "maniaque"].includes(
      step.roleId,
    )
  )
    candidates = candidates.filter((p) => p.id !== actor.id);

  const toggle = (id: string) =>
    setSel((s) =>
      s.includes(id)
        ? s.filter((x) => x !== id)
        : step.mode === "two"
          ? [...s, id].slice(-2)
          : [id],
    );

  const STANDARD_WOLF_KILLERS = [
    "loup-garou",
    "loup-noir",
    "loup-bavard",
    "loup-matriarche",
  ];
  const forbiddenWolfIds = STANDARD_WOLF_KILLERS.includes(step.roleId)
    ? state.players
        .filter((p) => p.alive && p.team === "WEREWOLVES")
        .map((p) => p.id)
    : [];
  const toggleTarget = (id: string) => {
    if (forbiddenWolfIds.includes(id)) return;
    toggle(id);
  };

  const send = (payload: Parameters<typeof submitStep>[1]) =>
    onChange(submitStep(state, payload));

  const matriarch = state.players.find(
    (p) =>
      p.alive &&
      effectiveRoleId(p) === "loup-matriarche" &&
      !p.disabledNightAbility &&
      !p.powersDisabled,
  );

  const attackedPlayerName = state.players.find((p) => p.id === state.round.attackedId)?.name;

  const stepPrompt = prompt(step.roleId) || step.prompt;
  const stepTitle = `${roleName(step.roleId)}${step.soloKill ? t("soloPackSuffix") : ""}`;

  return (
    <div className="surface-card animate-rise-in neon-ring overflow-hidden rounded-3xl">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={roleImage(step.roleId)}
          alt={t("stepWakeAlt", { role: stepTitle })}
          width={640}
          height={640}
          loading="lazy"
          className="animate-slow-zoom h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        <p className="absolute bottom-3 left-4 text-lg font-black text-primary">
          {stepTitle}
        </p>
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <SpeakButton text={stepTitle} />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1 rounded-2xl border border-primary/30 bg-primary/5 p-3">
          <p className="text-[10px] tracking-[0.25em] text-primary uppercase">
            {t("gmTurnGuide", { role: roleName(step.roleId), name: actor.name })}
          </p>
          <p className="text-sm text-muted-foreground">{stepPrompt}</p>
        </div>

        {step.mode === "word" ? (
          <div className="space-y-4">
            {step.soloKill && (
              <div className="space-y-2">
                <p className="text-xs tracking-widest text-primary uppercase">
                  {t("noirSoloVictimTitle")}
                </p>
                <PlayerPicker
                  players={candidates.filter((p) => p.id !== actor.id)}
                  selected={sel}
                  onToggle={toggleTarget}
                  disabledIds={forbiddenWolfIds}
                />
              </div>
            )}

            <div className="neon-ring relative overflow-hidden rounded-3xl border-2 border-primary bg-black/60 p-6 text-center">
              <p className="text-[11px] tracking-[0.3em] text-primary uppercase">
                {t("secretWordTitle")}
              </p>
              {editingWord ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    autoFocus
                    value={wordDraft}
                    onChange={(e) => setWordDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && wordDraft.trim()) {
                        onChange({ ...state, round: { ...state.round, requiredWord: wordDraft.trim() } });
                        setEditingWord(false);
                      }
                      if (e.key === "Escape") setEditingWord(false);
                    }}
                    className="flex-1 rounded-2xl bg-input px-4 py-3 text-center text-3xl font-black outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("newWordPlaceholder")}
                  />
                  <button
                    onClick={() => {
                      if (wordDraft.trim())
                        onChange({ ...state, round: { ...state.round, requiredWord: wordDraft.trim() } });
                      setEditingWord(false);
                    }}
                    className="shrink-0 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditingWord(false)}
                    className="shrink-0 rounded-full border border-border p-3 text-muted-foreground"
                    aria-label={t("cancel")}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-center gap-3">
                  <span className="gradient-text text-6xl font-black leading-tight tracking-wider">
                    {state.round.requiredWord}
                  </span>
                  <button
                    onClick={() => {
                      setWordDraft(state.round.requiredWord ?? "");
                      setEditingWord(true);
                    }}
                    aria-label={t("editWord")}
                    className="shrink-0 rounded-full border border-primary/40 p-2 text-primary/60 transition hover:border-primary hover:text-primary"
                  >
                    <Pencil className="size-4" />
                  </button>
                </div>
              )}
            </div>
            <button
              disabled={step.soloKill && sel.length !== 1}
              onClick={() => send(step.soloKill ? { targetId: sel[0] } : {})}
              className="neon-ring w-full rounded-full bg-primary py-3 font-bold text-primary-foreground disabled:opacity-40"
            >
              {t("bavardSeen")}
            </button>
          </div>
        ) : step.mode === "wolves" ? (
          <div className="space-y-3">
            <PlayerPicker
              players={candidates}
              selected={sel}
              onToggle={toggleTarget}
              disabledIds={forbiddenWolfIds}
            />
            <button
              disabled={sel.length !== 1}
              onClick={() => send({ targetId: sel[0] })}
              className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground disabled:opacity-40"
            >
              {t("packAgrees")}
            </button>
            {matriarch && (
              <button
                onClick={() => send({ disagreement: true })}
                className="w-full rounded-full border border-primary py-3 text-sm font-bold text-primary"
              >
                {t("disagreement")}
              </button>
            )}
          </div>
        ) : step.mode === "blackwolf" ? (
          (() => {
            const victimId = step.soloKill ? sel[0] : state.round.attackedId;
            const victim = state.players.find((p) => p.id === victimId);
            const infectLocked = !!actor.abilityUsed;
            const muteLocked = state.night < 2;
            const tab =
              bwTab === "attack" && !step.soloKill
                ? infectLocked
                  ? "mute"
                  : "infect"
                : bwTab;
            const marks: Record<string, React.ReactNode> = {};
            if (victimId)
              marks[victimId] = infect ? (
                <Droplet className="size-3.5 text-emerald-400" />
              ) : (
                <Swords className="size-3.5 text-destructive" />
              );
            if (mute)
              marks[mute] = (
                <span className="flex items-center gap-1">
                  {marks[mute]}
                  <MicOff className="size-3.5 text-amber-400" />
                </span>
              );
            const TABS = [
              {
                key: "attack" as const,
                label: t("bwTabAttack"),
                icon: Swords,
                locked: !step.soloKill,
              },
              {
                key: "infect" as const,
                label: t("bwTabInfect"),
                icon: Droplet,
                locked: infectLocked,
              },
              {
                key: "mute" as const,
                label: t("bwTabMute"),
                icon: MicOff,
                locked: muteLocked,
              },
            ];
            return (
              <div className="space-y-3">
                <p className="text-xs tracking-widest text-destructive uppercase">
                  {t("bwHubTitle")}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {TABS.map((tb) => (
                    <button
                      key={tb.key}
                      disabled={tb.locked}
                      onClick={() => setBwTab(tb.key)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-bold transition active:scale-95 disabled:opacity-30 ${
                        tab === tb.key && !tb.locked
                          ? "border-destructive bg-destructive/15 text-destructive shadow-[0_0_18px_rgba(236,72,153,0.4)]"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <tb.icon className="size-4" />
                      {tb.label}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground">
                  {tab === "attack"
                    ? t("bwPickAttack")
                    : tab === "infect"
                      ? t("bwPickInfect")
                      : t("bwPickMute")}
                </p>

                {tab === "infect" && (
                  <p
                    className={`text-[11px] font-bold uppercase ${infectLocked ? "text-muted-foreground" : "text-destructive"}`}
                  >
                    {infectLocked ? t("bwInfectUsed") : t("bwInfectAvailable")}
                  </p>
                )}

                {tab === "attack" && (
                  <PlayerPicker
                    players={candidates.filter((p) => p.id !== actor.id)}
                    selected={sel}
                    onToggle={(id) => {
                      setInfect(false);
                      toggleTarget(id);
                    }}
                    disabledIds={forbiddenWolfIds}
                    accent="crimson"
                    marks={marks}
                  />
                )}

                {tab === "infect" &&
                  (step.soloKill ? (
                    <PlayerPicker
                      players={candidates.filter((p) => p.id !== actor.id)}
                      selected={infect && sel[0] ? [sel[0]] : []}
                      disabledIds={forbiddenWolfIds}
                      onToggle={(id) => {
                        if (forbiddenWolfIds.includes(id)) return;
                        if (infect && sel[0] === id) {
                          setInfect(false);
                          setSel([]);
                          return;
                        }
                        setSel([id]);
                        setInfect(true);
                      }}
                      accent="crimson"
                      marks={marks}
                    />
                  ) : victim ? (
                    <button
                      onClick={() => setInfect((v) => !v)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl border p-4 text-sm font-bold transition ${
                        infect
                          ? "border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.45)]"
                          : "border-border text-foreground"
                      }`}
                    >
                      <Droplet className="size-4" />
                      {infect
                        ? t("bwInfectingTarget", { name: victim.name })
                        : t("bwInfectPrompt", { name: victim.name })}
                    </button>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t("bwNoVictimToInfect")}</p>
                  ))}

                {tab === "mute" && (
                  <PlayerPicker
                    players={candidates}
                    selected={mute ? [mute] : []}
                    onToggle={(id) => setMute((cur) => (cur === id ? null : id))}
                    disabledIds={state.round.previousMutedId ? [state.round.previousMutedId] : []}
                    accent="arcane"
                    marks={marks}
                  />
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() =>
                      send({
                        targetId: sel[0],
                        yes: infect,
                        muteId: mute ?? undefined,
                      })
                    }
                    className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground"
                  >
                    {t("validate")}
                  </button>
                  {step.optional && (
                    <button
                      onClick={() => send({})}
                      className="w-full rounded-full border border-border py-3 text-sm font-semibold text-muted-foreground"
                    >
                      {t("pass")}
                    </button>
                  )}
                </div>
              </div>
            );
          })()
        ) : step.mode === "threefaces" ? (
          <div className="space-y-3">
            <p className="text-xs tracking-widest text-primary uppercase">{t("facesChoosePower")}</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={actor.facesUsed?.includes("protect")}
                onClick={() => setFacePower("protect")}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs font-bold ${
                  facePower === "protect" ? "border-primary bg-primary/20 text-primary" : "border-border"
                } disabled:opacity-30`}
              >
                <Shield className="size-4" />
                {t("facesProtect")}
              </button>
              <button
                disabled={actor.facesUsed?.includes("potion")}
                onClick={() => setFacePower("life")}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs font-bold ${
                  facePower === "life" || facePower === "poison"
                    ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                    : "border-border"
                } disabled:opacity-30`}
              >
                <Sparkles className="size-4" />
                {t("facesPotion")}
              </button>
              <button
                disabled={actor.facesUsed?.includes("inspect")}
                onClick={() => setFacePower("inspect")}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs font-bold ${
                  facePower === "inspect" ? "border-amber-400 bg-amber-400/20 text-amber-300" : "border-border"
                } disabled:opacity-30`}
              >
                <Eye className="size-4" />
                {t("facesInspect")}
              </button>
            </div>

            {facePower === "protect" && (
              <PlayerPicker
                players={candidates}
                selected={sel}
                onToggle={toggleTarget}
                accent="arcane"
              />
            )}
            {facePower === "inspect" && (
              <PlayerPicker
                players={candidates.filter((p) => p.id !== actor.id)}
                selected={sel}
                onToggle={toggleTarget}
                accent="arcane"
              />
            )}
            {facePower === "life" && (
              <div className="space-y-2">
                <button
                  onClick={() => send({ facePower: "life" })}
                  disabled={!canWitchHeal(state)}
                  className="w-full rounded-full bg-emerald-500 py-3 font-bold text-black disabled:opacity-40"
                >
                  {attackedPlayerName
                    ? t("facesHealVictim", { name: attackedPlayerName })
                    : t("facesNoVictimToHeal")}
                </button>
                <button
                  onClick={() => setFacePower("poison")}
                  className="w-full rounded-full border border-destructive py-2.5 text-xs font-bold text-destructive"
                >
                  {t("facesSwitchPoison")}
                </button>
              </div>
            )}
            {facePower === "poison" && (
              <PlayerPicker
                players={candidates.filter((p) => p.id !== actor.id)}
                selected={sel}
                onToggle={toggleTarget}
                accent="poison"
              />
            )}

            {(facePower === "protect" || facePower === "inspect" || facePower === "poison") && (
              <button
                disabled={sel.length !== 1}
                onClick={() => send({ facePower, targetId: sel[0] })}
                className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground disabled:opacity-40"
              >
                {t("validate")}
              </button>
            )}

            {step.optional && (
              <button
                onClick={() => send({})}
                className="w-full rounded-full border border-border py-2 text-xs font-semibold text-muted-foreground"
              >
                {t("pass")}
              </button>
            )}
          </div>
        ) : step.mode === "witch" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs tracking-widest text-primary uppercase">{t("witchLifePotion")}</p>
              {actor.hasUsedLifePotion || actor.healUsed ? (
                <p className="text-xs text-muted-foreground">{t("witchLifeUsed")}</p>
              ) : attackedPlayerName ? (
                <button
                  onClick={() => setHeal((v) => !v)}
                  className={`w-full rounded-2xl border p-4 text-sm font-bold transition ${
                    heal
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                      : "border-border text-foreground"
                  }`}
                >
                  {heal
                    ? t("witchSavingVictim", { name: attackedPlayerName })
                    : t("witchSaveVictimPrompt", { name: attackedPlayerName })}
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">{t("nobodyAttacked")}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs tracking-widest text-destructive uppercase">
                {t("witchDeathPotion")}
              </p>
              {actor.hasUsedDeathPotion || actor.poisonUsed ? (
                <p className="text-xs text-muted-foreground">{t("witchDeathUsed")}</p>
              ) : (
                <PlayerPicker
                  players={candidates.filter((p) => p.id !== actor.id)}
                  selected={sel}
                  onToggle={toggleTarget}
                  accent="poison"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => send({ healUsed: heal, poisonId: sel[0] })}
                className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground"
              >
                {t("validate")}
              </button>
              {step.optional && (
                <button
                  onClick={() => send({})}
                  className="w-full rounded-full border border-border py-3 text-sm font-semibold text-muted-foreground"
                >
                  {t("pass")}
                </button>
              )}
            </div>
          </div>
        ) : step.mode === "bear" ? (
          <div className="space-y-4 text-center">
            {(() => {
              const { left, right } = bearNeighbors(state, actor.id);
              const growls = state.round.bearGrowls ?? false;
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-around rounded-2xl border border-primary/20 bg-card p-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("bearLeftNeighbor")}</p>
                      <p className="text-sm font-bold">{left?.name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t("bearRightNeighbor")}</p>
                      <p className="text-sm font-bold">{right?.name ?? "—"}</p>
                    </div>
                  </div>
                  <div
                    className={`rounded-2xl border p-4 font-black text-lg ${
                      growls
                        ? "border-destructive bg-destructive/10 text-destructive animate-pulse"
                        : "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {growls ? t("bearStatusGrowling") : t("bearStatusCalm")}
                  </div>
                </div>
              );
            })()}
            <button
              onClick={() => send({})}
              className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground"
            >
              {t("continue")}
            </button>
          </div>
        ) : step.mode === "yesno" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSpyChoice(true)}
                className={`rounded-2xl border p-4 text-sm font-bold transition ${
                  spyChoice === true
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-foreground"
                }`}
              >
                {t("petiteFillePeek")}
              </button>
              <button
                onClick={() => setSpyChoice(false)}
                className={`rounded-2xl border p-4 text-sm font-bold transition ${
                  spyChoice === false
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border text-foreground"
                }`}
              >
                {t("petiteFilleSleep")}
              </button>
            </div>
            <button
              disabled={spyChoice === null}
              onClick={() => send({ yes: spyChoice ?? false })}
              className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground disabled:opacity-40"
            >
              {t("validate")}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {step.roleId === "salvateur" && !actor.ultimateShieldUsed && (
              <button
                onClick={() => setShieldConfirm((v) => !v)}
                className={`w-full rounded-2xl border p-3 text-xs font-bold transition ${
                  shieldConfirm
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                <Shield className="inline size-4 mr-1" />
                {t("ultimateShieldToggle")}
              </button>
            )}

            {!shieldConfirm && (
              <PlayerPicker
                players={candidates}
                selected={sel}
                onToggle={toggleTarget}
                disabledIds={forbiddenWolfIds}
                accent={step.roleId === "maniaque" ? "crimson" : "arcane"}
              />
            )}

            <div className="flex gap-2 pt-2">
              <button
                disabled={!shieldConfirm && sel.length !== (step.mode === "two" ? 2 : 1)}
                onClick={() =>
                  send(shieldConfirm ? { ultimateShield: true } : { targetId: sel[0], targetIds: sel })
                }
                className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground disabled:opacity-40"
              >
                {t("validate")}
              </button>
              {step.optional && (
                <button
                  onClick={() => send({})}
                  className="w-full rounded-full border border-border py-3 text-sm font-semibold text-muted-foreground"
                >
                  {t("pass")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function HunterPanel({
  state,
  onDone,
}: {
  state: GameState;
  onDone: (s: GameState) => void;
}) {
  const { t } = useI18n();
  const [targetId, setTargetId] = useState<string | null>(null);
  const hunter = state.players.find((p) => p.id === state.hunterPending);
  const aliveCandidates = state.players.filter((p) => p.alive);

  return (
    <div className="surface-card animate-rise-in neon-ring space-y-4 rounded-3xl p-5">
      <div className="flex items-center gap-3 text-destructive">
        <Flame className="size-6 animate-pulse" />
        <h2 className="text-lg font-black uppercase">{t("hunterShotTitle")}</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("hunterShotDesc", { name: hunter?.name ?? "Le Chasseur" })}
      </p>

      <PlayerPicker
        players={aliveCandidates}
        selected={targetId ? [targetId] : []}
        onToggle={(id) => setTargetId(id)}
        accent="crimson"
      />

      <button
        disabled={!targetId}
        onClick={() => targetId && onDone(resolveHunter(state, targetId))}
        className="w-full rounded-full bg-destructive py-3 font-bold text-destructive-foreground transition active:scale-95 disabled:opacity-40"
      >
        {t("hunterFireConfirm")}
      </button>
    </div>
  );
}

function CaptainSuccessionPanel({
  state,
  onDone,
}: {
  state: GameState;
  onDone: (s: GameState) => void;
}) {
  const { t } = useI18n();
  const [targetId, setTargetId] = useState<string | null>(null);
  const formerCaptain = state.players.find(
    (p) => p.id === state.captainSuccessionPending,
  );
  const aliveCandidates = state.players.filter((p) => p.alive);

  return (
    <div className="surface-card animate-rise-in neon-ring space-y-4 rounded-3xl p-5">
      <div className="flex items-center gap-3 text-amber-400">
        <Crown className="size-6 animate-bounce" />
        <h2 className="text-lg font-black uppercase">{t("captainSuccessionTitle")}</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("captainSuccessionDesc", { name: formerCaptain?.name ?? "Le Capitaine" })}
      </p>

      <PlayerPicker
        players={aliveCandidates}
        selected={targetId ? [targetId] : []}
        onToggle={(id) => setTargetId(id)}
        accent="arcane"
      />

      <button
        disabled={!targetId}
        onClick={() => targetId && onDone(assignCaptain(state, targetId))}
        className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground transition active:scale-95 disabled:opacity-40"
      >
        {t("assignCaptainConfirm")}
      </button>
    </div>
  );
}

function DawnPanel({
  state,
  settings,
  direction,
  setupDone,
  debateDone,
  onDebateDone,
  onChange,
  onRemovePenalty,
  onUndo,
  canUndo,
}: {
  state: GameState;
  settings: GameSettings | null;
  direction: RotationDirection;
  setupDone: boolean;
  debateDone: boolean;
  onDebateDone: () => void;
  onChange: (s: GameState) => void;
  onRemovePenalty: (id: string) => void;
  onUndo: () => void;
  canUndo?: boolean;
}) {
  const { t } = useI18n();
  const alivePlayers = state.players.filter((p) => p.alive);
  const captain = state.players.find((p) => p.id === state.villageCaptainId);

  return (
    <div className="surface-card animate-rise-in space-y-5 rounded-3xl p-5">
      <div className="space-y-2 text-center">
        <p className="text-xs font-bold tracking-[0.3em] text-amber-400 uppercase">
          {t("dawnSummaryTitle")}
        </p>
        <h2 className="text-2xl font-black">{t("dayN", { n: state.day })}</h2>
      </div>

      {state.dawnSummary.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-bold text-amber-400 uppercase">{t("eventsTitle")}</p>
          <ul className="space-y-1 text-sm text-foreground">
            {state.dawnSummary.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Debate Wheel & Penalty Controls */}
      <div className="space-y-3">
        <h3 className="text-xs tracking-widest text-primary uppercase">{t("debateTitle")}</h3>
        <DebateWheel
          players={alivePlayers}
          direction={direction}
          captainId={captain?.id}
          onPenalty={(id) => onChange(addDebatePenalty(state, id))}
          onRemovePenalty={onRemovePenalty}
        />
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => onChange(goToVote(state))}
          className="w-full rounded-full bg-primary py-3.5 text-base font-bold text-primary-foreground transition active:scale-95 shadow-lg"
        >
          {t("proceedToVote")}
        </button>
        {state.day === 1 && !state.voteSkippedOffer && (
          <button
            onClick={() => onChange(skipVote(state))}
            className="w-full rounded-full border border-border py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-card active:scale-95"
          >
            {t("skipDay1Vote")}
          </button>
        )}
      </div>
    </div>
  );
}
