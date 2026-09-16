"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* Cuenta regresiva REAL hacia una fecha límite (no se reinicia por visita).
   La fecha se configura desde el admin (Ajustes de la oferta) y se lee de
   /api/offer/deadline. Al llegar a 0 se queda en 00 y cambia el texto. */
// Respaldo por si la API no responde (domingo 20 sep 2026, 12 AM CDMX).
const FALLBACK_DEADLINE = "2026-09-20T00:00:00-06:00";

function parts(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function CountdownOffer({ deadline }: { deadline?: string }) {
  const [target, setTarget] = useState(() => new Date(deadline || FALLBACK_DEADLINE).getTime());
  // null hasta que monta en el cliente → evita desajuste de hidratación.
  const [left, setLeft] = useState<number | null>(null);

  // Carga la fecha límite configurada en el admin (si no se pasó por prop).
  useEffect(() => {
    if (deadline) return;
    let alive = true;
    fetch("/api/offer/deadline")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.deadline) setTarget(new Date(d.deadline).getTime());
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [deadline]);

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
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white">{label}</span>
    </div>
  );
  const Sep = () => <span className="pb-4 text-[24px] font-bold">:</span>;

  return (
    <div className="mb-5 flex flex-col items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
        {done ? "La oferta cerró" : "Esta oferta termina en"}
      </span>
      <div className={cn("flex items-center gap-1.5", done ? "text-red-500" : "text-white")}>
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
