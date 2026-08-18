import { useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    // Displays image for 2.5 seconds before transitioning
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden select-none">
      <img
        src="/splash.png"
        alt="Splash Screen"
        className="w-full h-auto object-contain max-h-screen"
      />
    </div>
  );
}
