import { ROLES, roleImage, roleVideo } from "@/data/roles";

let started = false;

/** Précharge en arrière-plan les visuels et vidéos des rôles (une seule fois). */
export function preloadRoleMedia(roleIds?: string[]) {
  if (typeof window === "undefined" || started) return;
  started = true;

  const ids = roleIds?.length ? roleIds : ROLES.map((r) => r.id);

  // Images : immédiat, léger.
  for (const id of ids) {
    const src = roleImage(id);
    if (src) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    }
  }

  // Vidéos : en veille, via <link rel="prefetch"> pour ne pas bloquer le rendu.
  const prefetchVideos = () => {
    for (const id of ids) {
      const src = roleVideo(id);
      if (!src) continue;
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = src;
      document.head.appendChild(link);
    }
  };

  const idle = (window as unknown as {
    requestIdleCallback?: (cb: () => void) => number;
  }).requestIdleCallback;
  if (idle) idle(prefetchVideos);
  else window.setTimeout(prefetchVideos, 1200);
}