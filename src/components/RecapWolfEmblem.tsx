import { motion } from "framer-motion";
import logo from "@/assets/logo-wolf-moon.jpg";
import { useI18n } from "@/lib/i18n";

const PARTICLES = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * Emblème animé du bilan : loup hurlant sur son pic rocheux, lune magenta,
 * anneaux néon concentriques pulsés et particules orbitales.
 */
export function RecapWolfEmblem({ size = "size-32" }: { size?: string }) {
  const { t } = useI18n();

  return (
    <div className="relative mx-auto flex flex-col items-center gap-3">
      <div className="relative grid place-items-center">
        {/* Anneaux néon concentriques */}
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="pointer-events-none absolute rounded-full border border-primary/40"
            style={{ inset: `${-10 - i * 10}px` }}
            animate={{ opacity: [0.15, 0.7, 0.15], scale: [0.97, 1.06, 0.97] }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.35,
            }}
          />
        ))}

        {/* Halo magenta */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-full bg-primary/25 blur-2xl"
          animate={{ opacity: [0.3, 0.75, 0.3], scale: [1, 1.12, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Particules orbitales */}
        {PARTICLES.map((deg, i) => (
          <motion.span
            key={deg}
            aria-hidden
            className="pointer-events-none absolute size-1.5 rounded-full bg-gold"
            style={{
              transform: `rotate(${deg}deg) translateY(-4.9rem)`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.4] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.22,
            }}
          />
        ))}

        {/* Silhouette du loup — respiration douce */}
        <motion.div
          animate={{ scale: [1, 1.045, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          className="gradient-ring-pink relative rounded-full p-[3px]"
        >
          <div className={`${size} overflow-hidden rounded-full`}>
            <img
              src={logo}
              alt={t("logoAlt")}
              width={320}
              height={320}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </motion.div>
      </div>

      <motion.p
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        className="text-[11px] font-black tracking-[0.35em] text-gold uppercase"
      >
        Mourad&apos;s Ville
      </motion.p>
    </div>
  );
}
