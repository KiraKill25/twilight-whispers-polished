import { useEffect, useState } from "react";
import { initAudioPrefs, isMuted, subscribeMute } from "@/lib/audio";

/** État global de coupure du son (partagé avec le bouton du header). */
export function useMuted(): boolean {
  const [m, setM] = useState(false);

  useEffect(() => {
    initAudioPrefs();
    setM(isMuted());
    return subscribeMute(setM);
  }, []);

  return m;
}
