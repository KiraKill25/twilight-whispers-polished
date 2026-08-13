import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useMuted } from "@/hooks/use-muted";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { HOWTO, NARRATION_SRC, SLIDE_TIMESTAMPS } from "@/lib/howto";
import slide1 from "@/assets/howto/slide-1.jpg";
import slide2 from "@/assets/howto/slide-2.jpg";
import slide3 from "@/assets/howto/slide-3.jpg";
import slide4 from "@/assets/howto/slide-4.jpg";
import slide5 from "@/assets/howto/slide-5.jpg";

const IMAGES = [slide1, slide2, slide3, slide4, slide5];

/** Modale "Comment jouer" : 5 diapositives illustrées, narration synchronisée. */
export function HowToPlayModal({ onClose }: { onClose: () => void }) {
  const { lang, dir } = useI18n();
  const muted = useMuted();
  const copy = HOWTO[lang];
  const stamps = useMemo(() => SLIDE_TIMESTAMPS[lang], [lang]);
  useScrollLock();

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  /** Empêche le retour de timeupdate de contrer une navigation manuelle. */
  const seeking = useRef(false);

  // ── Moteur audio ────────────────────────────────────────────────
  useEffect(() => {
    const a = new Audio(NARRATION_SRC[lang]);
    a.preload = "auto";
    audioRef.current = a;
    a.muted = muted;
    a.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
    return () => {
      a.pause();
      a.src = "";
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Coupure globale du son
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Diapositive suivie par le temps de la narration
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (seeking.current) return;
      let idx = 0;
      for (let k = 0; k < stamps.length; k++)
        if (a.currentTime + 0.25 >= stamps[k]) idx = k;
      setI((prev) => (prev === idx ? prev : idx));
    };
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [stamps]);

  const goTo = useCallback(
    (next: number) => {
      const idx = Math.max(0, Math.min(IMAGES.length - 1, next));
      setI(idx);
      const a = audioRef.current;
      if (!a) return;
      seeking.current = true;
      try {
        a.currentTime = stamps[idx];
      } catch {
        /* ignore */
      }
      window.setTimeout(() => {
        seeking.current = false;
      }, 400);
      if (playing) void a.play().catch(() => {});
    },
    [playing, stamps],
  );

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  // Clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goTo(dir === "rtl" ? i - 1 : i + 1);
      else if (e.key === "ArrowLeft") goTo(dir === "rtl" ? i + 1 : i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, goTo, onClose, dir]);

  const slide = copy.slides[i];
  const last = i === IMAGES.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex w-screen max-w-full items-end justify-center overflow-x-hidden overflow-y-auto bg-black/85 p-4 backdrop-blur-md sm:items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="surface-card neon-ring relative mx-auto box-border flex max-h-[85vh] w-full max-w-sm shrink-0 flex-col overflow-hidden overscroll-contain rounded-3xl border border-border shadow-2xl sm:max-w-md"
      >
        {/* Illustration + Ken Burns */}
        <div className="relative aspect-[16/11] shrink-0 overflow-hidden bg-background">
          <AnimatePresence mode="sync">
            <motion.img
              key={i}
              src={IMAGES[i]}
              alt={slide.title}
              width={1536}
              height={1024}
              loading="lazy"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1.06 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.6, ease: "easeInOut" },
                scale: { duration: 10, ease: "linear" },
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? copy.pause : copy.play}
              className="grid size-9 place-items-center rounded-full bg-background/70 text-primary backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.close}
              className="grid size-9 place-items-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:bg-background"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="absolute bottom-3 left-4 text-[11px] font-bold tracking-[0.3em] text-gold uppercase">
            {slide.kicker}
          </p>
        </div>

        {/* Texte */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-3"
            >
              <h2 className="neon-text text-2xl font-black">{slide.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{slide.body}</p>
              {slide.badge && (
                <motion.p
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.15 }}
                  className="animate-pulse-glow rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs font-semibold text-gold"
                >
                  {slide.badge}
                </motion.p>
              )}
              {last && (
                <motion.button
                  type="button"
                  onClick={onClose}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 20 }}
                  className="gradient-neon animate-pulse-glow mt-2 w-full rounded-full px-6 py-3.5 text-center font-black text-primary-foreground"
                >
                  {copy.cta}
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => goTo(i - 1)}
            disabled={i === 0}
            aria-label={copy.prev}
            className="glass-neon-btn grid size-10 place-items-center rounded-full text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>

          <div className="flex items-center gap-2">
            {IMAGES.map((_, k) => (
              <button
                key={k}
                type="button"
                onClick={() => goTo(k)}
                aria-label={`${k + 1} / ${IMAGES.length}`}
                aria-current={k === i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  k === i ? "w-6 bg-primary shadow-[0_0_10px_var(--primary)]" : "w-2 bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(i + 1)}
            disabled={last}
            aria-label={copy.next}
            className="glass-neon-btn grid size-10 place-items-center rounded-full text-foreground disabled:opacity-30"
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
