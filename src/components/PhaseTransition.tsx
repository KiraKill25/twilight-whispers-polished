import { useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { playNightFall, playMorningBell } from "@/lib/audio";
import { useScrollLock } from "@/hooks/use-scroll-lock";

const THEME = {
  NIGHT: {
    glow: "oklch(0.62 0.22 285)",
    glow2: "oklch(0.68 0.20 255)",
    text: "oklch(0.86 0.12 280)",
  },
  DAY: {
    glow: "oklch(0.82 0.17 75)",
    glow2: "oklch(0.75 0.20 45)",
    text: "oklch(0.90 0.14 85)",
  },
} as const;

/**
 * Carte modale autonome "La nuit tombe" / "Le jour se lève".
 * La phase n'avance que lorsque le Maître du Jeu appuie sur « Continuer ».
 */
export function PhaseTransition({
  kind,
  subtitle,
  onDone,
}: {
  kind: "NIGHT" | "DAY";
  subtitle?: string;
  onDone: () => void;
}) {
  const { t: tr } = useI18n();
  const night = kind === "NIGHT";
  const theme = THEME[kind];
  useScrollLock();

  useEffect(() => {
    if (night) playNightFall();
    else playMorningBell();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-[90] flex w-screen max-w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-black/85 p-4 backdrop-blur-md"
    >
      {/* Particules atmosphériques */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute size-1.5 rounded-full"
          style={{
            background: i % 2 ? theme.glow2 : theme.glow,
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            filter: "blur(1px)",
          }}
          initial={{ opacity: 0, y: 20, scale: 0.4 }}
          animate={{ opacity: [0, 0.9, 0], y: night ? [20, -40] : [20, -70], scale: [0.4, 1.2, 0.6] }}
          transition={{ duration: 3.2, delay: i * 0.12, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      {/* Carte type Role Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
        className={`relative mx-auto box-border flex max-h-[85vh] w-full max-w-sm shrink-0 flex-col items-center gap-6 overflow-y-auto overscroll-contain rounded-3xl border p-8 text-center backdrop-blur-2xl sm:max-w-md ${
          night
            ? "shadow-[0_0_40px_rgba(99,102,241,0.25)]"
            : "shadow-[0_0_40px_rgba(245,158,11,0.25)]"
        }`}
        style={{
          borderColor: `color-mix(in oklab, ${theme.glow} 55%, transparent)`,
          background: `linear-gradient(160deg, color-mix(in oklab, ${theme.glow} 12%, transparent), oklch(0.15 0.04 305 / 75%))`,
        }}
      >
        {/* Anneau néon pulsant */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl"
          animate={{
            boxShadow: [
              `0 0 24px 0 color-mix(in oklab, ${theme.glow} 45%, transparent), inset 0 0 24px color-mix(in oklab, ${theme.glow} 18%, transparent)`,
              `0 0 70px 8px color-mix(in oklab, ${theme.glow} 80%, transparent), inset 0 0 46px color-mix(in oklab, ${theme.glow} 32%, transparent)`,
              `0 0 24px 0 color-mix(in oklab, ${theme.glow} 45%, transparent), inset 0 0 24px color-mix(in oklab, ${theme.glow} 18%, transparent)`,
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Icône */}
        <motion.div
          className="relative grid size-32 place-items-center"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {night ? (
            <svg viewBox="0 0 120 120" className="size-28" fill="none" aria-hidden>
              <defs>
                <radialGradient id="pt-moon" cx="42%" cy="48%" r="55%">
                  <stop offset="0%" stopColor="oklch(0.92 0.08 285)" />
                  <stop offset="60%" stopColor={theme.glow} />
                  <stop offset="100%" stopColor={theme.glow2} stopOpacity="0" />
                </radialGradient>
                <mask id="pt-moon-mask">
                  <rect width="120" height="120" fill="white" />
                  <circle cx="76" cy="44" r="32" fill="black" />
                </mask>
              </defs>
              <circle cx="54" cy="60" r="50" fill={theme.glow} fillOpacity="0.1" />
              <circle cx="54" cy="60" r="36" fill="url(#pt-moon)" mask="url(#pt-moon-mask)" />
            </svg>
          ) : (
            <>
              <motion.svg
                viewBox="0 0 120 120"
                className="absolute size-32"
                fill="none"
                aria-hidden
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                  const r = (a * Math.PI) / 180;
                  return (
                    <line
                      key={a}
                      x1={60 + 34 * Math.cos(r)}
                      y1={60 + 34 * Math.sin(r)}
                      x2={60 + 54 * Math.cos(r)}
                      y2={60 + 54 * Math.sin(r)}
                      stroke={theme.glow2}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeOpacity="0.75"
                    />
                  );
                })}
              </motion.svg>
              <svg viewBox="0 0 120 120" className="size-24" fill="none" aria-hidden>
                <defs>
                  <radialGradient id="pt-sun" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="oklch(0.95 0.13 90)" />
                    <stop offset="55%" stopColor={theme.glow} />
                    <stop offset="100%" stopColor={theme.glow2} stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="60" cy="60" r="52" fill={theme.glow} fillOpacity="0.1" />
                <circle cx="60" cy="60" r="30" fill="url(#pt-sun)" />
              </svg>
            </>
          )}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-3xl font-black tracking-tight"
          style={{ color: theme.text, textShadow: `0 0 24px ${theme.glow}` }}
        >
          {night ? tr("nightFalls") : tr("dayRises")}
        </motion.h2>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-sm text-muted-foreground"
          >
            {subtitle}
          </motion.p>
        )}

        <motion.button
          type="button"
          onClick={onDone}
          whileTap={{ scale: 0.96 }}
          className="neon-ring w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground"
        >
          {tr("continue")}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
