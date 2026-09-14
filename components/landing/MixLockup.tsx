export function MixLockup({
  script,
  formal,
  as = "h1",
  rule = true,
}: {
  script: string;
  formal: string;
  as?: "h1" | "h2" | "h3";
  rule?: boolean;
}) {
  const Formal = as;
  const scriptSize = as === "h1" ? "text-[40px] md:text-[58px]" : "text-[34px] md:text-[48px]";
  const formalSize = as === "h1" ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl";
  return (
    <div>
      <p className={`font-script flex items-center gap-4 leading-[1.15] ${scriptSize}`}>
        <span>{script}</span>
        {rule ? <span className="hidden h-px max-w-32 flex-1 bg-current/40 sm:block" aria-hidden="true" /> : null}
      </p>
      <Formal className={`mt-2 font-display font-bold leading-[1.08] ${formalSize}`}>{formal}</Formal>
    </div>
  );
}
