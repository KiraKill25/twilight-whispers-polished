import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Gavel,
  Moon,
  Star,
  Sun,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import type { TranslationKey } from "@/lib/i18n";

const STEPS = [
  { icon: Users, tone: "text-primary" },
  { icon: Moon, tone: "text-accent" },
  { icon: Moon, tone: "text-primary" },
  { icon: Sun, tone: "text-gold" },
  { icon: Gavel, tone: "text-destructive" },
  { icon: Trophy, tone: "text-gold" },
] as const;

/** Guide du Meneur : parcours interactif en 6 étapes, plein écran. */
export function GuideModal({ onClose }: { onClose: () => void }) {
  const { t, dir } = useI18n();
  useScrollLock();
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const Icon = step.icon;
  const n = STEPS.length;
  const key = (suffix: string) => `guideStep${i + 1}${suffix}` as TranslationKey;

  return (
    <div className="fixed inset-0 z-50 flex w-screen max-w-full items-center justify-center overflow-y-auto bg-black/90 p-4 backdrop-blur-md">
      <div className="surface-card neon-ring relative mx-auto my-auto box-border max-h-[88vh] w-full max-w-sm space-y-5 overflow-y-auto rounded-3xl p-6 sm:max-w-md">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("guideClose")}
          className="absolute end-4 top-4 rounded-full border border-border p-1.5 text-muted-foreground"
        >
          <X className="size-4" />
        </button>

        <p className="text-[11px] tracking-[0.3em] text-primary uppercase">
          {t("guideTitle")}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: dir === "rtl" ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir === "rtl" ? 24 : -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 text-center"
          >
            <div
              className={`mx-auto flex size-20 items-center justify-center rounded-3xl border border-border bg-input/40 ${step.tone}`}
            >
              <Icon className="size-9" />
              {i === 3 && <Star className="size-5 fill-current" />}
            </div>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
              {t(key("Kicker"))}
            </p>
            <h2 className="text-lg font-black">{t(key("Title"))}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t(key("Body"))}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((_, k) => (
            <span
              key={k}
              className={`h-1.5 rounded-full transition-all ${
                k === i ? "w-6 bg-primary" : "w-1.5 bg-input"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-[10px] tracking-widest text-muted-foreground uppercase">
          {t("guideStepOf", { i: i + 1, n })}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={i === 0}
            onClick={() => setI((v) => Math.max(0, v - 1))}
            className="flex items-center justify-center gap-1 rounded-full border border-border py-3 text-xs font-bold disabled:opacity-40"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
            {t("back")}
          </button>
          {i + 1 < n ? (
            <button
              type="button"
              onClick={() => setI((v) => v + 1)}
              className="flex items-center justify-center gap-1 rounded-full bg-primary py-3 text-xs font-bold text-primary-foreground"
            >
              {t("next")}
              <ChevronRight className="size-4 rtl:rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="gradient-neon rounded-full py-3 text-xs font-black text-primary-foreground"
            >
              {t("guideStart")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
