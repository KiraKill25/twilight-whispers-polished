import { useEffect } from "react";

/** Bloque le défilement de l'arrière-plan tant que la modale est montée. */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [active]);
}
