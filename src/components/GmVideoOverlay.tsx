/** Petit overlay vidéo du Maître du Jeu, positionné au-dessus des roues. */
export function GmVideoOverlay() {
  return (
    <div className="pointer-events-none absolute right-1 top-1 z-30">
      <video
        src="/media/game-master.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="size-12 rounded-full object-cover opacity-70 shadow-lg ring-2 ring-primary/40"
      />
    </div>
  );
}
