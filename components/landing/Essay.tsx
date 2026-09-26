import type { Essay } from "@/lib/essay";

export function EssayChapter({ essay }: { essay: Essay }) {
  return (
    <article className="mx-auto w-full max-w-[1280px] px-5 py-16 sm:px-8 md:px-12 md:py-24">
      <header className="@container">
        <p className="font-script text-[clamp(1.15rem,3.8cqi,2.75rem)] leading-none text-[#c67a1a]">{essay.author}</p>
        <h2 className="mt-4 whitespace-nowrap font-display text-[clamp(1.15rem,5.15cqi,4.75rem)] font-bold leading-none">
          {essay.title}
        </h2>
        {essay.subtitle ? (
          <p className="mt-3 whitespace-nowrap font-display text-[clamp(1rem,2.8cqi,2rem)] leading-snug text-[#8b5a32]">
            {essay.subtitle}
          </p>
        ) : null}
      </header>
      <div className="mt-12 space-y-6 text-[18px] leading-8 text-[#3a2718]">
        {essay.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={
              index === 0
                ? "first-letter:float-left first-letter:pr-3 first-letter:font-display first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-[#3a2718]"
                : undefined
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
      {essay.references.length > 0 ? (
        <section className="mt-16 border-t border-[#e0a35a]/50 pt-10">
          <h3 className="font-script text-[32px] leading-none text-[#c67a1a]">References</h3>
          <ol className="mt-6 space-y-3 text-[13px] leading-5 text-[#6b3f1f]">
            {essay.references.map((item) => (
              <li key={item.citation}>
                {item.citation}
                {item.href ? (
                  <>
                    {" "}
                    <a href={item.href} className="break-all text-[#c67a1a] underline decoration-[#e0a35a] underline-offset-2">
                      {item.href}
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  );
}
