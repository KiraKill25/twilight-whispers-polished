import { useEffect, useRef, useState } from "react";
import { Pause, Play, Plus, RotateCcw, SkipForward } from "lucide-react";
import { playTimeUpAlert } from "@/lib/audio";
import { useI18n } from "@/lib/i18n";
import {
  SeatingWheel,
  buildDebateQueue,
  type RotationDirection,
} from "@/components/SeatingWheel";
import type { Player } from "@/game/engine";
import { useScrollLock } from "@/hooks/use-scroll-lock";

/** Choix du capitaine en début de journée : sens du débat, sens du vote, ordre de son vote. */
export interface CaptainSetup {
  debateDirection: RotationDirection;
  voteDirection: RotationDirection;
  captainVotesFirst: boolean;
}

function DirRow({
  value,
  onChange,
}: {
  value: RotationDirection;
  onChange: (d: RotationDirection) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid gap-2">
      {(["clockwise", "counter-clockwise"] as const).map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`w-full rounded-full py-2.5 text-xs font-bold ${
            value === d
              ? "bg-primary text-primary-foreground"
              : "border border-primary/60 text-primary"
          }`}
        >
          {d === "clockwise" ? "↻ " : "↺ "}
          {d === "clockwise" ? t("dirClockwise") : t("dirCounterClockwise")}
        </button>
      ))}
    </div>
  );
}

function ModalShell({ children }: { children: React.ReactNode }) {
  useScrollLock();
  return (
    <div className="fixed inset-0 z-50 flex w-screen max-w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <div className="surface-card animate-rise-in neon-ring mx-auto my-auto box-border max-h-[85vh] w-full max-w-sm shrink-0 space-y-4 overflow-y-auto overscroll-contain rounded-3xl p-6 text-center shadow-2xl sm:max-w-md">
        {children}
      </div>
    </div>
  );
}

/** Étape 1 — début de journée : le capitaine choisit UNIQUEMENT le sens du débat. */
export function DebateSetupModal({
  captainName,
  captainMuted,
  onConfirm,
}: {
  captainName?: string;
  captainMuted?: boolean;
  onConfirm: (d: RotationDirection) => void;
}) {
  const { t } = useI18n();
  const [debateDirection, setDebateDirection] =
    useState<RotationDirection>("clockwise");

  return (
    <ModalShell>
      <p className="text-[11px] tracking-widest text-primary uppercase">
        {t("captainDirTitle")}
      </p>
      <p className="text-sm font-semibold">
        {captainName
          ? t("captainDirText", { name: captainName })
          : t("noCaptainDir")}
      </p>

      {captainMuted && (
        <p className="rounded-xl border border-destructive/50 p-3 text-xs text-muted-foreground">
          {t("captainMutedHint")}
        </p>
      )}

      <div className="space-y-2 text-start">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          {t("setupDebateDir")}
        </p>
        <DirRow value={debateDirection} onChange={setDebateDirection} />
      </div>

      <p className="text-[10px] text-muted-foreground">{t("timerLockedHint")}</p>
      <button
        onClick={() => onConfirm(debateDirection)}
        className="neon-ring w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
      >
        {t("confirmCaptainSetup")}
      </button>
    </ModalShell>
  );
}

