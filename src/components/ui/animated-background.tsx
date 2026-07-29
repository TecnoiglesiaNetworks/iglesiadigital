"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * AuroraBackground — fondo animado tipo "aurora" en los colores de la marca.
 *
 * Optimizado:
 * - Las capas SOLO se animan cuando la sección está (cerca de) visible en
 *   pantalla (IntersectionObserver): fuera de vista, la animación se pausa y
 *   no consume GPU/CPU.
 * - En móvil se muestran menos capas (menos costo de composición).
 * - Respeta prefers-reduced-motion (keyframes desactivados en globals.css).
 * - transform-only (compositor) para máxima fluidez.
 */
export function AuroraBackground({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "150px" } // empieza justo antes de entrar en pantalla
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // `mobile: false` → la capa se oculta en pantallas pequeñas (menos carga).
  const waves = [
    {
      mobile: true,
      opacity: "opacity-50",
      background:
        "radial-gradient(ellipse 800px 600px at 50% 20%, rgba(106, 61, 232, 0.28) 0%, transparent 55%)",
      animation: "aurora1 18s ease-in-out infinite alternate",
    },
    {
      mobile: false,
      opacity: "opacity-40",
      background:
        "radial-gradient(ellipse 600px 400px at 80% 30%, rgba(138, 92, 255, 0.3) 0%, transparent 55%)",
      animation: "aurora2 14s ease-in-out infinite alternate-reverse",
    },
    {
      mobile: true,
      opacity: "opacity-30",
      background:
        "radial-gradient(ellipse 700px 500px at 20% 60%, rgba(255, 80, 1, 0.16) 0%, transparent 55%)",
      animation: "aurora3 22s ease-in-out infinite alternate",
    },
    {
      mobile: false,
      opacity: "opacity-25",
      background:
        "radial-gradient(ellipse 900px 300px at 60% 80%, rgba(138, 92, 255, 0.14) 0%, transparent 55%)",
      animation: "aurora4 16s ease-in-out infinite alternate-reverse",
    },
  ];

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* Capas de aurora (decorativas) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.12] via-transparent to-accent/[0.05]" />
        {waves.map((w, i) => (
          <div
            key={i}
            className={cn("aurora-layer absolute inset-0", w.opacity, !w.mobile && "hidden sm:block")}
            style={{
              background: w.background,
              animation: w.animation,
              animationPlayState: active ? "running" : "paused",
            }}
          />
        ))}
        {/* Profundidad: oscurece bordes para integrarse con el fondo del sitio */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/60" />
      </div>

      {/* Contenido */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default AuroraBackground;
