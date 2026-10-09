import { useEffect, useState } from 'react';

// Banner animation is explicitly controlled by the page, independently of the
// OS preference used by the decorative particle effect.
export default function TypewriterText({ text, speed = 60, delay = 180 }: { text: string; speed?: number; delay?: number }) {
  const [count, setCount] = useState(0);
  const characters = Array.from(text);

  useEffect(() => {
    setCount(0);
    let cursor = 0;
    let timer: number;
    const typeNext = () => {
      cursor += 1;
      setCount(cursor);
      if (cursor < characters.length) timer = window.setTimeout(typeNext, speed);
    };
    if (characters.length) timer = window.setTimeout(typeNext, delay);
    return () => window.clearTimeout(timer);
  }, [text, speed, delay, characters.length]);

  return <span className="typewriter-text">
    <span className="hero-sr-only">{text}</span>
    <span className="typewriter-size" aria-hidden="true">{text}</span>
    <span className="typewriter-visible" aria-hidden="true">{characters.slice(0, count).join('')}{count < characters.length && <span className="typewriter-caret">▏</span>}</span>
  </span>;
}
