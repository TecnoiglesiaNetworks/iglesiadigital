"use client";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { modulo0, months, type Week } from "./temario-data";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

function WeekCard({ week }: { week: Week }) {
  return (
    <div className="h-full rounded-2xl border border-line bg-panel p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line2 hover:bg-panel2">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 font-display text-[15px] font-bold text-white">
          {week.n}
        </span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">Semana {week.n}</span>
      </div>
      <h3 className="mb-4 font-display text-[18px] font-bold leading-snug">{week.title}</h3>
      <ul className="flex flex-col gap-2.5">
        {week.items.map((it) => (
          <li key={it} className="flex gap-2.5 text-[14.5px] text-muted">
            <Check className="mt-0.5 h-4 w-4 flex-none text-accent" strokeWidth={2.5} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TemarioTimeline() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<(HTMLElement | null)[]>([]);
  const [p, setP] = useState(0);
  const [active, setActive] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const top = wrap.getBoundingClientRect().top + window.scrollY;
      const y = window.scrollY + window.innerHeight * 0.4;
      setP(Math.min(1, Math.max(0, (y - top) / wrap.offsetHeight)));
      let act = 1;
      monthRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) act = i + 1;
      });
      setActive(act);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const week = Math.min(16, Math.max(1, Math.ceil(p * 16)));
  const jump = (i: number) => monthRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div ref={wrapRef} className="relative">
      {/* Barra de progreso pegajosa */}
      <div className="sticky top-[72px] z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="container py-3">
          <div className="mb-2 flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.1em]">
            <span className="text-ink">
              Semana <span className="text-accent">{week}</span> de 16
            </span>
            <div className="flex gap-3 sm:gap-5">
              {months.map((m, i) => (
                <button
                  key={m.label}
                  onClick={() => jump(i)}
                  className={cn("cursor-pointer transition-colors", active === i + 1 ? "text-accent" : "text-muted hover:text-ink")}
                >
                  <span className="hidden sm:inline">Mes </span>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="relative h-1.5 rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-150"
              style={{ width: `${p * 100}%` }}
            />
            {[25, 50, 75].map((x) => (
              <span key={x} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-white/25" style={{ left: `${x}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Módulo 0 */}
      <section className="pb-4 pt-12">
        <div className="container">
          <Reveal className="mx-auto max-w-[900px]">
            <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/[0.10] to-brand/[0.08] p-7 sm:p-8">
              <h2 className="font-display text-[20px] font-bold">{modulo0.title}</h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {modulo0.items.map((it) => (
                  <li key={it} className="flex gap-2.5 text-[14.5px] text-ink/90">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-accent" strokeWidth={2.5} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Meses */}
      {months.map((m, idx) => {
        const isActive = active === idx + 1;
        return (
          <section
            key={m.label}
            id={`mes-${idx + 1}`}
            ref={(el) => {
              monthRefs.current[idx] = el;
            }}
            className="scroll-mt-[150px] py-12"
          >
            <div className="container">
              <Reveal className="mx-auto mb-8 max-w-[900px]">
                <div
                  className={cn(
                    "flex items-baseline gap-4 border-b pb-5 transition-colors duration-300",
                    isActive ? "border-accent/50" : "border-line"
                  )}
                >
                  <span
                    className={cn(
                      "font-display text-[clamp(28px,5vw,44px)] font-extrabold leading-none transition-colors duration-300",
                      isActive ? "text-accent" : "text-transparent [-webkit-text-stroke:1.5px_var(--brand2)]"
                    )}
                  >
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent">{m.label}</div>
                    <h2 className="font-display text-[clamp(20px,3.4vw,30px)] font-bold leading-tight">{m.title}</h2>
                  </div>
                </div>
              </Reveal>
              <div className="mx-auto grid max-w-[900px] gap-5 sm:grid-cols-2">
                {m.weeks.map((w, i) => (
                  <Reveal key={w.n} delay={(i % 2) * 0.08}>
                    <WeekCard week={w} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
