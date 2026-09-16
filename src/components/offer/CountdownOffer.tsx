"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* Cuenta regresiva REAL hacia una fecha límite fija (no se reinicia por visita).
   Al llegar a 0 se queda en 00 y cambia el texto. Para cambiar la fecha de la
   próxima oferta, edita DEFAULT_DEADLINE (hora de CDMX, UTC-6). */
// Domingo 20 de septiembre de 2026, 12:00 AM (CDMX). Es decir, termina justo al
// entrar el domingo (la noche del sábado 19).
const DEFAULT_DEADLINE = "2026-09-20T00:00:00-06:00";

function parts(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function CountdownOffer({ deadline = DEFAULT_DEADLINE }: { deadline?: string }) {
  const target = new Date(deadline).getTime();
  // null hasta que monta en el cliente → evita desajuste de hidratación.
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(target - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const done = left !== null && left <= 0;
  const p = parts(left ?? 0);
  const pad = (n: number) => String(n).padStart(2, "0");

  const Box = ({ v, label }: { v: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="rounded-lg bg-panel3 px-2.5 py-1 font-display text-[30px] font-extrabold tabular-nums">
        {pad(v)}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
    </div>
  );
  const Sep = () => <span className="pb-4 text-[24px] font-bold">:</span>;

  return (
    <div className="mb-5 flex flex-col items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {done ? "La oferta cerró" : "Esta oferta termina en"}
      </span>
      <div className={cn("flex items-center gap-1.5", done ? "text-red-500" : "text-accent")}>
        <Box v={p.d} label="días" />
        <Sep />
        <Box v={p.h} label="hrs" />
        <Sep />
        <Box v={p.m} label="min" />
        <Sep />
        <Box v={p.s} label="seg" />
      </div>
      <span className="text-[12.5px] font-semibold text-red-400">…y no volverá.</span>
    </div>
  );
}