/** Étape 2 — fin du débat : le capitaine règle le sens du vote et son moment. */
export function VoteSetupModal({
  captainName,
  captainMuted,
  onConfirm,
}: {
  captainName?: string;
  captainMuted?: boolean;
  onConfirm: (s: { voteDirection: RotationDirection; captainVotesFirst: boolean }) => void;
}) {
  const { t } = useI18n();
  const [voteDirection, setVoteDirection] =
    useState<RotationDirection>("clockwise");
  const [captainVotesFirst, setCaptainVotesFirst] = useState(true);

  return (
    <ModalShell>
      <p className="text-[11px] tracking-widest text-primary uppercase">
        {t("voteSetupTitle")}
      </p>
      <p className="text-sm font-semibold">
        {captainName
          ? t("voteSetupText", { name: captainName })
          : t("noCaptainDir")}
      </p>

      {captainMuted && (
        <p className="rounded-xl border border-destructive/50 p-3 text-xs text-muted-foreground">
          {t("captainMutedHint")}
        </p>
      )}

      <div className="space-y-2 text-start">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          {t("setupVoteDir")}
        </p>
        <DirRow value={voteDirection} onChange={setVoteDirection} />
      </div>

      <div className="space-y-2 text-start">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          {t("setupCaptainTiming")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map((first) => (
            <button
              key={String(first)}
              onClick={() => setCaptainVotesFirst(first)}
              className={`rounded-full py-2.5 text-xs font-bold ${
                captainVotesFirst === first
                  ? "bg-accent text-background"
                  : "border border-accent/60 text-accent"
              }`}
            >
              {first ? t("captainVotesFirst") : t("captainVotesLast")}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onConfirm({ voteDirection, captainVotesFirst })}
        className="neon-ring w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
      >
        {t("confirmVoteSetup")}
      </button>
    </ModalShell>
  );
}


/** Roue de débat : anneau des joueurs + timer central + barre de contrôle MJ. */
export function DebateWheel({
  seating,
  seconds,
  captainId,
  direction,
  armed,
  onFinish,
  onStar,
}: {
  seating: Player[];
  seconds: number;
  captainId?: string;
  direction: RotationDirection;
  /** Le timer ne démarre qu'après validation des choix du capitaine. */
  armed?: boolean;
  onFinish: () => void;
  /** Attribution d'étoiles à l'orateur actif (tap = +1, appui long = -1). */
  onStar?: (playerId: string, delta: number) => void;
}) {
  const { t } = useI18n();
  // Loup Noir : un joueur réduit au silence ne prend aucun tour de parole.
  // Pour le capitaine, cela retire aussi ses discours d'ouverture et de clôture,
  // mais il conserve tous ses choix tactiques (sens du débat, sens et ordre du vote).
  const queue = buildDebateQueue(seating, captainId, direction).filter(
    (s) => !s.player.mutedForDay,
  );
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const alerted = useRef(false);

  // Armement : dès que le capitaine a validé, le chronomètre peut tourner.
  useEffect(() => {
    if (armed) setRunning(true);
    else setRunning(false);
  }, [armed]);

  useEffect(() => {
    setLeft(seconds);
    alerted.current = false;
  }, [i, seconds]);

  useEffect(() => {
    if (!running || !armed) return;
    const id = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running, armed, i]);

  useEffect(() => {
    if (left === 0 && !alerted.current) {
      alerted.current = true;
      playTimeUpAlert();
    }
  }, [left]);

  const current = queue[i];
  if (!current) return null;
  const pct = Math.max(0, Math.min(1, left / Math.max(1, seconds)));
  const R = 42;
  const C = 2 * Math.PI * R;

  return (
    <div className="space-y-4">
      <p className="text-center text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
        {t("speaker", { i: i + 1, n: queue.length })}
        {current.role !== "normal" && (
          <span className="ms-2 text-primary">
            {current.role === "opening"
              ? t("captainOpening")
              : t("captainClosing")}
          </span>
        )}
      </p>

      <SeatingWheel
        players={seating}
        activeId={current.player.id}
        direction={direction}
        captainId={captainId}
        center={
          <div className="relative flex size-full items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute size-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                strokeWidth="6"
                className="stroke-input"
              />
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct)}
                className={
                  left === 0 ? "stroke-destructive" : "stroke-primary"
                }
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="relative z-10 px-2 text-center">
              <div className="relative">
                <button
                  type="button"
                  aria-label={t("starAward", { name: current.player.name })}
                  onPointerDown={pressStart}
                  onPointerUp={pressEnd}
                  onPointerLeave={pressCancel}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`max-w-full truncate text-[10px] font-bold tracking-widest text-primary uppercase transition-transform duration-200 select-none ${
                    namePulse ? "scale-110" : "scale-100"
                  }`}
                >
                  {current.player.name}
                </button>
                {pops.map((p) => (
                  <span
                    key={p.id}
                    className={`pointer-events-none absolute left-1/2 -translate-x-1/2 text-[11px] font-black whitespace-nowrap ${
                      p.delta > 0
                        ? "animate-star-float text-gold"
                        : "animate-star-drop text-destructive"
                    }`}
                  >
                    ⭐ {p.delta > 0 ? "+1" : "-1"}
                  </span>
                ))}
              </div>
              <p
                className={`text-2xl font-black tabular-nums ${left === 0 ? "animate-danger-pulse text-destructive" : "text-foreground"}`}
              >
                {String(Math.floor(left / 60)).padStart(2, "0")}:
                {String(left % 60).padStart(2, "0")}
              </p>
              <p
                key={`stars-${currentStars}`}
                className="animate-counter-pop text-[11px] font-bold text-gold"
              >
                ⭐ {currentStars}
              </p>
              <p className="text-[9px] tracking-widest text-muted-foreground uppercase">
                {t("currentSpeaker")}
              </p>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={!armed}
          onClick={() => setRunning((r) => !r)}
          className="flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold disabled:opacity-40"
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? t("pauseTimer") : t("startTimer")}
        </button>
        <button
          onClick={() => {
            setLeft(seconds);
            alerted.current = false;
          }}
          className="flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold"
        >
          <RotateCcw className="size-4" />
          {t("resetTimer")}
        </button>
        <button
          onClick={() => setLeft((v) => v + 10)}
          className="flex items-center justify-center gap-1 rounded-full border border-primary/60 py-3 text-sm font-bold text-primary"
        >
          <Plus className="size-3.5" />
          {t("plus10")}
        </button>
        <button
          onClick={() => (i + 1 < queue.length ? setI(i + 1) : onFinish())}
          className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-bold text-primary-foreground"
        >
          <SkipForward className="size-4" />
          {i + 1 < queue.length ? t("nextSpeaker") : t("endDebate")}
        </button>
      </div>
    </div>
  );
}
