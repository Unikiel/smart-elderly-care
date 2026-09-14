"use client";

import { useEffect, useState } from "react";
import type { StoriesContent } from "@/lib/stories";
import { FlyPhoto } from "./FlyPhoto";
import { Reveal } from "./Reveal";

const flyFrom = ["left", "up", "right"] as const;

export function Stories({ content }: { content: StoriesContent }) {
  const feelings = content.feelings;
  const [picked, setPicked] = useState(feelings[0] ?? null);

  useEffect(() => {
    setPicked((current) => {
      const still = content.feelings.find((item) => item.id === current?.id);
      return still ?? content.feelings[0] ?? null;
    });
  }, [content]);

  return (
    <>
      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-12 md:py-24">
        <Reveal>
          <p className="font-script text-[36px] leading-none text-[#c67a1a] md:text-[44px]">{content.kicker}</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-bold leading-tight md:text-5xl">{content.heading}</h2>
        </Reveal>
        {feelings.length > 0 ? (
          <>
            <Reveal delay={120}>
              <div className="mt-10 flex flex-wrap gap-3">
                {feelings.map((item) => {
                  const on = picked?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setPicked(item)}
                      onFocus={() => setPicked(item)}
                      onClick={() => setPicked(item)}
                      className={`font-script rounded-full px-5 py-2.5 text-[22px] leading-none transition-colors duration-300 md:text-[24px] ${
                        on ? "bg-[#f0b429] text-[#3a2718]" : "bg-[#ffe0b0] text-[#3a2718]"
                      }`}
                    >
                      {item.key}
                    </button>
                  );
                })}
              </div>
            </Reveal>
            {picked ? (
              <p key={picked.id} className="mt-8 max-w-2xl font-script text-[34px] leading-snug md:text-[44px]">
                {picked.story}
              </p>
            ) : null}
          </>
        ) : null}
      </section>

      {content.rail.length > 0 ? (
        <section className="overflow-x-hidden pb-4">
          <div className="mx-auto flex max-w-[1280px] gap-5 px-5 md:px-12">
            {content.rail.map((item, index) => (
              <figure key={item.id} className="min-w-[260px] flex-1">
                <div className="relative aspect-[4/3]">
                  <FlyPhoto
                    src={item.src}
                    from={index % 2 === 0 ? "left" : "right"}
                    delay={index * 110}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <figcaption className="mt-4">
                  <p className="font-display text-2xl font-bold">{item.title}</p>
                  <p className="mt-1 text-[16px] text-[#8b5a32]">{item.line}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {content.grid.length > 0 ? (
        <section className="mx-auto grid max-w-[1280px] gap-4 px-5 py-16 sm:grid-cols-2 md:grid-cols-3 md:px-12 md:py-24">
          {content.grid.map((item, index) => (
            <figure key={item.id} className="relative aspect-[4/3] overflow-hidden">
              <FlyPhoto
                src={item.src}
                from={flyFrom[index % 3]}
                delay={(index % 3) * 90}
                className="absolute inset-0 h-full w-full"
              />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3a2718]/70 to-transparent p-5 text-[18px] text-[#fff3d6]">
                {item.title}
              </figcaption>
            </figure>
          ))}
        </section>
      ) : null}
    </>
  );
}
