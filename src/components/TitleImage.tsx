import { motion } from "framer-motion";

const TEXT = "Mourad's Ville";
const TITLE_URL = "/media/title-mourads-ville.png";

const IMG =
  "absolute top-0 left-0 block w-full mix-blend-screen pointer-events-none";
const OFFSET = { marginTop: "-39%" } as const;

/**
 * Titre de l'accueil : image fournie, fond noir neutralisé via mix-blend-screen,
 * avec un halo néon pulsé dédié à la ligne « MOURAD'S ».
 */
export function TitleImage() {
  return (
    <h1 className="relative mx-auto w-full max-w-[20rem] sm:max-w-[26rem]">
      <span className="sr-only">{TEXT}</span>
      <div
        aria-hidden
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "1243 / 420" }}
      >
        <img
          src={TITLE_URL}
          alt=""
          width={1243}
          height={1243}
          className={IMG}
          style={OFFSET}
        />
        {/* Halo néon pulsé — uniquement autour de « MOURAD'S » */}
        <motion.img
          src={TITLE_URL}
          alt=""
          width={1243}
          height={1243}
          className={IMG}
          style={{ ...OFFSET, clipPath: "inset(41% 0 39% 0)" }}
          animate={{
            filter: [
              "drop-shadow(0 0 6px #FF2A85)",
              "drop-shadow(0 0 12px #FF2A85) drop-shadow(0 0 26px #FF2A85)",
              "drop-shadow(0 0 6px #FF2A85)",
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </h1>
  );
}
