import { createFileRoute, Link } from "@tanstack/react-router";
import { TitleImage } from "@/components/TitleImage";
import { VideoLogo } from "@/components/VideoLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MuteButton } from "@/components/MuteButton";
import { useI18n } from "@/lib/i18n";
import { clearBgm, startBgm, unlockAudio } from "@/lib/audio";
import { preloadRoleMedia } from "@/lib/preload-media";
import { useEffect, useState } from "react";
import { Typewriter } from "@/components/Typewriter";

const TITLE = "Mourad's Ville";
const DESC =
  "Meneur de jeu numérique pour Loup-Garou : 24 rôles illustrés, moteur de nuit complet et vote du village.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    clearBgm();
    preloadRoleMedia();
  }, []);

  return (
    <main
      onPointerDown={unlockAudio}
      className="flex min-h-screen w-full max-w-full flex-col items-center gap-7 box-border overflow-x-hidden px-5 pt-20 pb-12"
    >
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-end gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <MuteButton />
        </div>
      </header>

      <VideoLogo label={t("logoAlt")} onFinished={() => setShowTitle(true)} />

      <div className="flex w-full flex-col items-center gap-5 bg-transparent">
        {/* Espace réservé : le titre n'influence jamais la position des boutons */}
        <div className="flex min-h-[110px] w-full items-start justify-center bg-transparent sm:min-h-[142px]">
          {showTitle && <TitleImage />}
        </div>
        <p className="-mt-2 flex min-h-5 items-center text-sm text-muted-foreground">
          <Typewriter text={t("tagline")} start={showTitle} delay={1000} />
        </p>
      </div>



      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          to="/setup"
          onClick={() => { unlockAudio(); startBgm("LOBBY"); }}
          className="gradient-neon rounded-full px-6 py-4 text-center font-black text-primary-foreground transition hover:shadow-[0_0_30px_oklch(0.589_0.239_359.7/0.6)]"
        >
          {t("newGame")}
        </Link>
        <Link
          to="/roles"
          className="glass-neon-btn rounded-full px-6 py-4 text-center font-semibold text-foreground"
        >
          {t("grimoire")}
        </Link>
      </div>

      <p className="mt-4 text-[11px] tracking-[0.35em] text-muted-foreground uppercase">
        {t("footer")}
      </p>
    </main>
  );
}
