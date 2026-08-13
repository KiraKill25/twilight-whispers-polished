import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";
import { ROLE_BY_ID, roleImage, type RoleDef } from "@/data/roles";
import { useI18n } from "@/lib/i18n";
import { useMuted } from "@/hooks/use-muted";
import { useScrollLock } from "@/hooks/use-scroll-lock";

function RoleVideo({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const muted = useMuted();
  const [loaded, setLoaded] = useState(false);

  // Sync avec l'état global de son + repli si l'autoplay non muté est bloqué
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = muted;
    el.play().catch(() => {
      el.muted = true;
      el.play().catch(() => {});
    });
  }, [muted, src]);

  // Si l'autoplay non muté est bloqué : son au 1er geste de l'utilisateur
  useEffect(() => {
    if (muted) return;
    const unlock = () => {
      const el = ref.current;
      if (el && el.muted) {
        el.muted = false;
        void el.play().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [muted]);

  const replay = () => {
    const el = ref.current;
    if (!el) return;
    el.muted = muted;
    el.currentTime = 0;
    void el.play().catch(() => {});
  };

  return (
    <video
      ref={ref}
      src={src}
      aria-label={alt}
      autoPlay
      playsInline
      muted={muted}
      preload="auto"
      controls={false}
      disablePictureInPicture
      onLoadedData={() => setLoaded(true)}
      onEnded={() => {
        // Gèle naturellement sur la dernière image (pas de retour au noir)
        const el = ref.current;
        if (el && !el.paused) el.pause();
      }}
      onClick={replay}
      className={`h-full w-full cursor-pointer object-cover transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}



export function RoleCard({
  role,
  index = 0,
  footer,
  onClick,
  selected,
}: {
  role: RoleDef;
  index?: number;
  footer?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { role: tr, team, t } = useI18n();
  const rt = tr(role.id);
  return (
    <>
      <article
        onClick={onClick}
        className={`surface-card animate-rise-in group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1.5 ${
          selected ? "ring-2 ring-primary neon-ring" : "hover:neon-ring"
        } ${onClick ? "cursor-pointer" : ""}`}
        style={{ animationDelay: `${Math.min(index * 45, 700)}ms` }}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={roleImage(role.id)}
            alt={rt.name}
            loading="lazy"
            width={640}
            height={640}
            className="animate-slow-zoom h-full w-full object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <button
            type="button"
            aria-label={`${t("infoRole")} — ${rt.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="animate-pulse-glow absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-primary/20 text-primary backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
          >
            <Info className="size-4" />
          </button>
        </div>
        <div className="relative -mt-8 space-y-1 p-3">
          <h3 className="text-sm font-bold tracking-tight">{rt.name}</h3>
          <p className="text-[11px] tracking-widest text-primary uppercase">
            {team(role.team)}
          </p>
          {footer}
        </div>
      </article>

      {open && <RoleDialog role={role} onClose={() => setOpen(false)} />}
    </>
  );
}

export function RoleDialog({
  role,
  onClose,
}: {
  role: RoleDef;
  onClose: () => void;
}) {
  const { role: tr, team, t } = useI18n();
  const rt = tr(role.id);
  useScrollLock();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={rt.name}
      onClick={onClose}
      className="fixed inset-0 z-50 flex w-screen max-w-full items-end justify-center overflow-x-hidden overflow-y-auto bg-black/85 p-4 backdrop-blur-md sm:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="surface-card animate-rise-in neon-ring mx-auto box-border max-h-[85vh] w-full max-w-sm shrink-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-3xl shadow-2xl sm:max-w-md"
      >
        <div className="relative aspect-square overflow-hidden rounded-t-3xl">
          {role.videoUrl ? (
            <RoleVideo src={role.videoUrl} alt={rt.name} />
          ) : (
            <img
              src={roleImage(role.id)}
              alt={rt.name}
              loading="lazy"
              width={640}
              height={640}
              className="animate-slow-zoom h-full w-full object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent" />

          <button
            onClick={onClose}
            aria-label={t("remove")}
            className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-background/70 text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h2 className="neon-text text-2xl font-black">{rt.name}</h2>
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              {team(role.team)}
            </p>
          </div>
          <section>
            <h3 className="mb-1 text-xs font-bold tracking-widest text-primary uppercase">
              1 · {t("colRole")}
            </h3>
            <p className="text-sm text-muted-foreground">{rt.description}</p>
          </section>
          <section>
            <h3 className="mb-1 text-xs font-bold tracking-widest text-primary uppercase">
              2 · {t("powerLabel")}
            </h3>
            <p className="text-sm text-muted-foreground">{rt.power}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function RoleDialogById({
  roleId,
  onClose,
}: {
  roleId: string;
  onClose: () => void;
}) {
  return <RoleDialog role={ROLE_BY_ID[roleId]} onClose={onClose} />;
}