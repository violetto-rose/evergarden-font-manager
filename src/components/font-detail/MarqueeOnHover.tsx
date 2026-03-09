import { useRef, useCallback, useEffect, ReactNode } from "react";

const MARQUEE_SPEED = 1.1; // px per frame at 60fps
const MARQUEE_PAUSE = 55; // frames to hold at each end (~0.9s)

export function MarqueeOnHover({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  const outerRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef(0); // current translateX in px (≤ 0)
  const dirRef = useRef<"fwd" | "back">("fwd");
  const pauseRef = useRef(0); // remaining pause frames

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const setPos = useCallback((px: number) => {
    posRef.current = px;
    if (innerRef.current)
      innerRef.current.style.transform = `translateX(${px}px)`;
  }, []);

  function tick() {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const overflow = inner.scrollWidth - outer.clientWidth;
    if (overflow <= 0) {
      rafRef.current = null;
      return;
    }

    const maxScroll = -overflow;

    if (pauseRef.current > 0) {
      pauseRef.current -= 1;
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (dirRef.current === "fwd") {
      const next = Math.max(posRef.current - MARQUEE_SPEED, maxScroll);
      setPos(next);
      if (next <= maxScroll) {
        dirRef.current = "back";
        pauseRef.current = MARQUEE_PAUSE;
      }
    } else {
      const next = Math.min(posRef.current + MARQUEE_SPEED, 0);
      setPos(next);
      if (next >= 0) {
        dirRef.current = "fwd";
        pauseRef.current = MARQUEE_PAUSE;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }

  function snapBack() {
    if (!innerRef.current) return;
    if (posRef.current >= 0) {
      setPos(0);
      rafRef.current = null;
      return;
    }
    setPos(Math.min(posRef.current + MARQUEE_SPEED * 2.5, 0));
    rafRef.current = requestAnimationFrame(snapBack);
  }

  const handleMouseEnter = () => {
    cancel();
    dirRef.current = "fwd";
    pauseRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleMouseLeave = () => {
    cancel();
    rafRef.current = requestAnimationFrame(snapBack);
  };

  useEffect(() => () => cancel(), [cancel]);

  return (
    <span
      ref={outerRef}
      className={`marquee-outer${className ? ` ${className}` : ""}`}
      title={title}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={innerRef} className="marquee-inner">
        {children}
      </span>
    </span>
  );
}
