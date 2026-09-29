"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Cert } from "@/lib/certs";

export function Certs({ certs }: { certs: Cert[] }) {
  const { t } = useLocale();
  const [open, setOpen] = useState<Cert | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (certs.length === 0) return null;

  return (
    <section id="certs" className="scroll-mt-16 border-t border-[#e0a35a]/35">
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-12 md:py-24">
        <a href="#home" className="text-[16px] font-medium text-[#8b5a32] hover:text-[#3a2718]">
          ← {t.backHome}
        </a>
        <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">{t.heroCert}</h2>
        <ul className="mt-8 space-y-4">
          {certs.map((cert) => (
            <li key={cert.src}>
              <button
                type="button"
                onClick={() => setOpen(cert)}
                className="text-left text-[18px] leading-8 text-[#c67a1a] underline decoration-[#e0a35a] underline-offset-4 hover:text-[#3a2718]"
              >
                {cert.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3a2718]/55 p-4 md:p-8"
          onClick={() => setOpen(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={open.name}
            className="flex h-[min(85vh,900px)] w-full max-w-4xl flex-col overflow-hidden bg-[#fff7e4] shadow-[0_24px_60px_rgba(58,39,24,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#e0a35a]/35 px-5 py-4">
              <p className="font-display text-xl font-bold leading-snug">{open.name}</p>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="shrink-0 text-[16px] font-medium text-[#8b5a32] hover:text-[#3a2718]"
              >
                {t.certClose}
              </button>
            </div>
            <iframe title={open.name} src={open.src} className="min-h-0 w-full flex-1 bg-white" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
