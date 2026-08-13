import { motion } from "framer-motion";

const TEXT = "Mourad's Ville";
const LINE_1 = "/media/title-line-1.png";
const LINE_2 = "/media/title-line-2.png";

const slideDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Titre de l'accueil : deux lignes transparentes (« MOURAD'S » puis « - VILLE - »)
 * qui descendent l'une après l'autre, sans aucun fond ni cadre.
 */
export function TitleImage() {
  return (
    <h1 className="relative mx-auto flex w-full max-w-[20rem] flex-col items-center gap-1 bg-transparent sm:max-w-[26rem]">
      <span className="sr-only">{TEXT}</span>

      <motion.div
        aria-hidden
        className="w-full bg-transparent"
        variants={slideDown}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.img
          src={LINE_1}
          alt=""
          width={1105}
          height={264}
          className="block w-full bg-transparent"
          animate={{
            filter: [
              "drop-shadow(0 0 6px #FF2A85)",
              "drop-shadow(0 0 12px #FF2A85) drop-shadow(0 0 26px #FF2A85)",
              "drop-shadow(0 0 6px #FF2A85)",
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.img
        aria-hidden
        src={LINE_2}
        alt=""
        width={711}
        height={93}
        className="block w-[64%] bg-transparent"
        variants={slideDown}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
      />
    </h1>
  );
}
