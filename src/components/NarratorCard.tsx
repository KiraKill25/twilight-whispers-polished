import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { HOWTO } from "@/lib/howto";
import { useI18n } from "@/lib/i18n";

const VIDEO_URL = "/media/game-master.mp4";


export function NarratorCard({
  title,
  text,
  children,
}: {
  title?: string;
  text: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const { lang, t } = useI18n();
  const [guide, setGuide] = useState(false);
  const guideLabel = HOWTO[lang].openLabel;
  const heading = title ?? t("narratorTitle");


  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.play().catch(() => {
      // Autoplay non muté bloqué → repli muet, puis son au 1er clic
      el.muted = true;
      el.play().catch(() => {
        el.pause();
        el.currentTime = 0;
      });
    });
  }, []);

  const replay = () => {
    const el = ref.current;
    if (!el) return;
    el.muted = false;
    el.currentTime = 0;
    void el.play().catch(() => {});
  };

  return (
    <>
    <div className="surface-card animate-rise-in neon-ring overflow-hidden rounded-3xl">
      <div className="relative aspect-[16/10] overflow-hidden">
        <video
          ref={ref}
          src={VIDEO_URL}
          aria-label={t("narratorAlt")}
          autoPlay
          playsInline
          preload="auto"
          onClick={replay}
          className="h-full w-full cursor-pointer object-cover object-top"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        <button
          type="button"
          title={guideLabel}
          aria-label={guideLabel}
          onClick={(e) => {
            e.stopPropagation();
            setGuide(true);
          }}
          className="animate-pulse-glow absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-primary/20 text-primary backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
        >
          <Info className="size-4" />
        </button>
        <p className="pointer-events-none absolute bottom-3 left-4 text-xs font-bold tracking-[0.3em] text-primary uppercase">
          {heading}
        </p>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-base leading-relaxed">{text}</p>
        <button
          type="button"
          onClick={() => setGuide(true)}
          className="glass-neon-btn flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-foreground"
        >
          <Info className="size-4 text-gold" />
          {guideLabel}
        </button>
        {children}
      </div>
    </div>
    {guide && <HowToPlayModal onClose={() => setGuide(false)} />}
    </>
  );
}

