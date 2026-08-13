import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const VIDEO_URL = "/media/logo-video.mp4";

/**
 * Logo vidéo interactif : lecture unique avec son, gel sur la dernière image,
 * relance au clic. Anneau néon en dégradé radial avec pulsation continue.
 */
export function VideoLogo({
  label,
  onFinished,
}: {
  label: string;
  onFinished?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onFinished?.();
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.play().catch(() => {
      // Autoplay non muté bloqué → repli silencieux sur la 1re image
      el.muted = true;
      el.play().catch(() => {
        el.pause();
        el.currentTime = 0;
        finish();
      });
    });
    // Garde-fou : si la vidéo ne se termine jamais, on révèle le titre
    const guard = window.setTimeout(finish, 9000);
    return () => window.clearTimeout(guard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replay = () => {
    const el = ref.current;
    if (!el) return;
    el.muted = false;
    el.currentTime = 0;
    void el.play().catch(() => {});
  };

  return (
    <div className="relative mt-4 size-52 sm:size-64">
      {/* Anneau néon : dégradé radial fondu vers l'extérieur + bloom multi-couches */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,42,133,0) 62%, rgba(255,42,133,0.95) 72%, rgba(255,42,133,0.45) 84%, rgba(255,42,133,0) 100%)",
          boxShadow:
            "0 0 20px rgba(255,42,133,0.8), 0 0 45px rgba(255,42,133,0.4), 0 0 70px rgba(255,42,133,0.1)",
        }}
        animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.03, 1] }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
      />
      <video
        ref={ref}
        src={VIDEO_URL}
        aria-label={label}
        autoPlay
        playsInline
        preload="auto"
        onLoadedData={() => setLoaded(true)}
        onEnded={finish}
        onClick={replay}
        className={`relative block size-full cursor-pointer rounded-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
