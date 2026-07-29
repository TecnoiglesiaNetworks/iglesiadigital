"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const stats = [
  { end: 2000, prefix: "", suffix: "+", label: "Iglesias acompañadas" },
  { end: 16, prefix: "", suffix: "+", label: "Años de experiencia" },
  { end: 3, prefix: "", suffix: "", label: "Continentes · LatAm, EE.UU. y Europa" },
  { end: 10000, prefix: "$", suffix: "", label: "USD al mes en Google Grant" },
];

function Counter({ end, prefix, suffix }: { end: number; prefix: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const dur = 1400;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(end);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end]);
  const fmt = (n: number) => (n >= 1000 ? n.toLocaleString("es-MX") : String(n));
  return (
    <span ref={ref} className="block bg-gradient-to-r from-ink to-brand2 bg-clip-text font-display text-[clamp(32px,5vw,52px)] font-extrabold leading-none text-transparent">
      {prefix}
      {fmt(val)}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="border-y border-line py-16 [background:radial-gradient(700px_300px_at_50%_50%,rgba(106,61,232,0.12),transparent_70%)]">
      <div className="container grid grid-cols-2 gap-x-6 gap-y-9 text-center md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <Counter end={s.end} prefix={s.prefix} suffix={s.suffix} />
            <span className="mt-2.5 block text-[14.5px] text-muted">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
