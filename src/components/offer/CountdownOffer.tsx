"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* Cuenta regresiva de la oferta. Arranca cuando el bloque entra en pantalla
   (al bajar y ver el pago), baja hasta 00:00 y se queda ahí. No se guarda en el
   navegador, así que si el visitante vuelve a entrar, la cuenta empieza de nuevo. */
export function CountdownOffer({ seconds = 600 }: { seconds?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [left, setLeft] = useState(seconds);

  // Se activa al entrar en el viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Tic-tac una vez activa; se detiene sola al llegar a 0.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const done = left === 0;

  return (
    <div ref={ref} className="mb-4 flex flex-col items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {done ? "La oferta está por cerrar" : "Esta oferta expira en"}
      </span>
      <div
        className={cn(
          "flex items-center gap-1.5 font-display text-[32px] font-extrabold tabular-nums",
          done ? "text-red-500" : "text-accent"
        )}
      >
        <span className="rounded-lg bg-panel3 px-2.5 py-1">{mm}</span>
        <span>:</span>
        <span className="rounded-lg bg-panel3 px-2.5 py-1">{ss}</span>
      </div>
    </div>
  );
}
