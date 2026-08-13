import type { ReactNode } from "react";
import { Crown, RotateCw, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Player } from "@/game/engine";

export type RotationDirection = "clockwise" | "counter-clockwise";

/**
 * Roue de placement circulaire : chaque joueur est un nœud sur l'anneau,
 * dans l'ordre exact du cercle physique. Le centre accueille le hub (timer / vote).
 */
export function SeatingWheel({
  players,
  activeId,
  direction,
  captainId,
  onNodeClick,
  badge,
  center,
}: {
  players: Player[];
  activeId?: string;
  direction?: RotationDirection;
  captainId?: string;
  onNodeClick?: (id: string) => void;
  /** Contenu additionnel affiché sur le nœud (compteur de voix, avatars…). */
  badge?: (p: Player) => ReactNode;
  center: ReactNode;
}) {
  const { t } = useI18n();
  const n = players.length || 1;

  return (
    <div className="relative mx-auto box-border aspect-square w-full max-w-[26rem] overflow-hidden">
      {/* Anneau */}
      <div className="absolute inset-[18%] rounded-full border border-primary/30 bg-[radial-gradient(circle_at_50%_35%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_70%)]" />
      <div className="absolute inset-[18%] animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-primary/20" />

      {/* Flèche de rotation */}
      {direction && (
        <div className="absolute top-[19%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span
            className="flex items-center gap-1 rounded-full border border-primary/50 bg-background/80 px-2 py-1 text-[10px] font-bold tracking-widest text-primary uppercase"
            aria-label={
              direction === "clockwise"
                ? t("rotationClockwise")
                : t("rotationCounter")
            }
          >
            {direction === "clockwise" ? (
              <RotateCw className="size-3 animate-pulse" />
            ) : (
              <RotateCcw className="size-3 animate-pulse" />
            )}
            {direction === "clockwise" ? "↻" : "↺"}
          </span>
        </div>
      )}

      {/* Hub central */}
      <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full text-center">
        {center}
      </div>

      {/* Nœuds joueurs */}
      {players.map((p, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const r = 44;
        const x = 50 + r * Math.cos(angle);
        const y = 50 + r * Math.sin(angle);
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            type="button"
            disabled={!onNodeClick}
            onClick={() => onNodeClick?.(p.id)}
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={t("seatingNodeLabel", { n: i + 1, name: p.name })}
            aria-current={active || undefined}
            className={`absolute w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-1 py-1.5 text-center transition-all duration-300 ${
              active
                ? "scale-110 border-primary bg-primary/20 shadow-[0_0_18px_2px_color-mix(in_oklab,var(--color-primary)_55%,transparent)]"
                : "border-border bg-card/80"
            } ${!p.alive ? "opacity-40 line-through" : ""}`}
          >
            <span className="block text-[9px] tabular-nums text-muted-foreground">
              {i + 1}
            </span>
            <span className="flex items-center justify-center gap-0.5 text-[10px] leading-tight font-bold break-words">
              {p.name}
              {p.id === captainId && <Crown className="size-2.5 text-accent" />}
            </span>
            {badge?.(p)}
          </button>
        );
      })}
    </div>
  );
}

/** File de passage : voisins du capitaine selon la direction, capitaine en dernier. */
export function buildTurnQueue(
  seating: Player[],
  captainId: string | undefined,
  direction: RotationDirection,
): Player[] {
  const alive = seating.filter((p) => p.alive);
  if (!alive.length) return [];
  const capIndex = seating.findIndex((p) => p.id === captainId);
  if (capIndex < 0) {
    return direction === "clockwise" ? alive : [...alive].reverse();
  }
  const n = seating.length;
  const queue: Player[] = [];
  for (let k = 1; k <= n; k++) {
    const idx =
      direction === "clockwise"
        ? (capIndex + k) % n
        : ((capIndex - k) % n + n) % n;
    const p = seating[idx];
    if (p?.alive) queue.push(p);
  }
  return queue;
}

/** Voisins vivants du capitaine dans l'ordre choisi (capitaine exclu). */
function othersInDirection(
  seating: Player[],
  captainId: string | undefined,
  direction: RotationDirection,
): Player[] {
  const alive = seating.filter((p) => p.alive);
  const capIndex = seating.findIndex((p) => p.id === captainId);
  if (capIndex < 0)
    return direction === "clockwise" ? alive : [...alive].reverse();
  const n = seating.length;
  const out: Player[] = [];
  for (let k = 1; k < n; k++) {
    const idx =
      direction === "clockwise"
        ? (capIndex + k) % n
        : (((capIndex - k) % n) + n) % n;
    const p = seating[idx];
    if (p?.alive && p.id !== captainId) out.push(p);
  }
  return out;
}

/**
 * File du débat : le capitaine ouvre, puis les joueurs dans le sens choisi,
 * puis le capitaine referme le débat (discours de clôture).
 */
export function buildDebateQueue(
  seating: Player[],
  captainId: string | undefined,
  direction: RotationDirection,
): { player: Player; role: "opening" | "normal" | "closing" }[] {
  const captain = seating.find((p) => p.id === captainId && p.alive);
  const others = othersInDirection(seating, captainId, direction);
  if (!captain)
    return others.map((player) => ({ player, role: "normal" as const }));
  return [
    { player: captain, role: "opening" as const },
    ...others.map((player) => ({ player, role: "normal" as const })),
    { player: captain, role: "closing" as const },
  ];
}

/** File de vote : capitaine en premier ou en dernier, selon son choix. */
export function buildVoteQueue(
  seating: Player[],
  captainId: string | undefined,
  direction: RotationDirection,
  captainVotesFirst: boolean,
): Player[] {
  const captain = seating.find((p) => p.id === captainId && p.alive);
  const others = othersInDirection(seating, captainId, direction);
  if (!captain) return others;
  return captainVotesFirst ? [captain, ...others] : [...others, captain];
}
