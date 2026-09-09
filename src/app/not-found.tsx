"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/animated-background";

/* Página 404 personalizada. Temática "perdido en el espacio digital" con un
   robot flotante (la mascota del sitio) y animaciones ligeras con framer-motion.
   Es un client component porque usa animaciones basadas en estado del navegador. */
export default function NotFound() {
  // Posiciones de las estrellitas que titilan de fondo (en %).
  const stars = [
    { top: "12%", left: "18%", delay: 0 },
    { top: "22%", left: "78%", delay: 0.6 },
    { top: "68%", left: "12%", delay: 1.1 },
    { top: "78%", left: "82%", delay: 0.3 },
    { top: "40%", left: "88%", delay: 0.9 },
    { top: "58%", left: "30%", delay: 1.4 },
  ];

  return (
    <main className="relative">
      <AuroraBackground className="min-h-screen">
        {/* Estrellitas que titilan */}
        {stars.map((s, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute text-[13px] text-white/70"
            style={{ top: s.top, left: s.left }}
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
            aria-hidden
          >
            ✦
          </motion.span>
        ))}

        <div className="container flex min-h-screen flex-col items-center justify-center py-14 text-center">
          {/* Robot flotante con su platillo */}
          <div className="relative mb-2 select-none" aria-hidden>
            <motion.div
              className="text-[76px] leading-none sm:text-[92px]"
              animate={{ y: [0, -14, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🤖
            </motion.div>
            {/* Sombra que "respira" bajo el robot */}
            <motion.div
              className="mx-auto mt-1 h-2 w-20 rounded-full bg-black/40 blur-[3px]"
              animate={{ scaleX: [1, 0.7, 1], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Número 404 grande con degradado de marca */}
          <motion.h1
            className="bg-gradient-to-b from-accent-soft to-accent bg-clip-text font-display text-[clamp(80px,20vw,150px)] font-extrabold leading-none text-transparent"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            404
          </motion.h1>

          <motion.h2
            className="mt-2 font-display text-[clamp(20px,4vw,26px)] font-bold text-ink"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            ¡Ups! Esta página se perdió en el espacio digital
          </motion.h2>

          <motion.p
            className="mx-auto mt-3 max-w-[46ch] text-[15.5px] text-muted"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
          >
            No encontramos lo que buscabas. Puede que el enlace haya cambiado o ya
            no exista. Pero tranquilo, te ayudamos a volver al camino. 🚀
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26, ease: "easeOut" }}
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 font-display text-[15.5px] font-bold text-white shadow-[0_14px_30px_-10px_rgba(0,0,0,0.6)] transition hover:brightness-110 active:scale-[0.99]"
            >
              Volver al inicio
            </Link>
            <Link
              href="/diagnostico"
              className="text-[14.5px] text-accent-soft hover:underline"
            >
              O haz tu diagnóstico gratis →
            </Link>
          </motion.div>
        </div>
      </AuroraBackground>
    </main>
  );
}
