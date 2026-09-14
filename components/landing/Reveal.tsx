"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Variant = "up" | "left" | "right" | "zoom";

export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  eager = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    if (eager) {
      const frame = window.requestAnimationFrame(() => setOn(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setOn(true);
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [eager]);

  if (eager) {
    return (
      <div className={`hero-rise ${className}`} style={{ animationDelay: `${delay}ms` }}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`motion-${variant} ${on ? "motion-in" : ""} ${className}`}
      style={{ transitionDelay: on ? `${delay}ms` : "0ms" } as CSSProperties}
    >
      {children}
    </div>
  );
}
