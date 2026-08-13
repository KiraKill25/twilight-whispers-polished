import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Crown, GripVertical } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { useI18n } from "@/lib/i18n";
import { loadSetup, saveSetup, type SetupData } from "@/lib/session";

const TITLE = "Disposition du cercle — Nightfall Oracle";
const DESC =
  "Place les joueurs autour de la table avant la première nuit : l'ordre du cercle détermine les voisins.";

export const Route = createFileRoute("/seating")({
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
  component: SeatingPage,
});

type P = { name: string; roleId: string };

function SeatingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [order, setOrder] = useState<P[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const s = loadSetup();
    if (!s?.players?.length) {
      navigate({ to: "/setup" });
      return;
    }
    // Le capitaine ouvre le cercle (siège n°1, en haut).
    const cap = s.villageCaptainId;
    const players = [...s.players];
    const ci = players.findIndex((p) => p.name === cap);
    if (ci > 0) players.unshift(...players.splice(ci, 1));
    setSetup(s);
    setOrder(players);
  }, [navigate]);

  const swap = (a: number, b: number) => {
    if (a === b) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  };

  const indexAtPoint = (x: number, y: number) => {
    for (let i = 0; i < nodeRefs.current.length; i++) {
      const el = nodeRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    return null;
  };

  const startDrag = (i: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    setDragIndex(i);
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture?.(e.pointerId);
    const move = (ev: PointerEvent) =>
      setOverIndex(indexAtPoint(ev.clientX, ev.clientY));
    const up = (ev: PointerEvent) => {
      const to = indexAtPoint(ev.clientX, ev.clientY);
      if (to !== null) swap(i, to);
      setDragIndex(null);
      setOverIndex(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  if (!setup) return <main className="p-8 text-muted-foreground">{t("loading")}</main>;

  const n = order.length;
  const captain = setup.villageCaptainId;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-4 box-border overflow-x-hidden overflow-y-auto px-4 py-4">
      <TopBar />
      <header className="space-y-1 text-center">
        <h1 className="neon-text text-2xl font-black">{t("seatingTitle")}</h1>
        <p className="text-xs text-muted-foreground">{t("seatingHint")}</p>
      </header>

      <div className="surface-card neon-ring animate-rise-in relative flex-1 rounded-3xl p-4">
        <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
          {/* Table centrale */}
          <div
            className="absolute inset-[22%] rounded-full border border-primary/40"
            style={{
              background:
                "radial-gradient(circle, oklch(0.589 0.239 359.7 / 22%), transparent 72%)",
            }}
          />
          <div className="absolute inset-[22%] grid place-items-center text-center">
            <div>
              <p className="text-[10px] tracking-[0.3em] text-primary uppercase">
                {t("seatingTable")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("seatingCount", { n })}
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-[8%] rounded-full border border-dashed border-border" />

          {order.map((p, i) => {
            const angle = (i / Math.max(n, 1)) * 2 * Math.PI - Math.PI / 2;
            const left = 50 + 42 * Math.cos(angle);
            const top = 50 + 42 * Math.sin(angle);
            const isCap = !!captain && p.name === captain;
            const dragging = dragIndex === i;
            const over = overIndex === i && dragIndex !== null && dragIndex !== i;
            return (
              <div
                key={p.name + i}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                onPointerDown={startDrag(i)}
                role="button"
                tabIndex={0}
                aria-label={t("seatingNodeLabel", { n: i + 1, name: p.name })}
                className={`absolute w-[4.6rem] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-xl border px-1.5 py-1.5 text-center transition ${
                  dragging
                    ? "z-20 scale-110 border-primary bg-primary/25"
                    : over
                      ? "neon-ring z-10 border-primary bg-primary/15"
                      : "border-border bg-card/90"
                }`}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="flex items-center justify-center gap-0.5 text-[10px] text-primary">
                  {isCap ? <Crown className="size-3" /> : null}
                  <span className="font-bold">{i + 1}</span>
                  <GripVertical className="size-3 text-muted-foreground" />
                </div>
                <p className="truncate text-[11px] font-semibold">{p.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => {
          saveSetup({ ...setup, players: order });
          navigate({ to: "/game" });
        }}
        className="neon-ring animate-pulse-glow w-full rounded-full bg-primary py-4 font-bold text-primary-foreground"
      >
        {t("seatingConfirm")}
      </button>
    </main>
  );
}
