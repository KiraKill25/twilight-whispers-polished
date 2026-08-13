import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  /** ms before typing starts */
  delay?: number;
  /** ms per character */
  speed?: number;
  className?: string;
  start?: boolean;
}

export function Typewriter({
  text,
  delay = 0,
  speed = 55,
  className,
  start = true,
}: TypewriterProps) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!start) {
      setTyped("");
      return;
    }
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      let i = 0;
      interval = window.setInterval(() => {
        i += 1;
        setTyped(text.slice(0, i));
        if (i >= text.length && interval) window.clearInterval(interval);
      }, speed);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [text, delay, speed, start]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{typed}</span>
    </span>
  );
}
