"use client";

import { useEffect, useRef, useState } from "react";
import { FullPhoto } from "@/components/media/FullPhoto";

type From = "left" | "right" | "up";

export function FlyPhoto({
  src,
  from = "up",
  delay = 0,
  className,
  position,
  eager = false,
}: {
  src: string;
  from?: From;
  delay?: number;
  className?: string;
  position?: string;
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
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [eager]);

  return (
    <div
      ref={ref}
      className={`fly-frame fly-${from} ${on ? "is-in" : ""} ${className ?? "relative h-full w-full"}`}
    >
      <FullPhoto
        src={src}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: position ?? "center",
          transitionDelay: on ? `${delay}ms` : "0ms",
        }}
      />
    </div>
  );
}
