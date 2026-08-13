import { ROLE_BY_ID, roleImage } from "@/data/roles";
import { useI18n } from "@/lib/i18n";
import { useScrollLock } from "@/hooks/use-scroll-lock";

/** Carte de révélation du (ou des) joueur(s) éliminé(s). */
export function EliminationReveal({
  victims,
  onClose,
}: {
  victims: { id: string; name: string; roleId: string }[];
  onClose: () => void;
}) {
  const { t, role: tr, team } = useI18n();
  useScrollLock();
  return (
    <div className="fixed inset-0 z-[95] flex w-screen max-w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
      <div className="mx-auto box-border max-h-[85vh] w-full max-w-sm shrink-0 space-y-4 overflow-y-auto overscroll-contain text-center sm:max-w-md">
        <h2 className="neon-text text-center text-2xl font-black">
          {victims.length > 1 ? t("villageStrikes") : t("villageDecided")}
        </h2>
        {victims.map((v) => {
          const role = ROLE_BY_ID[v.roleId];
          return (
            <div
              key={v.id}
              className="surface-card animate-rise-in neon-ring overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={roleImage(v.roleId)}
                  alt={`${v.name} — ${tr(v.roleId).name}`}
                  className="animate-slow-zoom h-full w-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <span className="animate-stamp-in absolute top-6 left-1/2 -translate-x-1/2 rounded-lg border-4 border-destructive px-4 py-1 text-xl font-black tracking-widest text-destructive uppercase">
                  {t("eliminated")}
                </span>
              </div>
              <div className="space-y-1 p-5 text-center">
                <h3 className="text-xl font-black">{v.name}</h3>
                <p className="text-sm text-primary">
                  {tr(v.roleId).name} — {role ? team(role.team) : ""}
                </p>
              </div>
            </div>
          );
        })}
        <button
          onClick={onClose}
          className="neon-ring w-full rounded-full bg-primary py-4 font-bold text-primary-foreground"
        >
          {t("continue")}
        </button>
      </div>
    </div>
  );
}
