import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useScrollLock } from "@/hooks/use-scroll-lock";

export type OverlayTone = "NIGHT" | "DAY" | "WOLF";

const TONE: Record<OverlayTone, { glow: string; border: string }> = {
  NIGHT: {
    glow: "shadow-[0_0_40px_rgba(99,102,241,0.25)]",
    border: "border-primary/50",
  },
  DAY: {
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.25)]",
    border: "border-gold/50",
  },
  WOLF: {
    glow: "shadow-[0_0_40px_rgba(236,72,153,0.3)]",
    border: "border-destructive/60",
  },
};

/**
 * Carte modale autonome, parfaitement centrée sur mobile et desktop,
 * posée sur un fond sombre flouté (glassmorphism).
 */
export function OverlayCard({
  tone = "NIGHT",
  children,
  label,
}: {
  tone?: OverlayTone;
  children: ReactNode;
  label?: string;
}) {
  const theme = TONE[tone];
  useScrollLock();
  return (
    <div className="fixed inset-0 z-50 flex w-screen max-w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <motion.div
        role="dialog"
        aria-label={label}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`surface-card mx-auto box-border max-h-[85vh] w-full max-w-sm shrink-0 space-y-5 overflow-y-auto overscroll-contain rounded-3xl border p-6 text-center shadow-2xl backdrop-blur-2xl sm:max-w-md ${theme.border} ${theme.glow}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
