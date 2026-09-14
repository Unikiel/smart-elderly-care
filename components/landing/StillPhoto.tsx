"use client";

import { useEffect, useRef, useState } from "react";
import { FullPhoto } from "@/components/media/FullPhoto";

export function StillPhoto({
  src,
  className,
  position,
  kenburns = false,
}: {
  src: string;
  className?: string;
  position?: string;
  kenburns?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const quiet = useRef(false);

  useEffect(() => {
    quiet.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quiet.current || kenburns) return;
    const onScroll = () => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
      setShift(Math.max(-36, Math.min(36, mid * -0.08)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [kenburns]);

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? "relative h-full w-full"}`}>
      <FullPhoto
        src={src}
        className={`absolute inset-0 w-full object-cover ${kenburns ? "h-full kenburns" : "h-[118%]"}`}
        style={{
          objectPosition: position ?? "center",
          transform: kenburns ? undefined : `translate3d(0, ${shift}px, 0)`,
        }}
      />
    </div>
  );
}
