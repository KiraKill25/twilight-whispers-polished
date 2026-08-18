import { useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fading, setFading] = useState(false);

  const handleFinish = () => {
    setFading(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black transition-opacity duration-400 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <video
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleFinish}
        className="h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={handleFinish}
        className="absolute bottom-6 right-6 z-10 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-bold text-white backdrop-blur active:scale-95"
      >
        Passer
      </button>
    </div>
  );
}
