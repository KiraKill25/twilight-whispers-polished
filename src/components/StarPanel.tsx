import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Player } from "@/game/engine";

/** Bouton étoile : tap = +1 (animation flottante), appui long = -1. */
function StarButton({
  player,
  onChange,
}: {
  player: Player;
  onChange: (delta: number) => void;
}) {
  const { t } = useI18n();
  const [pops, setPops] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  const stars = player.stars ?? 0;

  const start = () => {
    longPressed.current = false;
    timer.current = setTimeout(() => {
      longPressed.current = true;
      if (stars > 0) onChange(-1);
    }, 500);
  };
  const end = () => {
    if (timer.current) clearTimeout(timer.current);
    if (longPressed.current) return;
    onChange(1);
    const id = Date.now();
    setPops((p) => [...p, id]);
    setTimeout(() => setPops((p) => p.filter((x) => x !== id)), 900);
  };

  return (
    <button
      type="button"
      aria-label={t("starAward", { name: player.name })}
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={() => timer.current && clearTimeout(timer.current)}
      onContextMenu={(e) => e.preventDefault()}
      className="relative flex items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 text-xs font-black text-gold transition active:scale-90"
    >
      <Star className="size-3.5 fill-current" />
      <span className="tabular-nums">{stars}</span>
      <AnimatePresence>
        {pops.map((id) => (
          <motion.span
            key={id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -28, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="pointer-events-none absolute -top-1 left-1/2 text-sm"
          >
            ⭐
          </motion.span>
        ))}
      </AnimatePresence>
    </button>
  );
}

/** Panneau du meneur : récompense les bonnes déductions pendant le débat. */
export function StarPanel({
  players,
  onChange,
}: {
  players: Player[];
  onChange: (playerId: string, delta: number) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-2 rounded-2xl border border-gold/30 p-3">
      <p className="text-[10px] tracking-widest text-gold uppercase">
        {t("starsLabel")}
      </p>
      <p className="text-[10px] text-muted-foreground">{t("starsHint")}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {players.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
          >
            <span className="truncate text-xs font-bold">{p.name}</span>
            <StarButton player={p} onChange={(d) => onChange(p.id, d)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
