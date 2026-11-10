"use client";
import { useEffect, useState } from "react";

/* Cuenta regresiva EVERGREEN por visitante: 10 minutos que arrancan cuando la
   persona entra al diagnóstico/oferta. Si se vence, vuelve a empezar otros 10
   minutos, y así. Se guarda en localStorage (por navegador) para que al recargar
   siga contando desde donde iba, no desde cero. */
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const KEY = "id_offer_deadline";

function freshDeadline() {
  return Date.now() + WINDOW_MS;
}

export function CountdownOffer() {
  // null hasta que monta en el cliente → evita desajuste de hidratación.
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const load = () => {
      let dl = Number(localStorage.getItem(KEY));
      if (!dl || Number.isNaN(dl) || dl <= Date.now()) {
        dl = freshDeadline();
        try {
          localStorage.setItem(KEY, String(dl));
        } catch {}
      }
      return dl;
    };

    let deadline = load();
    const tick = () => {
      let ms = deadline - Date.now();
      if (ms <= 0) {
        // Se venció → arranca otros 10 minutos.
        deadline = freshDeadline();
        try {
          localStorage.setItem(KEY, String(deadline));
        } catch {}
        ms = deadline - Date.now();
      }
      setLeft(ms);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const totalSec = Math.max(0, Math.floor((left ?? 0) / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
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
        Esta oferta termina en
      </span>
      <div className="flex items-center gap-1.5 text-white">
        <Box v={m} label="min" />
        <Sep />
        <Box v={s} label="seg" />
      </div>
      <span className="text-[12.5px] font-semibold text-red-400">…y no volverá.</span>
    </div>
  );
}
